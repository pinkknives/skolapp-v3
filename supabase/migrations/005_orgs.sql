-- Organizations and members system with RLS
-- Supports multiple teachers per organization with role-based access

-- Organizations table
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Organization members table with roles
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text check (role in ('owner','admin','teacher')) not null default 'teacher',
  status text check (status in ('active','pending','inactive')) not null default 'active',
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Organization invites table
create table if not exists public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null,
  token text not null unique,
  role text check (role in ('admin','teacher')) not null default 'teacher',
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now(),
  unique(org_id, email)
);

-- Add org_id to quizzes table
alter table public.quizzes add column if not exists org_id uuid references public.orgs(id) on delete cascade;

-- Create index for organization queries
create index if not exists idx_orgs_created_by on public.orgs(created_by);
create index if not exists idx_org_members_org_id on public.org_members(org_id);
create index if not exists idx_org_members_user_id on public.org_members(user_id);
create index if not exists idx_org_invites_org_id on public.org_invites(org_id);
create index if not exists idx_org_invites_token on public.org_invites(token);
create index if not exists idx_quizzes_org_id on public.quizzes(org_id);

-- Enable RLS on organization tables
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.org_invites enable row level security;

-- RLS Policies for orgs
-- Users can read organizations they are members of
create policy "user reads own orgs"
on public.orgs for select using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = orgs.id 
    and om.user_id = auth.uid() 
    and om.status = 'active'
  )
);

-- Only authenticated users can create organizations
create policy "authenticated creates orgs"
on public.orgs for insert with check (auth.uid() = created_by);

-- Only owners and admins can update organizations
create policy "owner admin updates orgs"
on public.orgs for update using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = orgs.id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

-- RLS Policies for org_members
-- Users can read members of organizations they belong to
create policy "member reads org members"
on public.org_members for select using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = org_members.org_id 
    and om.user_id = auth.uid() 
    and om.status = 'active'
  )
);

-- Only owners and admins can add members
create policy "owner admin adds members"
on public.org_members for insert with check (
  exists (
    select 1 from public.org_members om 
    where om.org_id = org_members.org_id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

-- Only owners and admins can update members
create policy "owner admin updates members"
on public.org_members for update using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = org_members.org_id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

-- RLS Policies for org_invites
-- Users can read invites for organizations they can manage
create policy "owner admin reads invites"
on public.org_invites for select using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = org_invites.org_id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

-- Only owners and admins can create invites
create policy "owner admin creates invites"
on public.org_invites for insert with check (
  exists (
    select 1 from public.org_members om 
    where om.org_id = org_invites.org_id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

-- Update quiz RLS policies to support organizations
-- Drop existing quiz policies that only check owner_id
drop policy if exists "teacher reads own quizzes" on public.quizzes;
drop policy if exists "teacher writes own quizzes" on public.quizzes;
drop policy if exists "teacher updates own quizzes" on public.quizzes;

-- New organization-aware quiz policies
-- Teachers can read quizzes from their organization
create policy "org member reads org quizzes"
on public.quizzes for select using (
  -- Original owner-based access (for backward compatibility)
  auth.uid() = owner_id
  or
  -- Organization-based access
  (
    org_id is not null
    and exists (
      select 1 from public.org_members om 
      where om.org_id = quizzes.org_id 
      and om.user_id = auth.uid() 
      and om.status = 'active'
    )
  )
);

-- Teachers can create quizzes (will be assigned to their org)
create policy "teacher writes quizzes"
on public.quizzes for insert with check (
  auth.uid() = owner_id
);

-- Teachers can update quizzes they own or from their organization (with restrictions)
create policy "teacher updates own or org quizzes"
on public.quizzes for update using (
  -- Original owner can always update
  auth.uid() = owner_id
  or
  -- Organization members can update if they have sufficient permissions
  (
    org_id is not null
    and exists (
      select 1 from public.org_members om 
      where om.org_id = quizzes.org_id 
      and om.user_id = auth.uid() 
      and om.role in ('owner', 'admin')
      and om.status = 'active'
    )
  )
);

-- Update question RLS policies to support organizations
drop policy if exists "teacher reads questions of own quiz" on public.questions;
drop policy if exists "teacher writes questions of own quiz" on public.questions;
drop policy if exists "teacher updates questions of own quiz" on public.questions;

-- New organization-aware question policies
create policy "org member reads org questions"
on public.questions for select using (
  exists (
    select 1 from public.quizzes q 
    where q.id = questions.quiz_id 
    and (
      q.owner_id = auth.uid()
      or (
        q.org_id is not null
        and exists (
          select 1 from public.org_members om 
          where om.org_id = q.org_id 
          and om.user_id = auth.uid() 
          and om.status = 'active'
        )
      )
    )
  )
);

create policy "teacher writes org questions"
on public.questions for insert with check (
  exists (
    select 1 from public.quizzes q 
    where q.id = quiz_id 
    and (
      q.owner_id = auth.uid()
      or (
        q.org_id is not null
        and exists (
          select 1 from public.org_members om 
          where om.org_id = q.org_id 
          and om.user_id = auth.uid() 
          and om.status = 'active'
        )
      )
    )
  )
);

create policy "teacher updates org questions"
on public.questions for update using (
  exists (
    select 1 from public.quizzes q 
    where q.id = questions.quiz_id 
    and (
      q.owner_id = auth.uid()
      or (
        q.org_id is not null
        and exists (
          select 1 from public.org_members om 
          where om.org_id = q.org_id 
          and om.user_id = auth.uid() 
          and om.role in ('owner', 'admin')
          and om.status = 'active'
        )
      )
    )
  )
);

-- Function to automatically create organization member when org is created
create or replace function create_org_owner_member()
returns trigger
language plpgsql
as $$
begin
  -- Create owner membership for the user who created the organization
  insert into public.org_members (org_id, user_id, role, status)
  values (NEW.id, NEW.created_by, 'owner', 'active');
  
  return NEW;
end;
$$;

-- Trigger to auto-create owner membership
create trigger trigger_create_org_owner_member
  after insert on public.orgs
  for each row execute function create_org_owner_member();

-- Function to update updated_at timestamp for orgs
create or replace function update_org_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

-- Trigger to auto-update updated_at
create trigger trigger_update_org_updated_at
  before update on public.orgs
  for each row execute function update_org_updated_at();