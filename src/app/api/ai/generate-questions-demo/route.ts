import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
    // Get current user
    const supabase = supabaseBrowser();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda AI-funktioner' },
        { status: 401 }
      );
    }

    const json = await req.json();
    const input = bodySchema.parse(json);

    // Generate demo questions
    const questions = [];
    
    for (let i = 0; i < input.count; i++) {
      const questionNumber = i + 1;
      
      if (input.type === 'flerval') {
        questions.push({
          type: 'flerval',
          question: `Demo-fråga ${questionNumber}: Vad är huvudtanken i ${input.subject} för ${input.grade}? (${input.difficulty} svårighetsgrad)`,
          options: [
            'Alternativ A - Korrekt svar',
            'Alternativ B - Felaktigt svar',
            'Alternativ C - Felaktigt svar', 
            'Alternativ D - Felaktigt svar'
          ],
          correctIndex: 0,
          explanation: 'Detta är en demo-fråga. Kontrollera svaret manuellt.'
        });
      } else {
        questions.push({
          type: 'fritext',
          question: `Demo-fråga ${questionNumber}: Beskriv kort ${input.subject} för ${input.grade} (${input.difficulty} svårighetsgrad)`,
          answerHint: 'Exempelsvar: Detta är en demo-fråga som kräver fritextsvar.',
          rubric: 'Demo-bedömning: Kontrollera svaret manuellt mot läroplanen.'
        });
      }
    }

    return NextResponse.json({ questions });
  } catch (err: unknown) {
    console.error("Demo AI error:", err);
    return NextResponse.json(
      { error: "Kunde inte generera demo-frågor just nu." },
      { status: 500 }
    );
  }
}
