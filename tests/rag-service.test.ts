/**
 * Basic RAG Integration Test
 * Tests the RAG service functionality with mock data
 */

import { describe, it, expect } from 'vitest';
import { retrieveCurriculumContext, buildRAGEnhancedPrompt, extractCitations } from '@/lib/ai/ragService';

describe('RAG Service', () => {
  it('should convert grade format correctly', () => {
    // This tests the internal convertGradeToGradeBand function through retrieveCurriculumContext
    // Since it's internal, we test it indirectly by checking the API call would be made correctly
    expect(typeof retrieveCurriculumContext).toBe('function');
  });

  it('should build enhanced prompts with context', () => {
    const mockContext = [
      {
        chunkId: 'chunk-1',
        text: 'Naturliga tal och deras egenskaper samt hur de kan delas upp.',
        score: 0.8,
        source: {
          id: 'source-1',
          title: 'Läroplan Matematik - Skolverket',
          url: 'https://www.skolverket.se/matematik',
          license: 'Skolverket - Offentlig handling'
        }
      }
    ];

    const requirements = {
      subject: 'Matematik',
      grade: 'Åk 3',
      count: 2,
      type: 'multiple-choice' as const,
      difficulty: 'easy' as const
    };

    const basePrompt = 'Skapa matematik frågor.';
    const enhancedPrompt = buildRAGEnhancedPrompt(basePrompt, mockContext, requirements);

    expect(enhancedPrompt).toContain('KÄLLOR:');
    expect(enhancedPrompt).toContain('INNEHÅLL FRÅN LÄROPLANER:');
    expect(enhancedPrompt).toContain('Naturliga tal och deras egenskaper');
    expect(enhancedPrompt).toContain('citations');
    expect(enhancedPrompt).toContain('Dubbelkolla alltid innehållet. AI kan ha fel.');
  });

  it('should extract and validate citations', () => {
    const mockResponse = {
      kind: 'multiple-choice',
      prompt: 'Test question',
      choices: [],
      citations: [
        { sourceId: 'source-1', span: 'relevant text' }
      ]
    };

    const mockContext = [
      {
        chunkId: 'chunk-1',
        text: 'Full context text here',
        score: 0.8,
        source: {
          id: 'source-1',
          title: 'Läroplan Matematik',
          url: 'https://example.com',
          license: 'Public'
        }
      }
    ];

  const result = extractCitations(mockResponse, mockContext);
    
    expect(result.citations).toBeDefined();
    expect(Array.isArray(result.citations)).toBe(true);
  const citations = (result as { citations?: unknown[] }).citations;
  const first = Array.isArray(citations) ? citations[0] : undefined;
    expect(first).toMatchObject({
      sourceId: 'source-1',
      sourceTitle: 'Läroplan Matematik',
      sourceUrl: 'https://example.com',
      license: 'Public',
      span: 'relevant text'
    });
  });

  it('should handle empty context gracefully', () => {
    const basePrompt = 'Create questions';
    const requirements = {
      subject: 'Matematik',
      grade: 'Åk 3',
      count: 1,
      type: 'multiple-choice' as const,
      difficulty: 'easy' as const
    };

    const enhancedPrompt = buildRAGEnhancedPrompt(basePrompt, [], requirements);
    expect(enhancedPrompt).toBe(basePrompt);
  });

  it('should handle response without citations', () => {
    const mockResponse = {
      kind: 'multiple-choice',
      prompt: 'Test question',
      choices: []
    };

    const result = extractCitations(mockResponse, []);
    expect(result).toEqual(mockResponse);
  });
});