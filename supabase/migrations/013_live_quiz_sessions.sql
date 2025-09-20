-- Live Quiz Sessions Enhancement
-- Adds required fields and policies for real-time quiz sessions with GDPR compliance

-- Add missing fields to sessions table for live quiz functionality
alter table public.sessions add column if not exists org_id uuid references public.orgs(id) on delete cascade;
alter table public.sessions add column if not exists class_id uuid references public.classes(id) on delete cascade;
alter table public.sessions add column if not exists allow_responses boolean default true;
alter table public.sessions add column if not exists reveal_policy text check (reveal_policy in ('immediate','after_deadline','never')) default 'immediate';

-- Update session_participants to support GDPR modes
-- In Korttidsläge: student_id is null (anonymous)
-- In Långtidsläge: student_id references actual user
alter table public.session_participants add column if not exists student_profile_id uuid references auth.users(id) on delete set null;

-- Rename session_attempts to session_answers for consistency with requirements
-- Keep both tables during transition for compatibility
create table if not exists public.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_id uuid not null, -- Reference to quiz question (from quiz json)
  student_profile_id uuid references auth.users(id) on delete set null, -- null in Korttidsläge
  answer jsonb not null,
  is_correct boolean,
  submitted_at timestamptz default now(),
  
  -- Enforce one answer per student per question (or one anonymous answer in Korttidsläge)
  unique(session_id, question_id, student_profile_id)
);

-- Create materialized view for aggregated results
create materialized view if not exists public.session_aggregates as
select 
  sa.session_id,
  sa.question_id,
  count(*) as total_responses,
  count(*) filter (where sa.is_correct = true) as correct_responses,
  round(
    (count(*) filter (where sa.is_correct = true)::decimal / count(*)) * 100, 
    2
  ) as correct_percentage,
  jsonb_agg(
    case 
      when sa.answer ? 'selectedOptions' then sa.answer->'selectedOptions'
      else sa.answer
    end
  ) as all_answers
from public.session_answers sa
group by sa.session_id, sa.question_id;

-- Create indexes for performance
create index if not exists idx_sessions_org_id on public.sessions(org_id);
create index if not exists idx_sessions_class_id on public.sessions(class_id);
create index if not exists idx_sessions_allow_responses on public.sessions(allow_responses);

create index if not exists idx_session_participants_student_profile_id on public.session_participants(student_profile_id);

create index if not exists idx_session_answers_session_question on public.session_answers(session_id, question_id);
create index if not exists idx_session_answers_student_profile_id on public.session_answers(student_profile_id);
create index if not exists idx_session_answers_submitted_at on public.session_answers(submitted_at);

-- Enable RLS on new table
alter table public.session_answers enable row level security;

-- Update RLS policies for sessions to include org/class scoping
drop policy if exists "teachers read own sessions" on public.sessions;
drop policy if exists "teachers write own sessions" on public.sessions;
drop policy if exists "teachers update own sessions" on public.sessions;
drop policy if exists "students read sessions they're in" on public.sessions;

-- New organization and class-aware session policies
create policy "teacher reads org class sessions"
on public.sessions for select using (
  auth.uid() = teacher_id
  or
  -- Organization access
  (
    org_id is not null
    and exists (
      select 1 from public.org_members om 
      where om.org_id = sessions.org_id 
      and om.user_id = auth.uid() 
      and om.status = 'active'
    )
  )
  or
  -- Class access
  (
    class_id is not null
    and exists (
      select 1 from public.classes c
      where c.id = sessions.class_id
      and (
        c.owner_id = auth.uid()
        or
        (
          c.org_id is not null
          and exists (
            select 1 from public.org_members om 
            where om.org_id = c.org_id 
            and om.user_id = auth.uid() 
            and om.status = 'active'
          )
        )
      )
    )
  )
);

create policy "teacher creates sessions"
on public.sessions for insert with check (auth.uid() = teacher_id);

create policy "teacher updates own sessions"
on public.sessions for update using (
  auth.uid() = teacher_id
  or
  -- Organization admin can update
  (
    org_id is not null
    and exists (
      select 1 from public.org_members om 
      where om.org_id = sessions.org_id 
      and om.user_id = auth.uid() 
      and om.role in ('owner', 'admin')
      and om.status = 'active'
    )
  )
);

