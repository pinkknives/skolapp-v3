/**
 * RAG Service - Client-side utility for retrieving curriculum context
 * Used by AI providers to enhance question generation with Swedish curriculum data
 */

export interface RAGContext {
  chunkId: string;
  text: string;
  score: number;
  source: {
    id: string;
    title: string;
    url: string | null;
    license: string | null;
  };
}

export interface RAGResponse {
  retrieved: RAGContext[];
  query: {
    subject: string;
    gradeBand: string;
    keywords?: string;
  };
  performance: {
    retrievalTime: number;
    resultsCount: number;
  };
}

/**
 * Convert grade format for RAG queries
 */
function convertGradeToGradeBand(grade: string): string {
  // Convert "Åk 1", "Åk 2" etc. to grade bands used in curriculum
  const gradeMatch = grade.match(/(\d+)/);
  if (!gradeMatch) return '1-3'; // Default fallback
  
  const gradeNum = parseInt(gradeMatch[1]);
  
  if (gradeNum >= 1 && gradeNum <= 3) return '1-3';
  if (gradeNum >= 4 && gradeNum <= 6) return '4-6';
  if (gradeNum >= 7 && gradeNum <= 9) return '7-9';
  if (gradeNum >= 10) return 'Gy'; // Gymnasium
  
  return '1-3'; // Default fallback
}

/**
 * Retrieve curriculum context via RAG
 */
export async function retrieveCurriculumContext(
  subject: string,
  grade: string,
  keywords?: string,
  k: number = 6
): Promise<RAGContext[]> {
  try {
    const gradeBand = convertGradeToGradeBand(grade);
    
    const response = await fetch('/api/rag/quiz/context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        gradeBand,
        keywords,
        k
      }),
    });
    
    if (!response.ok) {
      console.warn('RAG retrieval failed:', response.status);
      return [];
    }
    
    const data: RAGResponse = await response.json();
    return data.retrieved;
    
  } catch (error) {
    console.warn('RAG retrieval error:', error);
    return [];
  }
}

/**
 * Build enhanced prompt with RAG context
 */
export function buildRAGEnhancedPrompt(
  basePrompt: string,
  context: RAGContext[],
  requirements: {
    subject: string;
    grade: string;
    count: number;
    type: 'multiple-choice' | 'free-text';
    difficulty: 'easy' | 'medium' | 'hard';
  }
): string {
  if (context.length === 0) {
    return basePrompt;
  }
  
  const contextBlocks = context
    .map((c, i) => `[Källa ${i + 1}] ${c.text}`)
    .join('\n\n');
  
  const sourceList = context
    .map((c, i) => `[${i + 1}] ${c.source.title} (ID: ${c.source.id})`)
    .join('\n');
  
  return `Du är en svensk ämneslärare. Skapa ${requirements.count} ${requirements.type === 'multiple-choice' ? 'flervalsfrâgor' : 'fritextfrågor'} för ${requirements.subject} på ${requirements.grade} nivå med ${requirements.difficulty} svårighetsgrad.

VIKTIGT: Använd ENDAST tillhandahållna utdrag ur kurs-/läroplaner som kontext. Basera frågorna på det centrala innehållet och kunskapskraven nedan.

KÄLLOR:
${sourceList}

INNEHÅLL FRÅN LÄROPLANER:
${contextBlocks}

${basePrompt}

KRAV PÅ SVARET:
- Inkludera alltid "citations" med sourceId för källor som användes
- Lägg till kort "explanation" som förklarar kopplingen till läroplanen
- Om kontexten inte räcker: returnera { "insufficient_context": true }
- Alla frågor ska vara på svenska och pedagogiskt lämpliga för årskurs ${requirements.grade}

Dubbelkolla alltid innehållet. AI kan ha fel.`;
}

/**
 * Extract citations from AI response
 */
export function extractCitations(
  response: any,
  availableContext: RAGContext[]
): any {
  if (!response.citations || !Array.isArray(response.citations)) {
    return response;
  }
  
  // Validate and enrich citations with source information
  const validatedCitations = response.citations
    .map((citation: any) => {
      const sourceContext = availableContext.find(c => c.source.id === citation.sourceId);
      if (!sourceContext) return null;
      
      return {
        sourceId: citation.sourceId,
        sourceTitle: sourceContext.source.title,
        sourceUrl: sourceContext.source.url,
        license: sourceContext.source.license,
        span: citation.span || sourceContext.text.substring(0, 100) + '...'
      };
    })
    .filter(Boolean);
  
  return {
    ...response,
    citations: validatedCitations
  };
}