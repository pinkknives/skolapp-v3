import type { GenerateQuestionsInput, CurriculumRef } from "./schemas";

export type ChatMessage = {
  role: "system" | "developer" | "user";
  content: string;
};

export function buildMessages(
  input: GenerateQuestionsInput,
  curriculum: CurriculumRef[]
): ChatMessage[] {
  const { gradeBand, subject, topic, subtopic, difficulty, bloom, type, count, extra } = input;

  const system = `Du är en svensk lärarassistent som följer Lgr22/Gy11.
Skriv åldersanpassade frågor på svenska. Returnera ENBART giltig JSON enligt utvecklarinstruktionen.
Respektera elevintegritet och tydlighet i språkbruk.`;

  const developer = `Returnera exakt JSON enligt detta schema:
{
  "questions": [
    {
      "id": "string",
      "subject": "string",
      "grade_band": "ak1-3|ak4-6|ak7-9|gy1|gy2|gy3",
      "topic": "string",
      "difficulty": 1,
      "bloom": "remember|understand|apply|analyze|evaluate|create",
      "type": "mcq|short|numeric|open",
      "prompt": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string|number",
      "rationale": "string",
      "curriculum": [{ "id": "string", "label": "string" }]
    }
  ],
  "warnings": ["string"]
}

Regler:
- Antal frågor: exakt ${count}.
- Om typ är "mcq": 3–5 välbalanserade distraktorer, en tydlig korrekt.
- Anpassa svårighetsgrad (${difficulty}) till djup i distraktorer och krav på resonemang.
- Inkludera kort "rationale" som förklaring till svaret när rimligt.
- Knyt varje fråga till minst 1 relevant curriculum-punkt (om lista finns).`;

  const curriculumList = curriculum
    .slice(0, 20)
    .map((c) => `- ${c.id}: ${c.label}`)
    .join("\n");

  const user = `Ämne: ${subject}
Årskurs/Spann: ${gradeBand}
Område: ${topic}${subtopic ? ` → ${subtopic}` : ""}
Svårighet (1..5): ${difficulty}${bloom ? `\nBloom: ${bloom}` : ""}${type ? `\nFrågetyp: ${type}` : ""}
Antal frågor: ${count}
${extra ? `Extra instruktioner: ${extra}\n` : ""}
Curriculum (förslag):\n${curriculumList || "(saknas)"}`;

  return [
    { role: "system", content: system },
    { role: "developer", content: developer },
    { role: "user", content: user },
  ];
}


