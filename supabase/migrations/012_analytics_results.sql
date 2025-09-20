-- Analytics and Results system for detailed quiz analysis
-- Adds detailed attempt tracking and performance analytics

-- Add score tracking to existing session_attempts table
alter table public.session_attempts add column if not exists score numeric default 0;
alter table public.session_attempts add column if not exists time_spent_seconds int;

-- Create attempt_items table for detailed question-level analysis
-- This stores individual question responses within an attempt
create table if not exists public.attempt_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null, -- Reference to question within quiz
  question_index int not null, -- 0-based index of question in quiz
  answer jsonb not null, -- Student's answer (MC: option ids, text: string)
  is_correct boolean not null default false,
  score numeric not null default 0,
  time_spent_seconds int,
  answered_at timestamptz default now(),
  attempt_no int not null default 1, -- Which attempt this is for this user/question
  
  -- Ensure one record per user per question per attempt
  unique(session_id, user_id, question_id, attempt_no)
);

-- Create materialized view for session question statistics
create materialized view if not exists public.session_question_stats as
select 
  ai.session_id,
  ai.question_id,
  ai.question_index,
  count(*) as total_attempts,
  count(*) filter (where ai.is_correct) as correct_count,
  round(
    (count(*) filter (where ai.is_correct)::numeric / count(*))::numeric * 100, 
    1
  ) as correct_rate,
  round(avg(ai.score), 2) as avg_score,
  round(avg(ai.time_spent_seconds), 1) as avg_time_seconds
from public.attempt_items ai
group by ai.session_id, ai.question_id, ai.question_index;

-- Create materialized view for session user best scores
create materialized view if not exists public.session_user_best as
select 
  ai.session_id,
  ai.user_id,
  sp.display_name,
  sp.student_id,
  sum(ai.score) as best_score,
  count(*) as questions_attempted,
  max(ai.answered_at) as last_activity_at,
  count(distinct ai.attempt_no) as total_attempts,
  round(avg(ai.time_spent_seconds), 1) as avg_time_per_question,
  case 
    when exists(
      select 1 from public.session_progress prog 
      where prog.session_id = ai.session_id 
      and prog.user_id = ai.user_id 
      and prog.status = 'submitted'
    ) then 'submitted'
    when exists(
      select 1 from public.session_progress prog 
      where prog.session_id = ai.session_id 
      and prog.user_id = ai.user_id 
      and prog.status = 'late'
    ) then 'late'
    when count(*) > 0 then 'in_progress'
    else 'not_started'
  end as status
from public.attempt_items ai
left join public.session_participants sp on sp.session_id = ai.session_id 
  and (sp.student_id = ai.user_id or sp.student_id is null)
group by ai.session_id, ai.user_id, sp.display_name, sp.student_id;

-- Create indexes for performance
create index if not exists attempt_items_session_id_idx on public.attempt_items(session_id);
create index if not exists attempt_items_user_id_idx on public.attempt_items(user_id);
create index if not exists attempt_items_question_id_idx on public.attempt_items(question_id);
create index if not exists attempt_items_session_user_idx on public.attempt_items(session_id, user_id);
create index if not exists attempt_items_session_question_idx on public.attempt_items(session_id, question_id);
create index if not exists attempt_items_answered_at_idx on public.attempt_items(answered_at);

-- Create unique indexes on materialized views for fast refresh
create unique index if not exists session_question_stats_pk 
  on public.session_question_stats(session_id, question_id);
create unique index if not exists session_user_best_pk 
  on public.session_user_best(session_id, user_id);

-- Enable RLS on new table
alter table public.attempt_items enable row level security;

-- RLS Policies for attempt_items
create policy "teachers read attempt items in their sessions"
on public.attempt_items for select using (
  exists(
    select 1 from public.sessions s
    where s.id = attempt_items.session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "students read own attempt items"
on public.attempt_items for select using (auth.uid() = user_id);

create policy "students write own attempt items"
on public.attempt_items for insert with check (auth.uid() = user_id);

create policy "students update own attempt items"
on public.attempt_items for update using (auth.uid() = user_id);

-- Function to refresh materialized views when attempt_items change
create or replace function refresh_analytics_views()
returns trigger
language plpgsql
as $$
begin
  -- Refresh materialized views
  refresh materialized view concurrently public.session_question_stats;
  refresh materialized view concurrently public.session_user_best;
  return null;
end;
$$;

-- Trigger to refresh views when attempt_items are modified
create trigger trigger_refresh_analytics_views
  after insert or update or delete on public.attempt_items
  for each statement execute function refresh_analytics_views();

-- Function to auto-populate attempt_items from session_attempts (migration helper)
create or replace function migrate_session_attempts_to_items()
returns void
language plpgsql
as $$
declare
  attempt_record record;
begin
  -- Migrate existing session_attempts to attempt_items format
  for attempt_record in 
    select 
      sa.session_id,
      sa.user_id,
      concat('q_', sa.question_index) as question_id,
      sa.question_index,
      sa.answer,
      coalesce(sa.is_correct, false) as is_correct,
      coalesce(sa.score, case when sa.is_correct then 1 else 0 end) as score,
      sa.duration_seconds as time_spent_seconds,
      sa.answered_at,
      coalesce(sa.attempt_no, 1) as attempt_no
    from public.session_attempts sa
    where not exists (
      select 1 from public.attempt_items ai 
      where ai.session_id = sa.session_id 
      and ai.user_id = sa.user_id 
      and ai.question_index = sa.question_index
      and ai.attempt_no = coalesce(sa.attempt_no, 1)
    )
  loop
    insert into public.attempt_items (
      session_id, user_id, question_id, question_index, answer, 
      is_correct, score, time_spent_seconds, answered_at, attempt_no
    ) values (
      attempt_record.session_id,
      attempt_record.user_id,
      attempt_record.question_id,
      attempt_record.question_index,
      attempt_record.answer,
      attempt_record.is_correct,
      attempt_record.score,
      attempt_record.time_spent_seconds,
      attempt_record.answered_at,
      attempt_record.attempt_no
    ) on conflict (session_id, user_id, question_id, attempt_no) do nothing;
  end loop;
end;
$$;

-- Comments for documentation
comment on table public.attempt_items is 'Detailed question-level attempt data for analytics';
comment on column public.attempt_items.question_id is 'Reference to question within quiz (e.g., q_0, q_1)';
comment on column public.attempt_items.question_index is '0-based index of question in quiz';
comment on column public.attempt_items.score is 'Points scored for this question';
comment on column public.attempt_items.time_spent_seconds is 'Time spent on this specific question';
comment on column public.attempt_items.attempt_no is 'Attempt number for this user on this question';

comment on materialized view public.session_question_stats is 'Aggregated statistics per question per session';
comment on materialized view public.session_user_best is 'Best attempt summary per user per session';