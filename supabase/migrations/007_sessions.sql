-- Sessions for teacher-controlled real-time quiz sessions
-- Extends the existing quiz system with collaborative session management

-- Sessions table for teacher-controlled quiz sessions
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  code varchar(6) not null unique, -- 6-character join code
  status text check (status in ('lobby','live','ended')) not null default 'lobby',
  started_at timestamptz,
  ended_at timestamptz,
  settings jsonb default '{}', -- Session-specific settings (timer, etc.)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Session participants (students who joined the session)
create table if not exists public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid references auth.users(id) on delete set null, -- null for guest students
  display_name text not null, -- Student display name (for guests too)
  joined_at timestamptz default now(),
  status text check (status in ('joined','active','finished','disconnected')) default 'joined',
  last_seen timestamptz default now()
);

-- Update attempts table to link to sessions (optional - maintains backward compatibility)
alter table public.attempts add column if not exists session_id uuid references public.sessions(id) on delete set null;

-- Function to generate unique 6-character session codes
create or replace function generate_session_code() returns varchar(6) as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding confusing chars (0,O,1,I)
  result varchar(6) := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Function to ensure unique session codes
create or replace function ensure_unique_session_code() returns varchar(6) as $$
declare
  new_code varchar(6);
  attempts integer := 0;
begin
  loop
    new_code := generate_session_code();
    -- Check if code exists in active sessions (last 24 hours)
    if not exists (
      select 1 from public.sessions 
      where code = new_code 
      and created_at > now() - interval '24 hours'
    ) then
      return new_code;
    end if;
    
    attempts := attempts + 1;
    if attempts > 100 then
      raise exception 'Unable to generate unique session code after 100 attempts';
    end if;
  end loop;
end;
$$ language plpgsql;

-- Trigger to auto-generate session codes
create or replace function set_session_code() returns trigger as $$
begin
  if new.code is null or new.code = '' then
    new.code := ensure_unique_session_code();
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger sessions_set_code
  before insert or update on public.sessions
  for each row execute function set_session_code();

-- Enable RLS on new tables
alter table public.sessions enable row level security;
alter table public.session_participants enable row level security;

-- RLS Policies for sessions
create policy "teachers read own sessions"
on public.sessions for select using (auth.uid() = teacher_id);

create policy "teachers write own sessions" 
on public.sessions for insert with check (auth.uid() = teacher_id);

create policy "teachers update own sessions"
on public.sessions for update using (auth.uid() = teacher_id);

create policy "students read sessions they're in"
on public.sessions for select using (
  exists(
    select 1 from public.session_participants sp
    where sp.session_id = sessions.id 
    and (sp.student_id = auth.uid() or sp.student_id is null) -- Allow guest access
  )
);

-- RLS Policies for session participants
create policy "teachers read participants in their sessions"
on public.session_participants for select using (
  exists(
    select 1 from public.sessions s
    where s.id = session_participants.session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "teachers manage participants in their sessions"
on public.session_participants for all using (
  exists(
    select 1 from public.sessions s
    where s.id = session_participants.session_id 
    and s.teacher_id = auth.uid()
  )
);

create policy "students read own participation"
on public.session_participants for select using (
  student_id = auth.uid() or student_id is null -- Allow guest access
);

create policy "students update own participation"
on public.session_participants for update using (
  student_id = auth.uid() or student_id is null -- Allow guest access  
);

-- Indexes for performance
create index if not exists sessions_quiz_id_idx on public.sessions(quiz_id);
create index if not exists sessions_teacher_id_idx on public.sessions(teacher_id);
create index if not exists sessions_code_idx on public.sessions(code);
create index if not exists sessions_status_idx on public.sessions(status);

create index if not exists session_participants_session_id_idx on public.session_participants(session_id);
create index if not exists session_participants_student_id_idx on public.session_participants(student_id);

-- Comments for documentation
comment on table public.sessions is 'Teacher-controlled quiz sessions with real-time participation';
comment on table public.session_participants is 'Students participating in quiz sessions';
comment on column public.sessions.code is 'Unique 6-character join code for students';
comment on column public.sessions.status is 'Session state: lobby (waiting), live (active), ended (completed)';
comment on column public.session_participants.display_name is 'Student display name, supports both authenticated and guest users';