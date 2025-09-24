-- RAG Knowledge Base for Swedish Curriculum
-- Implements source documents, chunks, and curriculum taxonomy for AI question generation

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Source documents table - stores original curriculum documents and OER
create table if not exists public.source_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  license text, -- CC, MIT, Skolverket, etc.
  source text not null, -- "Skolverket", "OER:KTH", etc.
  language text not null default 'sv',
  content_type text not null check (content_type in ('curriculum', 'subject_plan', 'course_plan', 'oer')),
  text_content text, -- original full text (if license permits)
  metadata jsonb default '{}', -- additional structured data
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Text chunks for vector search
create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.source_docs(id) on delete cascade,
  span_start int not null,
  span_end int not null,
  text_content text not null,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  token_count int,
  metadata jsonb default '{}', -- chunk-specific metadata
  created_at timestamptz default now(),
  
  -- Index for vector similarity search
  unique(source_id, span_start, span_end)
);

-- Swedish curriculum subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- "Matematik", "Svenska", etc.
  code text, -- Skolverket subject code if available
  description text,
  created_at timestamptz default now(),
  
  unique(name)
);

-- Core content areas (Centralt innehåll)
create table if not exists public.core_content (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  grade_band text not null, -- "1-3", "4-6", "7-9", "Gy"
  title text not null,
  body text not null,
  source_doc_id uuid references public.source_docs(id) on delete set null,
  created_at timestamptz default now()
);

-- Knowledge requirements (Kunskapskrav)
create table if not exists public.knowledge_requirements (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  grade_band text not null,
  grade_level text check (grade_level in ('E', 'C', 'A')), -- E=godkänd, C=väl godkänd, A=mycket väl godkänd
  body text not null,
  source_doc_id uuid references public.source_docs(id) on delete set null,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_chunks_source_id on public.chunks(source_id);
create index if not exists idx_chunks_embedding on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_core_content_subject_grade on public.core_content(subject_id, grade_band);
create index if not exists idx_knowledge_req_subject_grade on public.knowledge_requirements(subject_id, grade_band);

-- RLS policies for knowledge base
alter table public.source_docs enable row level security;
alter table public.chunks enable row level security;
alter table public.subjects enable row level security;
alter table public.core_content enable row level security;
alter table public.knowledge_requirements enable row level security;

-- Read-only access for all authenticated users (knowledge base is public curriculum data)
create policy "knowledge base read access" on public.source_docs for select using (true);
create policy "chunks read access" on public.chunks for select using (true);
create policy "subjects read access" on public.subjects for select using (true);
create policy "core content read access" on public.core_content for select using (true);
create policy "knowledge requirements read access" on public.knowledge_requirements for select using (true);

-- Admin/system can insert/update knowledge base data
create policy "admin can manage source docs" on public.source_docs for all using (
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and u.email like '%@skolapp.se'
  )
);

create policy "admin can manage chunks" on public.chunks for all using (
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and u.email like '%@skolapp.se'
  )
);

create policy "admin can manage subjects" on public.subjects for all using (
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and u.email like '%@skolapp.se'
  )
);

create policy "admin can manage core content" on public.core_content for all using (
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and u.email like '%@skolapp.se'
  )
);

create policy "admin can manage knowledge requirements" on public.knowledge_requirements for all using (
  exists (
    select 1 from auth.users u 
    where u.id = auth.uid() 
    and u.email like '%@skolapp.se'
  )
);

-- Create function for hybrid search (semantic + lexical)
create or replace function search_curriculum_content(
  query_text text,
  query_embedding vector(1536),
  subject_filter text default null,
  grade_filter text default null,
  similarity_threshold float default 0.7,
  max_results int default 6
)
returns table (
  chunk_id uuid,
  source_id uuid,
  text_content text,
  similarity_score float,
  source_title text,
  source_url text,
  source_license text,
  rank_score float
) language plpgsql as $$
begin
  return query
  with semantic_search as (
    select 
      c.id as chunk_id,
      c.source_id,
      c.text_content,
      (1 - (c.embedding <=> query_embedding)) as similarity_score,
      sd.title as source_title,
      sd.url as source_url,
      sd.license as source_license
    from chunks c
    join source_docs sd on c.source_id = sd.id
    where (1 - (c.embedding <=> query_embedding)) > similarity_threshold
  ),
  lexical_search as (
    select 
      c.id as chunk_id,
      c.source_id,
      c.text_content,
      ts_rank(to_tsvector('swedish', c.text_content), plainto_tsquery('swedish', query_text)) as text_rank,
      sd.title as source_title,
      sd.url as source_url,
      sd.license as source_license
    from chunks c
    join source_docs sd on c.source_id = sd.id
    where to_tsvector('swedish', c.text_content) @@ plainto_tsquery('swedish', query_text)
  ),
  combined_results as (
    select 
      s.chunk_id,
      s.source_id,
      s.text_content,
      s.similarity_score,
      s.source_title,
      s.source_url,
      s.source_license,
      (s.similarity_score * 0.7 + coalesce(l.text_rank, 0) * 0.3) as rank_score
    from semantic_search s
    left join lexical_search l on s.chunk_id = l.chunk_id
    
    union
    
    select 
      l.chunk_id,
      l.source_id,
      l.text_content,
      coalesce(s.similarity_score, 0) as similarity_score,
      l.source_title,
      l.source_url,
      l.source_license,
      (coalesce(s.similarity_score, 0) * 0.7 + l.text_rank * 0.3) as rank_score
    from lexical_search l
    left join semantic_search s on l.chunk_id = s.chunk_id
    where s.chunk_id is null
  )
  select 
    cr.chunk_id,
    cr.source_id,
    cr.text_content,
    cr.similarity_score,
    cr.source_title,
    cr.source_url,
    cr.source_license,
    cr.rank_score
  from combined_results cr
  order by cr.rank_score desc
  limit max_results;
end;
$$;

-- Insert some basic Swedish subjects as starting data
insert into public.subjects (name, code, description) values
  ('Matematik', 'GRGRMAT01', 'Grundskolans matematikämne'),
  ('Svenska', 'GRGRSVEA01', 'Grundskolans ämne svenska'),
  ('Engelska', 'GRGRENG01', 'Grundskolans ämne engelska'),
  ('NO (Naturorienterade ämnen)', 'GRGRNO01', 'Naturorienterade ämnen'),
  ('SO (Samhällsorienterade ämnen)', 'GRGRSO01', 'Samhällsorienterade ämnen'),
  ('Teknik', 'GRGRTEK01', 'Grundskolans ämne teknik'),
  ('Hem- och konsumentkunskap', 'GRGRHKK01', 'Hem- och konsumentkunskap'),
  ('Bild', 'GRGRBIL01', 'Grundskolans ämne bild'),
  ('Musik', 'GRGRMUS01', 'Grundskolans ämne musik'),
  ('Slöjd', 'GRGRSLJ01', 'Grundskolans ämne slöjd'),
  ('Idrott och hälsa', 'GRGRIDH01', 'Grundskolans ämne idrott och hälsa')
on conflict (name) do nothing;