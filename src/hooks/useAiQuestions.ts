import { useState } from "react";

type Flerval = {
  type: "flerval";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type Fritext = {
  type: "fritext";
  question: string;
  answerHint?: string;
  rubric?: string;
};

type Question = Flerval | Fritext;

type GenerateParams = {
  subject: string;
  grade: string;
  count?: number;
  type?: "flerval" | "fritext";
  difficulty?: "lätt" | "medel" | "svår";
  extraContext?: string;
};

export function useAiQuestions() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (params: GenerateParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try main API first, fallback to demo
      let response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count: 5,
          type: "flerval",
          difficulty: "medel",
          ...params,
        }),
      });

      // If main API fails, try demo API
      if (!response.ok && response.status === 503) {
        response = await fetch("/api/ai/generate-questions-demo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            count: 5,
            type: "flerval",
            difficulty: "medel",
            ...params,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle quota exceeded specifically
        if (response.status === 429 && errorData.code === 'QUOTA_EXCEEDED') {
          throw new Error('Du har nått din månadsgräns för AI-frågor');
        }
        
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      
      if (data.questions && Array.isArray(data.questions)) {
        // Add AI disclaimer to each question for teacher-in-the-loop
        const questionsWithDisclaimer = data.questions.map((q: Question) => ({
          ...q,
          aiGenerated: true,
          disclaimer: "Dubbelkolla alltid innehållet. AI kan ha fel."
        }));
        
        setQuestions(questionsWithDisclaimer);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ett okänt fel uppstod");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearQuestions = () => {
    setQuestions([]);
    setError(null);
  };

  return {
    questions,
    loading,
    error,
    generateQuestions,
    clearQuestions,
  };
}