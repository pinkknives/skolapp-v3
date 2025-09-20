#!/usr/bin/env node

/**
 * ETL script for Swedish curriculum data from Skolverket
 * Fetches, normalizes, chunks, and embeds curriculum content
 * 
 * Usage:
 *   node scripts/etl/skolverket.js --fresh  # Fresh import, clears existing data
 *   node scripts/etl/skolverket.js          # Incremental import
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate embeddings using OpenAI API
 */
async function generateEmbedding(text) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn('OpenAI API key not found, using mock embedding');
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
        input: text,
        model: 'text-embedding-3-small'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.warn('Failed to generate embedding via OpenAI, using mock:', error.message);
    // Fallback to mock embedding
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
}

/**
 * Chunk text into smaller segments for embedding
 */
function chunkText(text, maxTokens = 400) {
  // Simple tokenization estimate: ~4 characters per token for Swedish
  const maxChars = maxTokens * 4;
  const chunks = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  let spanStart = 0;
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
      // Finalize current chunk
      chunks.push({
        text: currentChunk.trim(),
        spanStart,
        spanEnd: spanStart + currentChunk.length
      });
      
      spanStart += currentChunk.length;
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      spanStart,
      spanEnd: spanStart + currentChunk.length
    });
  }
  
  return chunks;
}

/**
 * Check if feature is enabled
 */
function isFeatureEnabled() {
  return process.env.FEATURE_SYLLABUS === 'true';
}

/**
 * Fetch curriculum data from Skolverket API or fallback to mock data
 */
async function fetchCurriculumData() {
  if (!isFeatureEnabled()) {
    console.log('📢 FEATURE_SYLLABUS disabled, using fallback mode');
    return getMockCurriculumData();
  }

  try {
    // Import the Skolverket API client
    const { SkolverketApiClient } = await import('../src/lib/api/skolverket-client.js');
    const client = new SkolverketApiClient();
    
    // Test API connectivity
    console.log('🔍 Testing Skolverket API connectivity...');
    const isHealthy = await client.healthCheck();
    
    if (!isHealthy) {
      console.warn('⚠️  Skolverket API health check failed, falling back to mock data');
      return getMockCurriculumData();
    }

    console.log('✅ Skolverket API is accessible, fetching curriculum data...');
    
    // Get subjects for grundskola (primary school)
    const subjects = await client.getSubjects('grundskola');
    console.log(`📚 Found ${subjects.length} subjects from Skolverket API`);
    
    const curriculumData = { subjects: [] };
    
    // Process a subset of key subjects to avoid overwhelming the API
    const keySubjects = subjects.filter(s => 
      ['GRGRMAT01', 'GRGRSVE01', 'GRGRENG01', 'GRGRBIO01'].includes(s.code) ||
      s.name.toLowerCase().includes('matematik') ||
      s.name.toLowerCase().includes('svenska') ||
      s.name.toLowerCase().includes('engelska') ||
      s.name.toLowerCase().includes('biologi')
    ).slice(0, 5); // Limit to 5 subjects for initial import
    
    for (const subject of keySubjects) {
      console.log(`📖 Fetching curriculum for ${subject.name} (${subject.code})`);
      
      try {
        const curriculum = await client.getSubjectCurriculum(subject.code);
        
        // Transform API data to our internal format
        const subjectData = {
          name: curriculum.subject.name,
          code: curriculum.subject.code,
          coreContent: {},
          knowledgeRequirements: {}
        };
        
        // Group central content by grade span
        const contentByGrade = {};
        curriculum.centralContent.forEach(content => {
          if (!contentByGrade[content.gradeSpan]) {
            contentByGrade[content.gradeSpan] = [];
          }
          contentByGrade[content.gradeSpan].push({
            title: content.title,
            body: content.body,
            sourceUrl: content.sourceUrl,
            version: content.version
          });
        });
        subjectData.coreContent = contentByGrade;
        
        // Group knowledge requirements by grade span and level
        const requirementsByGrade = {};
        curriculum.knowledgeRequirements.forEach(req => {
          if (!requirementsByGrade[req.gradeSpan]) {
            requirementsByGrade[req.gradeSpan] = [];
          }
          requirementsByGrade[req.gradeSpan].push({
            grade: req.gradeLevel,
            body: req.body,
            sourceUrl: req.sourceUrl,
            version: req.version
          });
        });
        subjectData.knowledgeRequirements = requirementsByGrade;
        
        curriculumData.subjects.push(subjectData);
        
        // Add delay between API calls to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to fetch curriculum for ${subject.name}:`, error.message);
        // Continue with other subjects
      }
    }
    
    console.log(`✅ Successfully fetched data for ${curriculumData.subjects.length} subjects from API`);
    return curriculumData;
    
  } catch (error) {
    console.error('❌ Error accessing Skolverket API:', error.message);
    console.log('📦 Falling back to mock curriculum data');
    return getMockCurriculumData();
  }
}

