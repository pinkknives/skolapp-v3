-- AI feedback table with RLS and indexes

begin;

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  training_row_id uuid references public.ai_training_data(id) on delete cascade,
  rating integer not null check (rating in (1, -1)),
  comment text,
  question_title text,
  subject text,
  grade text,
  provider text,
  created_at timestamptz default now()
);

create index if not exists ai_feedback_training_row_id_idx on public.ai_feedback(training_row_id);
create index if not exists ai_feedback_teacher_id_idx on public.ai_feedback(teacher_id);

alter table public.ai_feedback enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_feedback' and policyname = 'Teacher selects own or service'
  ) then
    create policy "Teacher selects own or service"
      on public.ai_feedback for select
      using (
        teacher_id = auth.uid() or
        exists (
          select 1 from pg_roles where rolname = current_user and rolname like '%service%'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_feedback' and policyname = 'Teacher inserts own'
  ) then
    create policy "Teacher inserts own"
      on public.ai_feedback for insert
      with check (teacher_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_feedback' and policyname = 'Only service updates'
  ) then
    create policy "Only service updates"
      on public.ai_feedback for update
      using (false) with check (false);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_feedback' and policyname = 'Only service deletes'
  ) then
    create policy "Only service deletes"
      on public.ai_feedback for delete
      using (false);
  end if;
end $$;

commit;


