-- Quiz system tables with RLS and GDPR compliance
-- Supports both korttid (short-term, auto-cleanup) and långtid (long-term with consent)

-- Main quizzes table
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  join_code text not null unique, -- 4 character unique code
  status text check (status in ('draft','published')) not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Questions table with flexible content storage
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  type text check (type in ('mcq','free','image')) not null,
  content jsonb not null,       -- question text, options, etc
  answer_key jsonb,             -- correct answers where applicable
  points numeric not null default 1,
  created_at timestamptz default now()
);

-- Student attempts at quizzes
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid references auth.users(id) on delete set null,
  data_mode text check (data_mode in ('short','long')) not null default 'short',
  started_at timestamptz default now(),
  finished_at timestamptz,
  student_alias text, -- for guest mode
  created_at timestamptz default now()
);

-- Individual answers to questions
create table if not exists public.answers (
  attempt_id uuid references public.attempts(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  value jsonb,
  score numeric,
  created_at timestamptz default now(),
  primary key (attempt_id, question_id)
);

-- Consent records for long-term data storage
create table if not exists public.consents (
  student_id uuid primary key references auth.users(id) on delete cascade,
  guardian_email text,
  guardian_name text,
  granted_at timestamptz,
  expires_at timestamptz,
  scope text default 'longterm',
  status text check (status in ('pending','approved','denied','expired')) default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.answers enable row level security;
alter table public.consents enable row level security;

-- RLS Policies for quizzes
create policy "teacher reads own quizzes"
on public.quizzes for select using (auth.uid() = owner_id);

create policy "teacher writes own quizzes"
on public.quizzes for insert with check (auth.uid() = owner_id);

create policy "teacher updates own quizzes"
on public.quizzes for update using (auth.uid() = owner_id);

-- Students can read published quizzes (for join flow)
create policy "student reads published quiz"
on public.quizzes for select using (status = 'published');

-- RLS Policies for questions
create policy "teacher reads questions of own quiz"
on public.questions for select using (
  exists (select 1 from public.quizzes q where q.id = questions.quiz_id and q.owner_id = auth.uid())
);

create policy "teacher writes questions of own quiz"
on public.questions for insert with check (
  exists (select 1 from public.quizzes q where q.id = quiz_id and q.owner_id = auth.uid())
);

create policy "teacher updates questions of own quiz"
on public.questions for update using (
  exists (select 1 from public.quizzes q where q.id = questions.quiz_id and q.owner_id = auth.uid())
);

-- Students can read questions of published quizzes they're attempting
create policy "student reads questions of published quiz"
on public.questions for select using (
  exists (
    select 1 from public.quizzes q 
    where q.id = questions.quiz_id 
    and q.status = 'published'
    and exists (
      select 1 from public.attempts a 
      where a.quiz_id = q.id 
      and a.student_id = auth.uid()
    )
  )
);

-- RLS Policies for attempts
create policy "student reads own attempts"
on public.attempts for select using (auth.uid() = student_id);

create policy "student writes own attempts"
on public.attempts for insert with check (auth.uid() = student_id);

create policy "student updates own attempts"
on public.attempts for update using (auth.uid() = student_id);

-- Teachers can read attempts for their quizzes
create policy "teacher reads attempts of own quiz"
on public.attempts for select using (
  exists (select 1 from public.quizzes q where q.id = attempts.quiz_id and q.owner_id = auth.uid())
);

-- RLS Policies for answers
create policy "student reads own answers"
on public.answers for select using (
  exists (select 1 from public.attempts a where a.id = answers.attempt_id and a.student_id = auth.uid())
);

create policy "student writes own answers"
on public.answers for insert with check (
  exists (select 1 from public.attempts a where a.id = answers.attempt_id and a.student_id = auth.uid())
);

create policy "student updates own answers"
on public.answers for update using (
  exists (select 1 from public.attempts a where a.id = answers.attempt_id and a.student_id = auth.uid())
);

-- Teachers can read answers for their quiz attempts
create policy "teacher reads answers of own quiz"
on public.answers for select using (
  exists (
    select 1 from public.attempts a
    join public.quizzes q on q.id = a.quiz_id
    where a.id = answers.attempt_id and q.owner_id = auth.uid()
  )
);

-- RLS Policies for consents
create policy "student reads own consent"
on public.consents for select using (auth.uid() = student_id);

create policy "student upserts own consent"
on public.consents for insert with check (auth.uid() = student_id);

create policy "student updates own consent" 
on public.consents for update using (auth.uid() = student_id);

-- Create indexes for performance
create index if not exists idx_quizzes_owner_id on public.quizzes(owner_id);
create index if not exists idx_quizzes_join_code on public.quizzes(join_code);
create index if not exists idx_quizzes_status on public.quizzes(status);
create index if not exists idx_questions_quiz_id on public.questions(quiz_id);
create index if not exists idx_attempts_quiz_id on public.attempts(quiz_id);
create index if not exists idx_attempts_student_id on public.attempts(student_id);
create index if not exists idx_attempts_data_mode on public.attempts(data_mode);
create index if not exists idx_attempts_created_at on public.attempts(created_at);
create index if not exists idx_answers_attempt_id on public.answers(attempt_id);
create index if not exists idx_consents_status on public.consents(status);

-- Function to generate unique join codes
create or replace function generate_unique_join_code()
returns text
language plpgsql
as $$
declare
  new_code text;
  code_exists boolean;
begin
  loop
    -- Generate 4-character alphanumeric code
    new_code := upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists
    select exists(select 1 from public.quizzes where join_code = new_code) into code_exists;
    
    -- If code doesn't exist, we can use it
    if not code_exists then
      return new_code;
    end if;
  end loop;
end;
$$;

-- Function to auto-set join_code on quiz insert if not provided
create or replace function set_quiz_join_code()
returns trigger
language plpgsql
as $$
begin
  if NEW.join_code is null or NEW.join_code = '' then
    NEW.join_code := generate_unique_join_code();
  end if;
  return NEW;
end;
$$;

-- Trigger to auto-generate join codes
create trigger trigger_set_quiz_join_code
  before insert on public.quizzes
  for each row execute function set_quiz_join_code();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

-- Trigger to auto-update updated_at on quizzes
create trigger trigger_update_quizzes_updated_at
  before update on public.quizzes
  for each row execute function update_updated_at_column();