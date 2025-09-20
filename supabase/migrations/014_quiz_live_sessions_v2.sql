-- Quiz Live Sessions v2 - Exact specification implementation
-- This migration creates the exact table structure specified in the issue

-- Create quiz_sessions table according to specification
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  pin text not null unique, -- 6 character A-Z0-9 code
  status text not null check (status in ('LOBBY','ACTIVE','PAUSED','ENDED')) default 'LOBBY',
  current_index int default 0,
  settings jsonb default '{
    "timePerQuestion": 30,
    "showAfterEach": true,
    "autoAdvance": false
  }'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Create quiz_session_participants table according to specification
create table if not exists public.quiz_session_participants (
  session_id uuid references public.quiz_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, -- can be null for guest in later phase
  display_name text not null, -- from profile
  role text check (role in ('teacher','student')) not null,
  joined_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  primary key (session_id, user_id)
);

-- Create quiz_answers table according to specification
create table if not exists public.quiz_answers (
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  question_id uuid not null, -- reference to quiz question
  user_id uuid not null references auth.users(id) on delete cascade,
  answer text not null, -- alt-id or free text
  is_correct boolean, -- set via server/trigger
  submitted_at timestamptz default now(),
  primary key (session_id, question_id, user_id)
);

-- Function to generate unique 6-character PIN
create or replace function generate_quiz_session_pin()
returns text
language plpgsql
as $$
declare
  characters text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  pin text := '';
  i int;
  char_pos int;
begin
  -- Generate 6 random characters
  for i in 1..6 loop
    char_pos := floor(random() * length(characters))::int + 1;
    pin := pin || substring(characters from char_pos for 1);
  end loop;
  
  -- Check if PIN already exists and regenerate if needed
  while exists(select 1 from public.quiz_sessions where pin = pin) loop
    pin := '';
    for i in 1..6 loop
      char_pos := floor(random() * length(characters))::int + 1;
      pin := pin || substring(characters from char_pos for 1);
    end loop;
  end loop;
  
  return pin;
end;
$$;

-- Trigger to auto-generate PIN
create or replace function auto_generate_pin()
returns trigger
language plpgsql
as $$
begin
  if NEW.pin is null or NEW.pin = '' then
    NEW.pin := generate_quiz_session_pin();
  end if;
  return NEW;
end;
$$;

create trigger quiz_sessions_auto_pin
  before insert on public.quiz_sessions
  for each row execute function auto_generate_pin();

-- Function to determine if answer is correct
create or replace function check_answer_correctness()
returns trigger
language plpgsql
as $$
declare
  quiz_data jsonb;
  question_data jsonb;
  correct_answer text;
begin
  -- Get quiz data
  select questions into quiz_data
  from public.quizzes q
  join public.quiz_sessions qs on q.id = qs.quiz_id
  where qs.id = NEW.session_id;
  
  -- Find the specific question
  select value into question_data
  from jsonb_array_elements(quiz_data) 
  where value->>'id' = NEW.question_id;
  
  if question_data is not null then
    -- For multiple choice, check if answer matches correct option
    if question_data->>'type' = 'multiple-choice' then
      select option->>'id' into correct_answer
      from jsonb_array_elements(question_data->'options') option
      where (option->>'isCorrect')::boolean = true;
      
      NEW.is_correct := (NEW.answer = correct_answer);
    else
      -- For free text, basic comparison (could be enhanced with fuzzy matching)
      correct_answer := question_data->>'expectedAnswer';
      NEW.is_correct := (lower(trim(NEW.answer)) = lower(trim(correct_answer)));
    end if;
  else
    NEW.is_correct := false;
  end if;
  
  return NEW;
end;
$$;

create trigger quiz_answers_check_correctness
  before insert or update on public.quiz_answers
  for each row execute function check_answer_correctness();

-- Create indexes for performance
create index if not exists idx_quiz_sessions_org_id on public.quiz_sessions(org_id);
create index if not exists idx_quiz_sessions_class_id on public.quiz_sessions(class_id);
create index if not exists idx_quiz_sessions_pin on public.quiz_sessions(pin);
create index if not exists idx_quiz_sessions_status on public.quiz_sessions(status);
create index if not exists idx_quiz_sessions_created_by on public.quiz_sessions(created_by);

create index if not exists idx_quiz_session_participants_session_id on public.quiz_session_participants(session_id);
create index if not exists idx_quiz_session_participants_user_id on public.quiz_session_participants(user_id);

