import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai";
import { env, assertOpenAIAvailable } from "@/lib/env.server";
import { verifyQuota } from "@/lib/ai/quota";
import { createClient } from "@supabase/supabase-js";
import { InputSchema, OutputSchema, type GenerateQuestionsInput, type GenerateQuestionsOutput, type QuestionType, type BloomLevel } from "@/lib/ai/schemas";
import { fetchSkolverketObjectives } from "@/lib/ai/skolverket";
import { buildMessages } from "@/lib/ai/prompt";

function mapDifficultyToTemperature(difficulty: number): number {
  const t = 0.15 + 0.1 * (difficulty - 1);
  return Math.max(0.15, Math.min(0.7, t));
}

function normalizeOutput(raw: unknown, input: GenerateQuestionsInput): GenerateQuestionsOutput {
  const base: GenerateQuestionsOutput = { questions: [], warnings: [] };
  const obj = (raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}) as { questions?: unknown; warnings?: unknown };
  const list = Array.isArray(obj.questions) ? obj.questions : [];
  const normalized = list.map((q) => {
    const qq = (q && typeof q === "object" ? (q as Record<string, unknown>) : {}) as Record<string, unknown>;
    const type = (qq.type as QuestionType | undefined) ?? input.type ?? "open";
    const bloom = (qq.bloom as BloomLevel | undefined) ?? input.bloom ?? "understand";
    return {
      id: (qq.id as string) || crypto.randomUUID(),
      subject: (qq.subject as string) || input.subject,
      grade_band: (qq.grade_band as string) || input.gradeBand,
      topic: (qq.topic as string) || input.topic,
      difficulty: typeof qq.difficulty === "number" ? Math.max(1, Math.min(5, Math.trunc(qq.difficulty as number))) : input.difficulty,
      bloom,
      type,
      prompt: (qq.prompt as string) || String(qq.question || ""),
      options: Array.isArray(qq.options) ? (qq.options as unknown[]).map(String) : undefined,
      answer: (qq.answer as string | number) ?? (qq.correctIndex as number | undefined) ?? "",
      rationale: (qq.rationale as string) || (qq.explanation as string) || undefined,
      curriculum: Array.isArray(qq.curriculum) ? (qq.curriculum as Array<{ id: string; label: string }>) : [],
    };
  });

  const parsed = OutputSchema.safeParse({ questions: normalized, warnings: Array.isArray(obj.warnings) ? obj.warnings : [] });
  if (parsed.success) return parsed.data;
  return base;
}

export async function POST(req: NextRequest) {
  try {
    const keyCheck = assertOpenAIAvailable();
    if (!keyCheck.ok && env.nodeEnv === "production") {
      return NextResponse.json({ error: "AI-funktioner är inte konfigurerade på denna server." }, { status: 503 });
    }

    // Authenticate current user using Authorization header (Supabase JWT)
    const authHeader = req.headers.get("authorization") || "";
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Du måste vara inloggad för att använda AI-funktioner" }, { status: 401 });
    }

    // Quota check (resilient)
    const userId = authHeader.startsWith("Bearer ") ? "jwt" : "unknown"; // placeholder; can be expanded to decode JWT
    const quota = await verifyQuota({ userId, feature: "ai_generate" });
    if (!quota.ok) {
      if (quota.reason === "quota-exceeded") {
        return NextResponse.json({ code: "QUOTA_EXCEEDED", message: "Kvot slut." }, { status: 429 });
      }
      // otherwise allow (dev cases)
    }

    const json = await req.json();
    const input = InputSchema.parse(json);

    // Fetch curriculum objectives (robust fallback inside util)
    const curriculum = await fetchSkolverketObjectives(input.subject, input.gradeBand);

    // Build messages
    const messages = buildMessages(input, curriculum);

    // JSON Schema for response_format (aligned with OutputSchema)
    const responseJsonSchema = {
      name: "generate_questions_output",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          questions: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                subject: { type: "string" },
                grade_band: { type: "string", enum: ["ak1-3", "ak4-6", "ak7-9", "gy1", "gy2", "gy3"] },
                topic: { type: "string" },
                difficulty: { type: "integer", minimum: 1, maximum: 5 },
                bloom: { type: "string", enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"] },
                type: { type: "string", enum: ["mcq", "short", "numeric", "open"] },
                prompt: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                answer: { anyOf: [{ type: "string" }, { type: "number" }] },
                rationale: { type: "string" },
                curriculum: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "string" },
                      label: { type: "string" },
                    },
                    required: ["id", "label"],
                  },
                },
              },
              required: ["id", "subject", "grade_band", "topic", "difficulty", "bloom", "type", "prompt", "answer"],
            },
          },
          warnings: { type: "array", items: { type: "string" } },
        },
        required: ["questions"],
      },
      strict: true,
    } as const;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: mapDifficultyToTemperature(input.difficulty),
      max_tokens: 2000,
      response_format: { type: "json_schema", json_schema: responseJsonSchema },
    });

    const text = resp.choices[0]?.message?.content ?? "";
    let raw: unknown = {};
    try {
      raw = JSON.parse(text);
    } catch {
      raw = { questions: [] };
    }

    const normalized = normalizeOutput(raw, input);

    // Final validation
    const parsed = OutputSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validering av AI-svar misslyckades", details: parsed.error.flatten() },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (err: unknown) {
    const requestId = crypto.randomUUID();
    console.error(`[ai][${requestId}] error`, err);
    const message = err instanceof Error ? err.message : "Okänt fel";
    return NextResponse.json({ error: "Kunde inte generera frågor just nu.", details: message, requestId }, { status: 500 });
  }
}