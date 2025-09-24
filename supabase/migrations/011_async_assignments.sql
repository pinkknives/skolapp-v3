-- Extend sessions table for asynchronous assignment support
-- Adds fields for assignment deadline, attempts, time limits, and result visibility

-- Add async assignment fields to existing sessions table
alter table public.sessions add column if not exists open_at timestamptz;
alter table public.sessions add column if not exists due_at timestamptz;
alter table public.sessions add column if not exists max_attempts int not null default 1;
alter table public.sessions add column if not exists time_limit_seconds int;
alter table public.sessions add column if not exists reveal_policy text check (reveal_policy in ('immediate','after_deadline','never')) not null default 'after_deadline';

-- Add attempt tracking fields to session_attempts
alter table public.session_attempts add column if not exists attempt_no int not null default 1;
alter table public.session_attempts add column if not exists duration_seconds int;

-- Create session_progress table for tracking student assignment progress
create table if not exists public.session_progress (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz,
  submitted_at timestamptz,
  status text check (status in ('not_started','in_progress','submitted','late')) not null default 'not_started',
  current_attempt int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one progress record per user per session
  unique(session_id, user_id)
);

-- Create notifications table for assignment reminders
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  type text check (type in ('deadline_24h','deadline_1h','deadline_passed','assignment_published')) not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Update session_attempts to include proper unique constraint with attempt_no
alter table public.session_attempts drop constraint if exists session_attempts_session_id_user_id_question_index_key;
alter table public.session_attempts add constraint session_attempts_session_user_question_attempt_key 
  unique(session_id, user_id, question_index, attempt_no);

-- Create indexes for performance
create index if not exists sessions_mode_due_at_idx on public.sessions(mode, due_at) where mode = 'async';
create index if not exists sessions_due_at_idx on public.sessions(due_at) where due_at is not null;
create index if not exists session_progress_session_user_idx on public.session_progress(session_id, user_id);
create index if not exists session_progress_status_idx on public.session_progress(status);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_session_id_idx on public.notifications(session_id);
create index if not exists notifications_type_created_idx on public.notifications(type, created_at);

-- Enable RLS on new tables
alter table public.session_progress enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies for session_progress
create policy "teachers read progress in their sessions"
on public.session_progress for select using (
  exists(
    select 1 from public.sessions s
    where s.id = session_progress.session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "students read own progress"
on public.session_progress for select using (auth.uid() = user_id);

create policy "students write own progress"
on public.session_progress for insert with check (auth.uid() = user_id);

create policy "students update own progress"
on public.session_progress for update using (auth.uid() = user_id);

-- RLS Policies for notifications
create policy "users read own notifications"
on public.notifications for select using (auth.uid() = user_id);

create policy "users update own notifications"
on public.notifications for update using (auth.uid() = user_id);

create policy "system creates notifications"
on public.notifications for insert with check (true); -- System can create notifications

-- Function to automatically update session_progress updated_at
create or replace function update_session_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

-- Trigger to auto-update updated_at on session_progress
create trigger trigger_update_session_progress_updated_at
  before update on public.session_progress
  for each row execute function update_session_progress_updated_at();

-- Function to automatically create session_progress when user first starts assignment
create or replace function ensure_session_progress()
returns trigger
language plpgsql
as $$
begin
  -- Only for async mode sessions
  if exists (
    select 1 from public.sessions s 
    where s.id = NEW.session_id 
    and s.mode = 'async'
  ) then
    -- Create progress record if it doesn't exist
    insert into public.session_progress (session_id, user_id, status, current_attempt)
    values (NEW.session_id, NEW.user_id, 'in_progress', NEW.attempt_no)
    on conflict (session_id, user_id) do update set
      status = case 
        when session_progress.status = 'not_started' then 'in_progress'
        else session_progress.status
      end,
      current_attempt = greatest(session_progress.current_attempt, NEW.attempt_no),
      started_at = coalesce(session_progress.started_at, now()),
      updated_at = now();
  end if;
  
  return NEW;
end;
$$;

-- Trigger to auto-create/update progress when attempt is made
create trigger trigger_ensure_session_progress
  after insert on public.session_attempts
  for each row execute function ensure_session_progress();

-- Comments for documentation
comment on column public.sessions.open_at is 'When assignment becomes available (null = immediately)';
comment on column public.sessions.due_at is 'Assignment deadline for async mode';
comment on column public.sessions.max_attempts is 'Maximum attempts allowed per student';
comment on column public.sessions.time_limit_seconds is 'Time limit per attempt in seconds';
comment on column public.sessions.reveal_policy is 'When to show correct answers: immediate, after_deadline, or never';

comment on column public.session_attempts.attempt_no is 'Attempt number for this user on this question (1-based)';
comment on column public.session_attempts.duration_seconds is 'Time spent on this attempt in seconds';

comment on table public.session_progress is 'Tracks student progress on async assignments for quick teacher overview';
comment on table public.notifications is 'In-app notifications for assignment reminders and updates';