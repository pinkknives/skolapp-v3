import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai, isOpenAIAvailable } from "@/lib/ai/openai";
import { supabaseBrowser } from "@/lib/supabase-browser";

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
    // Check if OpenAI is available
    if (!isOpenAIAvailable) {
      return NextResponse.json(
        { error: "AI-funktioner är inte konfigurerade på denna server." },
        { status: 503 }
      );
    }

    // Get current user
    const supabase = supabaseBrowser();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda AI-funktioner' },
        { status: 401 }
      );
    }

    // Check and increment quota BEFORE making AI call
    const quotaResponse = await fetch(`${req.nextUrl.origin}/api/ai/usage`, {
      method: 'POST',
      headers: { 
        'authorization': req.headers.get('authorization') || '',
        'content-type': 'application/json'
      }
    });

    if (quotaResponse.status === 429) {
      const quotaData = await quotaResponse.json();
      return NextResponse.json(quotaData, { status: 429 });
    }

    if (!quotaResponse.ok) {
      return NextResponse.json(
        { error: 'Kunde inte verifiera AI-kvot' },
        { status: 500 }
      );
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
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "Kunde inte generera frågor just nu." },
      { status: 500 }
    );
  }
}