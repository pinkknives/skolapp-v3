begin;

-- Extend library_items with optional metadata for search filters
alter table public.library_items
  add column if not exists subject text,
  add column if not exists grade_span text;

-- Simple FTS over title + subject + grade_span using trigram and GIN jsonb path on versions
create extension if not exists pg_trgm;
create index if not exists idx_library_items_title_trgm on public.library_items using gin (title gin_trgm_ops);
create index if not exists idx_library_items_subject_trgm on public.library_items using gin (subject gin_trgm_ops);
create index if not exists idx_library_items_grade_trgm on public.library_items using gin (grade_span gin_trgm_ops);

commit;
