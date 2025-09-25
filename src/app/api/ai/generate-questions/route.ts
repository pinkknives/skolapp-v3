import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/ai/openai";
import { env, assertOpenAIAvailable } from '@/lib/env.server'
import { verifyQuota } from '@/lib/ai/quota'
import { createClient } from "@supabase/supabase-js";

const bodySchema = z.object({
  subject: z.string().min(1),
  grade: z.string().min(1),
  count: z.number().int().min(1).max(20).default(5),
  type: z.enum(["flerval", "fritext"]).default("flerval"),
  difficulty: z.enum(["lätt", "medel", "svår"]).default("medel"),
  extraContext: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const keyCheck = assertOpenAIAvailable()
    if (!keyCheck.ok && env.nodeEnv === 'production') {
      return NextResponse.json({ code: 'MISSING_API_KEY', message: 'AI-funktioner är inte konfigurerade.' }, { status: 503 })
    }

    // Authenticate current user using Authorization header (Supabase JWT)
    const authHeader = req.headers.get('authorization') || ''
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda AI-funktioner' },
        { status: 401 }
      );
    }

    // Quota check (resilient)
    const userId = authHeader.startsWith('Bearer ') ? 'jwt' : 'unknown' // placeholder; can be expanded to decode JWT
    const quota = await verifyQuota({ userId, feature: 'ai_generate' })
    if (!quota.ok) {
      if (quota.reason === 'quota-exceeded') {
        return NextResponse.json({ code: 'QUOTA_EXCEEDED', message: 'Kvot slut.' }, { status: 429 })
      }
      // otherwise allow (dev cases)
    }

    const json = await req.json();
    const input = bodySchema.parse(json);

    const system = `Du är en svensk lärarassistent. Skapa tydliga, korrekta quizfrågor på svenska.
Anpassa språket till ${input.grade} och ämnet ${input.subject}.
Returnera endast JSON i strukturen: { "questions": Question[] }
Question (flerval):
{ "type":"flerval", "question":"...", "options":["A","B","C","D"], "correctIndex": 1, "explanation":"..." }
Question (fritext):
{ "type":"fritext", "question":"...", "answerHint":"...", "rubric":"kort bedömningsmatris" }`;

    const user_prompt = `
Skapa ${input.count} frågor.
Typ: ${input.type}. Svårighetsgrad: ${input.difficulty}.
${input.extraContext ? `Extra kontext: ${input.extraContext}` : ""}
Returnera ENBART giltig JSON.`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // bra balans kostnad/kvalitet
      messages: [
        { role: "system", content: system },
        { role: "user", content: user_prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      // Säker output: be om JSON
      response_format: { type: "json_object" }
    });

    // Hämta textsvaret
    const text = resp.choices[0]?.message?.content ?? "";
    
    // Post-validate JSON
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      // fallback: leta första { ... } block
      const match = text.match(/{[\s\S]*}$/);
      data = match ? JSON.parse(match[0]) : { questions: [] };
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const requestId = crypto.randomUUID()
    console.error(`[ai][${requestId}] error`, err)
    const message = err instanceof Error ? err.message : 'Okänt fel'
    return NextResponse.json({ code: 'OPENAI_ERROR', message, requestId }, { status: 502 })
  }
}