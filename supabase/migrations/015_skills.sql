-- Skills taxonomy and mapping to questions
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  subject text,
  grade text,
  created_at timestamptz default now()
);

create table if not exists public.question_skills (
  question_id text not null,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (question_id, skill_id)
);

-- Weekly student skill performance materialized view (based on attempt_items)
create materialized view if not exists public.student_skill_weekly as
with ai as (
  select 
    ai.user_id,
    ai.question_id,
    ai.is_correct,
    ai.answered_at::date as answered_date
  from public.attempt_items ai
),
qs as (
  select question_id, skill_id from public.question_skills
)
select 
  ai.user_id,
  qs.skill_id,
  date_trunc('week', ai.answered_date)::date as week_start,
  count(*) as attempts,
  count(*) filter (where ai.is_correct) as correct,
  round((count(*) filter (where ai.is_correct))::numeric * 100 / nullif(count(*),0), 1) as correct_rate
from ai
join qs using (question_id)
where ai.user_id is not null
group by ai.user_id, qs.skill_id, date_trunc('week', ai.answered_date)::date;

create index if not exists idx_student_skill_weekly on public.student_skill_weekly(user_id, skill_id, week_start);
