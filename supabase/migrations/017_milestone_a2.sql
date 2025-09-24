-- Milestone A2: RLS & policies for core tables

-- Enable RLS
alter table if exists public.schools enable row level security;
alter table if exists public.teachers enable row level security;
alter table if exists public.classes enable row level security;
alter table if exists public.students enable row level security;
alter table if exists public.quizzes enable row level security;
alter table if exists public.quiz_attempts enable row level security;

-- Helper notes:
-- We assume teacher identity is auth.users.id and mapped via teachers.user_id
-- We assume students.id corresponds to auth.users.id for student-auth reads/writes

-- Default deny: no select/insert/update/delete for anon/public

-- TEACHERS
-- Teachers can read/write their own teacher record
create policy if not exists teachers_rw_own
on public.teachers
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- CLASSES
-- Teachers can read/write classes they own (via teachers.user_id)
create policy if not exists classes_rw_by_owner_teacher
on public.classes
for all
using (
  exists (
    select 1 from public.teachers t
    where t.id = classes.teacher_id
      and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.teachers t
    where t.id = classes.teacher_id
      and t.user_id = auth.uid()
  )
);

-- STUDENTS
-- Teachers can read/write students in their classes
create policy if not exists students_rw_by_teacher
on public.students
for all
using (
  exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.teacher_id
    where c.id = students.class_id
      and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.teacher_id
    where c.id = students.class_id
      and t.user_id = auth.uid()
  )
);

-- Students can read/update own record (if ids align with auth)
create policy if not exists students_read_own
on public.students
for select
using (id = auth.uid());

create policy if not exists students_update_own
on public.students
for update
using (id = auth.uid())
with check (id = auth.uid());

-- QUIZZES
-- Teachers can read/write quizzes they created
create policy if not exists quizzes_rw_by_creator
on public.quizzes
for all
using (
  exists (
    select 1 from public.teachers t
    where t.id = quizzes.created_by
      and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.teachers t
    where t.id = quizzes.created_by
      and t.user_id = auth.uid()
  )
);

-- QUIZ_ATTEMPTS
-- Teachers can read attempts for their classes or their quizzes
create policy if not exists quiz_attempts_read_by_teacher
on public.quiz_attempts
for select
using (
  exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.teacher_id
    where c.id = quiz_attempts.class_id
      and t.user_id = auth.uid()
  )
  or exists (
    select 1 from public.quizzes q
    join public.teachers t on t.id = q.created_by
    where q.id = quiz_attempts.quiz_id
      and t.user_id = auth.uid()
  )
);

-- Teachers can insert/update attempts scoped to their classes
create policy if not exists quiz_attempts_write_by_teacher
on public.quiz_attempts
for insert
with check (
  exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.teacher_id
    where c.id = quiz_attempts.class_id
      and t.user_id = auth.uid()
  )
);

create policy if not exists quiz_attempts_update_by_teacher
on public.quiz_attempts
for update
using (
  exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.teacher_id
    where c.id = quiz_attempts.class_id
      and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.classes c
    join public.teachers t on t.id = c.teacher_id
    where c.id = quiz_attempts.class_id
      and t.user_id = auth.uid()
  )
);

-- Students can read only their own attempts
create policy if not exists quiz_attempts_read_own
on public.quiz_attempts
for select
using (student_id = auth.uid());

-- Students can insert attempts for themselves with GDPR check
-- Block writes if parental_consent=false and age < 13
create policy if not exists quiz_attempts_insert_own_with_gdpr
on public.quiz_attempts
for insert
with check (
  student_id = auth.uid()
  and not exists (
    select 1 from public.students s
    where s.id = quiz_attempts.student_id
      and s.parental_consent = false
      and date_part('year', age(now(), s.birthdate)) < 13
  )
);
