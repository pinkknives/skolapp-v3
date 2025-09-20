import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase-browser';

/**
 * RAG Context Retrieval for Quiz Generation
 * POST /api/rag/quiz/context
 * 
 * Retrieves relevant curriculum content chunks based on subject, grade, and optional keywords
 * Uses hybrid search (semantic + lexical) to find the most relevant educational content
 */

interface RAGRequest {
  subject: string;
  gradeBand: string; // "1-3", "4-6", "7-9", etc.
  keywords?: string;
  k?: number; // Number of results to return (default: 6)
}

interface RAGResponse {
  retrieved: Array<{
    chunkId: string;
    text: string;
    score: number;
    source: {
      id: string;
      title: string;
      url: string | null;
      license: string | null;
    };
  }>;
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
 * Generate embedding for search query
 */
async function generateQueryEmbedding(queryText: string): Promise<number[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('OpenAI API key not found, using mock embedding for search');
    // Return mock embedding for development
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: queryText,
        model: 'text-embedding-3-small'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.warn('Failed to generate embedding via OpenAI, using mock:', error);
    // Fallback to mock embedding
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const supabase = supabaseBrowser();
    const body: RAGRequest = await request.json();
    
    const { subject, gradeBand, keywords = '', k = 6 } = body;
    
    // Validate required parameters
    if (!subject || !gradeBand) {
      return NextResponse.json(
        { error: 'Ämne och årskurs krävs' },
        { status: 400 }
      );
    }
    
    // Build search query
    const queryParts = [subject, gradeBand];
    if (keywords.trim()) {
      queryParts.push(keywords.trim());
    }
    const queryText = queryParts.join(' ');
    
    // Generate embedding for semantic search
    const queryEmbedding = await generateQueryEmbedding(queryText);
    
    // Perform hybrid search using the database function
    const { data: searchResults, error } = await supabase
      .rpc('search_curriculum_content', {
        query_text: queryText,
        query_embedding: JSON.stringify(queryEmbedding),
        subject_filter: subject,
        grade_filter: gradeBand,
        similarity_threshold: 0.6, // Lower threshold for better recall
        max_results: k
      });
    
    if (error) {
      console.error('Database search error:', error);
      
      // Fallback to simple text search if hybrid search fails
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('chunks')
        .select(`
          id,
          source_id,
          text_content,
          metadata,
          source_docs!inner (
            id,
            title,
            url,
            license
          )
        `)
        .textSearch('text_content', queryText, {
          type: 'websearch',
          config: 'swedish'
        })
        .limit(k);
      
      if (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        return NextResponse.json(
          { error: 'Sökningen misslyckades' },
          { status: 500 }
        );
      }
      
      // Format fallback results
      const retrieved = (fallbackResults || []).map((result: any) => ({
        chunkId: result.id,
        text: result.text_content,
        score: 0.5, // Default score for fallback
        source: {
          id: result.source_docs.id,
          title: result.source_docs.title,
          url: result.source_docs.url,
          license: result.source_docs.license
        }
      }));
      
      const response: RAGResponse = {
        retrieved,
        query: { subject, gradeBand, keywords },
        performance: {
          retrievalTime: Date.now() - startTime,
          resultsCount: retrieved.length
        }
      };
      
      return NextResponse.json(response);
    }
    
    // Format search results
    const retrieved = (searchResults || []).map((result: any) => ({
      chunkId: result.chunk_id,
      text: result.text_content,
      score: result.rank_score || result.similarity_score || 0,
      source: {
        id: result.source_id,
        title: result.source_title,
        url: result.source_url,
        license: result.source_license
      }
    }));
    
    const response: RAGResponse = {
      retrieved,
      query: { subject, gradeBand, keywords },
      performance: {
        retrievalTime: Date.now() - startTime,
        resultsCount: retrieved.length
      }
    };
    
    // Log successful retrieval for monitoring
    console.log(`RAG retrieval: ${retrieved.length} results in ${response.performance.retrievalTime}ms for "${queryText}"`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('RAG context retrieval error:', error);
    return NextResponse.json(
      { error: 'Ett fel inträffade vid hämtning av innehåll' },
      { status: 500 }
    );
  }
}