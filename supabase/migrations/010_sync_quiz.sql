-- Extend sessions table for synchronous quiz support
-- Adds real-time quiz control capabilities to existing sessions

-- Add sync quiz fields to existing sessions table
alter table public.sessions add column if not exists mode text check (mode in ('async','sync')) default 'async';
alter table public.sessions add column if not exists state text check (state in ('idle','running','paused','ended')) default 'idle';
alter table public.sessions add column if not exists current_index int default 0;
alter table public.sessions add column if not exists question_window_seconds int;
alter table public.sessions add column if not exists question_window_started_at timestamptz;

-- Session attempts table for tracking student answers per question in sync mode
create table if not exists public.session_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_index int not null, -- 0-based question index
  answer jsonb not null, -- MC: selected option ids, free-text: text value
  is_correct boolean, -- calculated when answer is submitted
  answered_at timestamptz default now(),
  
  -- Ensure one attempt per user per question per session
  unique(session_id, user_id, question_index)
);

-- Session events table for real-time event logging and telemetry
create table if not exists public.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  type text not null check (type in ('start','pause','next','reveal','end','join','leave')),
  payload jsonb default '{}',
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null -- who triggered the event
);

-- Indexes for performance
create index if not exists sessions_mode_idx on public.sessions(mode);
create index if not exists sessions_state_idx on public.sessions(state);
create index if not exists sessions_current_index_idx on public.sessions(current_index);

create index if not exists session_attempts_session_user_idx on public.session_attempts(session_id, user_id);
create index if not exists session_attempts_question_idx on public.session_attempts(session_id, question_index);

create index if not exists session_events_session_idx on public.session_events(session_id);
create index if not exists session_events_type_idx on public.session_events(type);
create index if not exists session_events_created_at_idx on public.session_events(created_at);

-- Enable RLS on new tables
alter table public.session_attempts enable row level security;
alter table public.session_events enable row level security;

-- RLS Policies for session_attempts
create policy "teachers read attempts in their sessions"
on public.session_attempts for select using (
  exists(
    select 1 from public.sessions s
    where s.id = session_attempts.session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "students read own attempts"
on public.session_attempts for select using (auth.uid() = user_id);

create policy "students write own attempts"
on public.session_attempts for insert with check (auth.uid() = user_id);

create policy "students update own attempts"
on public.session_attempts for update using (auth.uid() = user_id);

-- RLS Policies for session_events
create policy "teachers read events in their sessions"
on public.session_events for select using (
  exists(
    select 1 from public.sessions s
    where s.id = session_events.session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "teachers write events in their sessions"
on public.session_events for insert with check (
  exists(
    select 1 from public.sessions s
    where s.id = session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "participants read events in their sessions"
on public.session_events for select using (
  exists(
    select 1 from public.session_participants sp
    join public.sessions s on s.id = sp.session_id
    where s.id = session_events.session_id 
    and (sp.student_id = auth.uid() or sp.student_id is null)
  )
);

-- Comments for documentation
comment on column public.sessions.mode is 'Quiz execution mode: async (self-paced) or sync (teacher-controlled real-time)';
comment on column public.sessions.state is 'Real-time session state for sync mode';
comment on column public.sessions.current_index is 'Current active question index for sync mode (0-based)';
comment on column public.sessions.question_window_seconds is 'Time limit for current question in sync mode';
comment on column public.sessions.question_window_started_at is 'When current question timer started in sync mode';

comment on table public.session_attempts is 'Student answers per question in real-time sync sessions';
comment on table public.session_events is 'Event log for real-time session management and telemetry';