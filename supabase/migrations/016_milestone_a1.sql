-- Milestone A1: core tables

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  email text,
  school_id uuid references public.schools(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  birthdate date,
  class_id uuid references public.classes(id) on delete set null,
  parental_consent boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text,
  created_by uuid not null references public.teachers(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  score numeric,
  started_at timestamptz,
  completed_at timestamptz,
  answers jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);
create index if not exists idx_quiz_attempts_student_id on public.quiz_attempts(student_id);
create index if not exists idx_quiz_attempts_class_id on public.quiz_attempts(class_id);
create index if not exists idx_quiz_attempts_completed_at_desc on public.quiz_attempts(completed_at desc);