create policy "students read accessible sessions"
on public.sessions for select using (
  -- Direct participation
  exists(
    select 1 from public.session_participants sp
    where sp.session_id = sessions.id 
    and (sp.student_id = auth.uid() or sp.student_profile_id = auth.uid())
  )
  or
  -- Class membership (for authenticated students)
  (
    class_id is not null
    and exists (
      select 1 from public.class_members cm
      where cm.class_id = sessions.class_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role = 'student'
    )
  )
);

-- RLS Policies for session_answers
create policy "teacher reads session answers"
on public.session_answers for select using (
  exists(
    select 1 from public.sessions s
    where s.id = session_answers.session_id 
    and (
      s.teacher_id = auth.uid()
      or
      -- Organization access
      (
        s.org_id is not null
        and exists (
          select 1 from public.org_members om 
          where om.org_id = s.org_id 
          and om.user_id = auth.uid() 
          and om.status = 'active'
        )
      )
      or
      -- Class access
      (
        s.class_id is not null
        and exists (
          select 1 from public.classes c
          where c.id = s.class_id
          and (
            c.owner_id = auth.uid()
            or
            (
              c.org_id is not null
              and exists (
                select 1 from public.org_members om 
                where om.org_id = c.org_id 
                and om.user_id = auth.uid() 
                and om.status = 'active'
              )
            )
          )
        )
      )
    )
  )
);

create policy "students read own answers"
on public.session_answers for select using (
  auth.uid() = student_profile_id
  and student_profile_id is not null -- Only in Långtidsläge
);

create policy "students submit answers"
on public.session_answers for insert with check (
  -- Verify session is active and allows responses
  exists(
    select 1 from public.sessions s
    where s.id = session_id 
    and s.status = 'live'
    and s.allow_responses = true
  )
  and
  -- Verify student has permission (either authenticated or anonymous)
  (
    auth.uid() = student_profile_id -- Långtidsläge: authenticated student
    or
    student_profile_id is null -- Korttidsläge: anonymous
  )
  and
  -- Verify student is participant in session
  exists(
    select 1 from public.session_participants sp
    where sp.session_id = session_answers.session_id 
    and (
      sp.student_id = auth.uid() 
      or sp.student_profile_id = auth.uid()
      or sp.student_id is null -- Allow anonymous participants
    )
  )
);

-- Function to refresh session aggregates
create or replace function refresh_session_aggregates(p_session_id uuid default null)
returns void
language plpgsql
as $$
begin
  if p_session_id is not null then
    -- Refresh for specific session
    refresh materialized view public.session_aggregates;
  else
    -- Full refresh
    refresh materialized view public.session_aggregates;
  end if;
end;
$$;

-- Function to automatically refresh aggregates when answers are submitted
create or replace function trigger_refresh_session_aggregates()
returns trigger
language plpgsql
as $$
begin
  -- Async refresh to avoid blocking the insert/update
  perform pg_notify('refresh_aggregates', NEW.session_id::text);
  return NEW;
end;
$$;

-- Trigger to auto-refresh aggregates
create trigger session_answers_refresh_aggregates
  after insert or update on public.session_answers
  for each row execute function trigger_refresh_session_aggregates();

-- Comments for documentation
comment on column public.sessions.org_id is 'Organization that owns this session for multi-tenancy';
comment on column public.sessions.class_id is 'Class this session is assigned to';
comment on column public.sessions.allow_responses is 'Whether students can currently submit responses';
comment on column public.sessions.reveal_policy is 'When to reveal correct answers to students';

comment on column public.session_participants.student_profile_id is 'Student profile for GDPR compliance - null in Korttidsläge';

comment on table public.session_answers is 'Student answers per question with GDPR compliance support';
comment on column public.session_answers.student_profile_id is 'Student ID - null in Korttidsläge for anonymity';

comment on materialized view public.session_aggregates is 'Pre-computed aggregated results for teacher dashboard performance';