/**
 * Mock Skolverket curriculum data (fallback when API unavailable)
 */
function getMockCurriculumData() {
  return {
  subjects: [
    {
      name: 'Matematik',
      code: 'GRGRMAT01',
      coreContent: {
        '1-3': [
          {
            title: 'Tal och algebra',
            body: 'Naturliga tal och deras egenskaper samt hur de kan delas upp och hur de förhåller sig till varandra. Tal i bråkform som del av helhet och del av antal. Hur delarna förhåller sig till helheten och till varandra samt olika sätt att uttrycka samma del.'
          },
          {
            title: 'Geometri',
            body: 'Grundläggande geometriska objekt, till exempel fyrhörninga, trianglar, cirklar, klot, koner, cylindrar och kuber samt deras inbördes relationer. Rumsuppfattning och symmetri.'
          }
        ],
        '4-6': [
          {
            title: 'Tal och algebra',
            body: 'Rationella tal och deras egenskaper samt deras användning i vardagliga situationer. Tal i exponentialform. Metoder för beräkningar med naturliga tal och rationella tal - överslagsräkning, huvudräkning, skriftliga metoder och miniräknare samt deras användning i olika situationer.'
          }
        ],
        '7-9': [
          {
            title: 'Tal och algebra',
            body: 'Reella tal och deras egenskaper samt deras användning i vardagliga och matematiska situationer. Metoder för beräkningar inom aritmetiken och algebran, inklusive förenkling av algebraiska uttryck. Användning av kalkylprogram för beräkning och uttryck.'
          }
        ]
      },
      knowledgeRequirements: {
        '1-3': [
          {
            grade: 'E',
            body: 'Eleven kan använda naturliga tal för att ange antal och ordning. I enkla situationer kan eleven lösa matematiska problem genom att välja och använda någon strategi med viss anpassning till problemets karaktär.'
          },
          {
            grade: 'C', 
            body: 'Eleven kan använda naturliga tal för att ange antal och ordning samt som tal på tallinjen. I bekanta situationer kan eleven lösa matematiska problem genom att välja och använda strategier med förhållandevis god anpassning till problemets karaktär.'
          },
          {
            grade: 'A',
            body: 'Eleven kan använda naturliga tal för att ange antal och ordning samt som tal på tallinjen och förstår tals inbördes relation. I nya situationer kan eleven lösa matematiska problem genom att välja och använda strategier med god anpassning till problemets karaktär.'
          }
        ]
      }
    },
    {
      name: 'Svenska',
      code: 'GRGRSVEA01',
      coreContent: {
        '1-3': [
          {
            title: 'Läsa och skriva',
            body: 'Lässtrategier för att förstå och tolka texter från olika medier samt för att urskilja texters budskap, syfte och avsändare. Strategier för att skriva olika typer av texter med anpassning till deras typiska uppbyggnad och språkliga drag.'
          }
        ],
        '4-6': [
          {
            title: 'Läsa och skriva',
            body: 'Lässtrategier för att förstå, tolka och analysera texter från olika medier. Syftet med att läsa och de olika strategiernas användning beroende på det. Strategier för att skriva olika typer av texter med anpassning till deras typiska uppbyggnad och språkliga drag.'
          }
        ]
      },
      knowledgeRequirements: {
        '1-3': [
          {
            grade: 'E',
            body: 'Eleven kan läsa bekanta och elevnära texter genom att använda lässtrategier på ett i huvudsak fungerande sätt. Genom att svara på frågor om och återberätta texter visar eleven grundläggande läsförståelse.'
          }
        ]
      }
    }
  ]
};

/**
 * Process and import curriculum data
 */
async function processCurriculumData(fresh = false) {
  console.log('🔄 Starting curriculum data processing...');
  
  if (fresh) {
    console.log('🧹 Clearing existing knowledge base data...');
    // Clear in reverse order due to foreign keys
    await supabase.from('chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('knowledge_requirements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('core_content').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('source_docs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Cleared existing data');
  }
  
  // Fetch curriculum data (from API or fallback to mock)
  const curriculumData = await fetchCurriculumData();
  
  for (const subjectData of curriculumData.subjects) {
    console.log(`📚 Processing subject: ${subjectData.name}`);
    
    // Get or create subject
    let { data: subject } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', subjectData.name)
      .single();
    
    if (!subject) {
      const { data: newSubject, error } = await supabase
        .from('subjects')
        .insert({
          name: subjectData.name,
          code: subjectData.code
        })
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error creating subject ${subjectData.name}:`, error);
        continue;
      }
      subject = newSubject;
    }
    
    // Create source document for this subject's curriculum
    const { data: sourceDoc, error: sourceError } = await supabase
      .from('source_docs')
      .insert({
        title: `Läroplan ${subjectData.name} - Skolverket`,
        url: `https://www.skolverket.se/undervisning/grundskolan/laroplan-och-kursplaner-for-grundskolan/${subjectData.code?.toLowerCase()}`,
        license: 'Skolverket - Offentlig handling',
        source: 'Skolverket',
        language: 'sv',
        content_type: 'subject_plan',
        metadata: {
          subject_code: subjectData.code,
          import_date: new Date().toISOString()
        }
      })
      .select('id')
      .single();
    
    if (sourceError) {
      console.error(`Error creating source doc for ${subjectData.name}:`, sourceError);
      continue;
    }
    
    // Process core content
    for (const [gradeBand, contents] of Object.entries(subjectData.coreContent)) {
      for (const content of contents) {
        // Insert core content
        const { data: coreContent, error: contentError } = await supabase
          .from('core_content')
          .insert({
            subject_id: subject.id,
            grade_band: gradeBand,
            title: content.title,
            body: content.body,
            source_doc_id: sourceDoc.id
          })
          .select('id')
          .single();
        
        if (contentError) {
          console.error(`Error creating core content:`, contentError);
          continue;
        }
        
        // Chunk and embed the content
        const fullText = `${content.title}\n\n${content.body}`;
        const chunks = chunkText(fullText);
        
        for (const chunk of chunks) {
          const embedding = await generateEmbedding(chunk.text);
          
          await supabase.from('chunks').insert({
            source_id: sourceDoc.id,
            span_start: chunk.spanStart,
            span_end: chunk.spanEnd,
            text_content: chunk.text,
            embedding: JSON.stringify(embedding),
            token_count: Math.ceil(chunk.text.length / 4), // Rough estimate
            metadata: {
              content_type: 'core_content',
              subject: subjectData.name,
              grade_band: gradeBand,
              content_title: content.title
            }
          });
        }
      }
    }
    
    // Process knowledge requirements
    if (subjectData.knowledgeRequirements) {
      for (const [gradeBand, requirements] of Object.entries(subjectData.knowledgeRequirements)) {
        for (const req of requirements) {
          // Insert knowledge requirement
          const { error: reqError } = await supabase
            .from('knowledge_requirements')
            .insert({
              subject_id: subject.id,
              grade_band: gradeBand,
              grade_level: req.grade,
              body: req.body,
              source_doc_id: sourceDoc.id
            });
          
          if (reqError) {
            console.error(`Error creating knowledge requirement:`, reqError);
            continue;
          }
          
          // Chunk and embed the requirement
          const chunks = chunkText(req.body);
          
          for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk.text);
            
            await supabase.from('chunks').insert({
              source_id: sourceDoc.id,
              span_start: chunk.spanStart,
              span_end: chunk.spanEnd,
              text_content: chunk.text,
              embedding: JSON.stringify(embedding),
              token_count: Math.ceil(chunk.text.length / 4),
              metadata: {
                content_type: 'knowledge_requirement',
                subject: subjectData.name,
                grade_band: gradeBand,
                grade_level: req.grade
              }
            });
          }
        }
      }
    }
    
    console.log(`✅ Completed processing ${subjectData.name}`);
  }
  
  // Update metadata with successful sync info
  const syncMetadata = {
    last_successful_sync: new Date().toISOString(),
    subjects_processed: curriculumData.subjects.length,
    api_source: isFeatureEnabled() ? 'skolverket_api' : 'mock_data',
    etl_version: '1.0.0'
  };
  
  // Store metadata in a dedicated table or use JSON storage
  await supabase
    .from('source_docs')
    .upsert({
      id: '00000000-0000-0000-0000-000000000001', // Special UUID for metadata
      title: 'ETL Sync Metadata',
      source: 'skolapp_etl',
      language: 'sv',
      content_type: 'metadata',
      metadata: syncMetadata
    });
  
  console.log('🎉 ETL process completed successfully!');
  console.log(`📊 Processed ${curriculumData.subjects.length} subjects using ${syncMetadata.api_source}`);
}

/**
 * Display usage statistics
 */
async function showStats() {
  const { data: sourceCount } = await supabase
    .from('source_docs')
    .select('id', { count: 'exact' });
  
  const { data: chunkCount } = await supabase
    .from('chunks')
    .select('id', { count: 'exact' });
  
  const { data: subjectCount } = await supabase
    .from('subjects')
    .select('id', { count: 'exact' });
  
  console.log('\n📊 Knowledge Base Statistics:');
  console.log(`   Source Documents: ${sourceCount?.length || 0}`);
  console.log(`   Text Chunks: ${chunkCount?.length || 0}`);
  console.log(`   Subjects: ${subjectCount?.length || 0}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const fresh = args.includes('--fresh');
  
  console.log('🚀 Starting Skolverket ETL process...');
  
  try {
    await processCurriculumData(fresh);
    await showStats();
  } catch (error) {
    console.error('❌ ETL process failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}