create index if not exists idx_quiz_answers_session_question on public.quiz_answers(session_id, question_id);
create index if not exists idx_quiz_answers_user_id on public.quiz_answers(user_id);
create index if not exists idx_quiz_answers_submitted_at on public.quiz_answers(submitted_at);

-- Enable RLS
alter table public.quiz_sessions enable row level security;
alter table public.quiz_session_participants enable row level security;
alter table public.quiz_answers enable row level security;

-- RLS Policies for quiz_sessions
create policy "teachers read own quiz sessions"
on public.quiz_sessions for select using (
  created_by = auth.uid()
  or
  -- Organization access
  exists (
    select 1 from public.org_members om 
    where om.org_id = quiz_sessions.org_id 
    and om.user_id = auth.uid() 
    and om.status = 'active'
  )
);

create policy "teachers create quiz sessions"
on public.quiz_sessions for insert with check (
  created_by = auth.uid()
  and
  -- Verify org access
  exists (
    select 1 from public.org_members om 
    where om.org_id = quiz_sessions.org_id 
    and om.user_id = auth.uid() 
    and om.status = 'active'
  )
);

create policy "teachers update own quiz sessions"
on public.quiz_sessions for update using (
  created_by = auth.uid()
  or
  -- Organization admin can update
  exists (
    select 1 from public.org_members om 
    where om.org_id = quiz_sessions.org_id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

create policy "students read accessible quiz sessions"
on public.quiz_sessions for select using (
  -- Direct participation
  exists(
    select 1 from public.quiz_session_participants qsp
    where qsp.session_id = quiz_sessions.id 
    and qsp.user_id = auth.uid()
  )
  or
  -- Class membership
  (
    class_id is not null
    and exists (
      select 1 from public.class_members cm
      where cm.class_id = quiz_sessions.class_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role = 'student'
    )
  )
);

-- RLS Policies for quiz_session_participants
create policy "participants read session members"
on public.quiz_session_participants for select using (
  -- Teachers can see all participants in their sessions
  exists(
    select 1 from public.quiz_sessions qs
    where qs.id = quiz_session_participants.session_id 
    and qs.created_by = auth.uid()
  )
  or
  -- Students can see themselves
  user_id = auth.uid()
);

create policy "users join sessions"
on public.quiz_session_participants for insert with check (
  user_id = auth.uid()
  and
  -- Verify session is in LOBBY or ACTIVE status
  exists(
    select 1 from public.quiz_sessions qs
    where qs.id = session_id 
    and qs.status in ('LOBBY', 'ACTIVE')
  )
);

create policy "teachers manage participants"
on public.quiz_session_participants for update using (
  exists(
    select 1 from public.quiz_sessions qs
    where qs.id = quiz_session_participants.session_id 
    and qs.created_by = auth.uid()
  )
);

-- RLS Policies for quiz_answers
create policy "teachers read session answers"
on public.quiz_answers for select using (
  exists(
    select 1 from public.quiz_sessions qs
    where qs.id = quiz_answers.session_id 
    and qs.created_by = auth.uid()
  )
);

create policy "students read own answers"
on public.quiz_answers for select using (
  user_id = auth.uid()
);

create policy "students submit answers"
on public.quiz_answers for insert with check (
  user_id = auth.uid()
  and
  -- Verify session is active and allows responses
  exists(
    select 1 from public.quiz_sessions qs
    where qs.id = session_id 
    and qs.status = 'ACTIVE'
  )
  and
  -- Verify user is participant in session
  exists(
    select 1 from public.quiz_session_participants qsp
    where qsp.session_id = quiz_answers.session_id 
    and qsp.user_id = auth.uid()
  )
);

-- Comments for documentation
comment on table public.quiz_sessions is 'Live quiz sessions with PIN-based joining';
comment on column public.quiz_sessions.pin is '6-character A-Z0-9 join code';
comment on column public.quiz_sessions.status is 'Session status: LOBBY, ACTIVE, PAUSED, ENDED';
comment on column public.quiz_sessions.current_index is 'Current active question index (0-based)';
comment on column public.quiz_sessions.settings is 'Session settings: timePerQuestion, showAfterEach, autoAdvance';

comment on table public.quiz_session_participants is 'Users participating in live quiz sessions';
comment on column public.quiz_session_participants.role is 'Participant role: teacher or student';

comment on table public.quiz_answers is 'Student answers for live quiz questions';
comment on column public.quiz_answers.answer is 'Answer: option ID for MC, text for free-text';
comment on column public.quiz_answers.is_correct is 'Auto-calculated answer correctness';