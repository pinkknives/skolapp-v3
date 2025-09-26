-- AI training data table with RLS and indexes

begin;

create table if not exists public.ai_training_data (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  payload jsonb not null,
  subject text not null,
  grade_span text not null,
  created_at timestamptz default now()
);

create index if not exists ai_training_data_quiz_id_idx on public.ai_training_data(quiz_id);
create index if not exists ai_training_data_teacher_id_idx on public.ai_training_data(teacher_id);
create index if not exists ai_training_data_created_at_idx on public.ai_training_data(created_at);

alter table public.ai_training_data enable row level security;

-- Policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_training_data' and policyname = 'Own rows or service can select'
  ) then
    create policy "Own rows or service can select"
      on public.ai_training_data for select
      using (
        teacher_id = auth.uid() or
        exists (
          select 1 from pg_roles where rolname = current_user and rolname like '%service%'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_training_data' and policyname = 'Teacher inserts own or service'
  ) then
    create policy "Teacher inserts own or service"
      on public.ai_training_data for insert
      with check (
        teacher_id = auth.uid() or
        exists (
          select 1 from pg_roles where rolname = current_user and rolname like '%service%'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_training_data' and policyname = 'Only service can update'
  ) then
    create policy "Only service can update"
      on public.ai_training_data for update
      using (false) with check (false);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_training_data' and policyname = 'Only service can delete'
  ) then
    create policy "Only service can delete"
      on public.ai_training_data for delete
      using (false);
  end if;
end $$;

commit;


