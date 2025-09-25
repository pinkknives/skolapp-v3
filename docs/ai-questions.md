## AI-frågor – användning

API-route: `app/api/ai/generate-questions/route.ts`

Skicka POST med:

```json
{
  "gradeBand": "ak1-3|ak4-6|ak7-9|gy1|gy2|gy3",
  "subject": "matematik",
  "topic": "algebra",
  "subtopic": "uttryck",
  "difficulty": 1,
  "bloom": "understand",
  "type": "mcq|short|numeric|open",
  "count": 5,
  "language": "sv",
  "extra": "ev. instruktioner"
}
```

Svar (validerad JSON):

```json
{
  "questions": [
    {
      "id": "...",
      "subject": "matematik",
      "grade_band": "ak7-9",
      "topic": "algebra",
      "difficulty": 3,
      "bloom": "understand",
      "type": "mcq",
      "prompt": "Vad är 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "answer": 1,
      "rationale": "2 + 2 = 4",
      "curriculum": [{ "id": "M7.1", "label": "Algebraiska uttryck" }]
    }
  ],
  "warnings": []
}
```

Notes:
- Skolverket-mål hämtas via `NEXT_PUBLIC_SKOLVERKET_API_URL`; fallback till tom lista vid fel.
- Saknade fält normaliseras (id/bloom/type/curriculum). Temperatur mappas från svårighet.
- Används i UI via `ApiQuizProvider` som skickar ovanstående schema.


