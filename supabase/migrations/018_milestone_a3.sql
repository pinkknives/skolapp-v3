-- Milestone A3: Private RPCs for aggregation

-- Ensure private schema exists
create schema if not exists private;

-- Helper: revoke defaults
revoke all on schema private from public;

-- get_student_progress
create or replace function private.get_student_progress(p_student_id uuid, p_range text)
returns table(subject text, quiz_id uuid, week_start date, attempts int, correct int, correct_rate numeric)
language sql
security definer
set search_path = ''
as $$
  with base as (
    select qa.quiz_id, q.subject, date_trunc('week', coalesce(qa.completed_at, qa.started_at))::date as week_start,
           count(*) as attempts,
           sum(case when coalesce(qa.score,0) > 0 then 1 else 0 end) as correct
    from public.quiz_attempts qa
    left join public.quizzes q on q.id = qa.quiz_id
    where qa.student_id = p_student_id
      and (p_range is null or p_range = '' or coalesce(qa.completed_at, qa.started_at) >= (now() - (case p_range when '7d' then interval '7 days' when '30d' then interval '30 days' when 'term' then interval '120 days' else interval '365 days' end)))
    group by 1,2,3
  )
  select subject, quiz_id, week_start, attempts, correct,
         round((correct::numeric / nullif(attempts,0)) * 100, 1) as correct_rate
  from base
  order by week_start;
$$;

-- get_class_progress
create or replace function private.get_class_progress(p_class_id uuid, p_range text)
returns table(subject text, week_start date, attempts int, correct int, correct_rate numeric, median_score numeric)
language sql
security definer
set search_path = ''
as $$
  with base as (
    select q.subject, date_trunc('week', coalesce(qa.completed_at, qa.started_at))::date as week_start,
           count(*) as attempts,
           sum(case when coalesce(qa.score,0) > 0 then 1 else 0 end) as correct,
           percentile_cont(0.5) within group (order by coalesce(qa.score,0)) as median_score
    from public.quiz_attempts qa
    left join public.quizzes q on q.id = qa.quiz_id
    where qa.class_id = p_class_id
      and (p_range is null or p_range = '' or coalesce(qa.completed_at, qa.started_at) >= (now() - (case p_range when '7d' then interval '7 days' when '30d' then interval '30 days' when 'term' then interval '120 days' else interval '365 days' end)))
    group by 1,2
  )
  select subject, week_start, attempts, correct,
         round((correct::numeric / nullif(attempts,0)) * 100, 1) as correct_rate,
         round(median_score, 1) as median_score
  from base
  order by week_start;
$$;

-- get_school_progress
create or replace function private.get_school_progress(p_school_id uuid, p_range text)
returns table(subject text, week_start date, attempts int, correct int, correct_rate numeric)
language sql
security definer
set search_path = ''
as $$
  with teacher_ids as (
    select t.id as teacher_id
    from public.teachers t
    where t.school_id = p_school_id
  ), class_ids as (
    select c.id as class_id
    from public.classes c
    join teacher_ids ti on ti.teacher_id = c.teacher_id
  ), base as (
    select q.subject, date_trunc('week', coalesce(qa.completed_at, qa.started_at))::date as week_start,
           count(*) as attempts,
           sum(case when coalesce(qa.score,0) > 0 then 1 else 0 end) as correct
    from public.quiz_attempts qa
    left join public.quizzes q on q.id = qa.quiz_id
    where qa.class_id in (select class_id from class_ids)
      and (p_range is null or p_range = '' or coalesce(qa.completed_at, qa.started_at) >= (now() - (case p_range when '7d' then interval '7 days' when '30d' then interval '30 days' when 'term' then interval '120 days' else interval '365 days' end)))
    group by 1,2
  )
  select subject, week_start, attempts, correct,
         round((correct::numeric / nullif(attempts,0)) * 100, 1) as correct_rate
  from base
  order by week_start;
$$;

-- list_top_bottom_students
create or replace function private.list_top_bottom_students(p_class_id uuid, p_limit int)
returns table(student_id uuid, attempts int, avg_score numeric)
language sql
security definer
set search_path = ''
as $$
  with base as (
    select qa.student_id,
           count(*) as attempts,
           avg(coalesce(qa.score,0)) as avg_score
    from public.quiz_attempts qa
    where qa.class_id = p_class_id
    group by qa.student_id
  )
  select student_id, attempts, round(avg_score, 2) as avg_score
  from base
  order by avg_score desc
  limit coalesce(p_limit, 5);
$$;

-- Restrict EXECUTE to service role and postgres
revoke all on function private.get_student_progress(uuid, text) from public;
revoke all on function private.get_class_progress(uuid, text) from public;
revoke all on function private.get_school_progress(uuid, text) from public;
revoke all on function private.list_top_bottom_students(uuid, int) from public;

-- Note: In Supabase, explicitly grant to service role in deployment step
-- Example:
-- grant execute on function private.get_student_progress(uuid, text) to service_role;
-- grant execute on function private.get_class_progress(uuid, text) to service_role;
-- grant execute on function private.get_school_progress(uuid, text) to service_role;
-- grant execute on function private.list_top_bottom_students(uuid, int) to service_role;
