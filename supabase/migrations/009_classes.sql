-- Classroom management system with RLS and organization integration
-- Extends existing quiz/session system to support class-based teaching

-- Classes table for organizing students
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.orgs(id) on delete cascade,
  name text not null,
  grade text, -- Optional grade level (e.g., "6", "Gymnasiet år 1")
  subject text, -- Optional subject (e.g., "Matematik", "Svenska")
  invite_code varchar(6) not null unique, -- 6-character join code for students
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Class members table (students and teachers in classes)
create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- null for guest students
  alias text, -- Student display name/alias for GDPR-friendly mode
  role text check (role in ('teacher','student')) not null default 'student',
  joined_at timestamptz default now(),
  status text check (status in ('active','inactive')) default 'active',
  unique(class_id, user_id), -- Prevent duplicate memberships
  unique(class_id, alias) where alias is not null -- Prevent duplicate aliases in same class
);

-- Class sessions table (links quiz sessions to classes)
create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  status text check (status in ('scheduled','open','closed')) not null default 'open',
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_at timestamptz default now(),
  unique(class_id, session_id) -- One session per class at a time
);

-- Create indexes for performance
create index if not exists idx_classes_owner_id on public.classes(owner_id);
create index if not exists idx_classes_org_id on public.classes(org_id);
create index if not exists idx_classes_invite_code on public.classes(invite_code);
create index if not exists idx_class_members_class_id on public.class_members(class_id);
create index if not exists idx_class_members_user_id on public.class_members(user_id);
create index if not exists idx_class_sessions_class_id on public.class_sessions(class_id);
create index if not exists idx_class_sessions_session_id on public.class_sessions(session_id);
create index if not exists idx_class_sessions_quiz_id on public.class_sessions(quiz_id);

-- Enable RLS on new tables
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.class_sessions enable row level security;

-- RLS Policies for classes
-- Teachers can read classes they own or are members of their organization
create policy "teacher reads own or org classes"
on public.classes for select using (
  -- Own classes
  auth.uid() = owner_id
  or
  -- Organization classes (if org_id is set)
  (
    org_id is not null
    and exists (
      select 1 from public.org_members om 
      where om.org_id = classes.org_id 
      and om.user_id = auth.uid() 
      and om.status = 'active'
    )
  )
  or
  -- Classes where user is a member (for students or guest teachers)
  exists (
    select 1 from public.class_members cm
    where cm.class_id = classes.id
    and cm.user_id = auth.uid()
    and cm.status = 'active'
  )
);

-- Teachers can create classes
create policy "teacher creates classes"
on public.classes for insert with check (auth.uid() = owner_id);

-- Teachers can update their own classes
create policy "teacher updates own classes"
on public.classes for update using (
  auth.uid() = owner_id
  or
  -- Organization admin/owner can update
  (
    org_id is not null
    and exists (
      select 1 from public.org_members om 
      where om.org_id = classes.org_id 
      and om.user_id = auth.uid() 
      and om.role in ('owner', 'admin')
      and om.status = 'active'
    )
  )
);

-- RLS Policies for class_members
-- Members can read other members in their classes
create policy "member reads class members"
on public.class_members for select using (
  -- Teacher can see all members in their classes
  exists (
    select 1 from public.classes c
    where c.id = class_members.class_id
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
  or
  -- Students can see other members in classes they belong to
  exists (
    select 1 from public.class_members cm
    where cm.class_id = class_members.class_id
    and cm.user_id = auth.uid()
    and cm.status = 'active'
  )
);

-- Anyone can join a class (for student join flow)
create policy "student joins class"
on public.class_members for insert with check (
  role = 'student'
  and (
    auth.uid() = user_id 
    or user_id is null -- Allow guest students
  )
);

-- Teachers can add members to their classes
create policy "teacher adds class members"
on public.class_members for insert with check (
  exists (
    select 1 from public.classes c
    where c.id = class_id
    and c.owner_id = auth.uid()
  )
);

-- Members can update their own status, teachers can update any member
create policy "member updates class membership"
on public.class_members for update using (
  auth.uid() = user_id
  or
  exists (
    select 1 from public.classes c
    where c.id = class_members.class_id
    and c.owner_id = auth.uid()
  )
);

-- RLS Policies for class_sessions
-- Teachers can read sessions for their classes
create policy "teacher reads class sessions"
on public.class_sessions for select using (
  exists (
    select 1 from public.classes c
    where c.id = class_sessions.class_id
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
);

-- Students can read sessions for classes they're in
create policy "student reads class sessions"
on public.class_sessions for select using (
  exists (
    select 1 from public.class_members cm
    where cm.class_id = class_sessions.class_id
    and cm.user_id = auth.uid()
    and cm.status = 'active'
  )
);

-- Teachers can create class sessions
create policy "teacher creates class sessions"
on public.class_sessions for insert with check (
  exists (
    select 1 from public.classes c
    where c.id = class_id
    and c.owner_id = auth.uid()
  )
);

-- Teachers can update their class sessions
create policy "teacher updates class sessions"
on public.class_sessions for update using (
  exists (
    select 1 from public.classes c
    where c.id = class_sessions.class_id
    and c.owner_id = auth.uid()
  )
);

-- Function to generate unique 6-character class invite codes
create or replace function generate_class_invite_code() returns varchar(6) as $$
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

-- Function to ensure unique class invite codes
create or replace function ensure_unique_class_invite_code() returns varchar(6) as $$
declare
  new_code varchar(6);
  attempts integer := 0;
  max_attempts integer := 10;
begin
  loop
    new_code := generate_class_invite_code();
    
    -- Check if code already exists
    if not exists(select 1 from public.classes where invite_code = new_code) then
      return new_code;
    end if;
    
    attempts := attempts + 1;
    if attempts >= max_attempts then
      raise exception 'Could not generate unique invite code after % attempts', max_attempts;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Function to auto-set invite_code on class insert
create or replace function set_class_invite_code()
returns trigger
language plpgsql
as $$
begin
  if NEW.invite_code is null or NEW.invite_code = '' then
    NEW.invite_code := ensure_unique_class_invite_code();
  end if;
  return NEW;
end;
$$;

-- Trigger to auto-generate invite codes
create trigger classes_set_invite_code
  before insert or update on public.classes
  for each row execute function set_class_invite_code();

-- Function to update updated_at timestamp for classes
create or replace function update_class_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

-- Trigger to auto-update updated_at on classes
create trigger trigger_update_classes_updated_at
  before update on public.classes
  for each row execute function update_class_updated_at();

-- Function to automatically add owner as teacher member when class is created
create or replace function create_class_owner_member()
returns trigger
language plpgsql
as $$
begin
  -- Create teacher membership for the user who created the class
  insert into public.class_members (class_id, user_id, role, status)
  values (NEW.id, NEW.owner_id, 'teacher', 'active');
  
  return NEW;
end;
$$;

-- Trigger to auto-create owner membership
create trigger trigger_create_class_owner_member
  after insert on public.classes
  for each row execute function create_class_owner_member();