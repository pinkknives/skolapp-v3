-- Merge student data request logging
create table if not exists public.merge_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users(id) on delete cascade,
  source_student_id uuid not null references auth.users(id) on delete cascade,
  target_student_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status text check (status in ('pending','approved','rejected')) not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_merge_requests_requested_by on public.merge_requests(requested_by);
create index if not exists idx_merge_requests_status on public.merge_requests(status);

alter table public.merge_requests enable row level security;

-- Teachers can create and read their requests
create policy if not exists merge_requests_rw_by_teacher
on public.merge_requests
for all
using (requested_by = auth.uid())
with check (requested_by = auth.uid());

