-- Admin review fields for merge requests
alter table if exists public.merge_requests
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz;

create index if not exists idx_merge_requests_reviewed_at on public.merge_requests(reviewed_at);

