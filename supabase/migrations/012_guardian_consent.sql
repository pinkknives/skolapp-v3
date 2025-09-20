-- GDPR Guardian Consent System v1
-- Implements consent flow for Korttidsläge ⇄ Långtidsläge

-- Add consent configuration fields to org_settings table (extend existing or create)
-- First check if org_settings exists from previous migrations
do $$
begin
  if not exists (select 1 from information_schema.tables where table_name = 'org_settings') then
    create table public.org_settings (
      org_id uuid primary key references public.orgs(id) on delete cascade,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    
    alter table public.org_settings enable row level security;
    
    -- RLS: Only org admins/owners can manage settings
    create policy "org admin manages settings"
    on public.org_settings for all using (
      exists (
        select 1 from public.org_members om 
        where om.org_id = org_settings.org_id 
        and om.user_id = auth.uid() 
        and om.role in ('owner', 'admin')
        and om.status = 'active'
      )
    );
  end if;
end $$;

-- Add GDPR consent fields to org_settings
alter table public.org_settings 
add column if not exists require_guardian_consent boolean default false,
add column if not exists consent_valid_months integer default 12,
add column if not exists retention_korttid_days integer default 30;

-- Guardian consent records (replaces/updates existing consents table)
-- First migrate existing data if needed, then update structure
do $$
begin
  -- Rename existing consents table if it exists
  if exists (select 1 from information_schema.tables where table_name = 'consents') then
    alter table public.consents rename to consents_old;
  end if;
end $$;

-- Create new guardian_consents table with updated schema
create table if not exists public.guardian_consents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text check (status in ('missing','pending','granted','revoked','expired')) not null default 'missing',
  granted_at timestamptz null,
  revoked_at timestamptz null,
  expires_at timestamptz null,
  method text check (method in ('email','paper','admin-override')) default 'email',
  evidence jsonb default '{}',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id, student_id)
);

-- Consent invitations table
create table if not exists public.consent_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  guardian_email text not null,
  token text not null unique,
  status text check (status in ('sent','visited','completed','expired')) not null default 'sent',
  sent_at timestamptz default now(),
  completed_at timestamptz null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  meta jsonb default '{}',
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_guardian_consents_org_student on public.guardian_consents(org_id, student_id);
create index if not exists idx_guardian_consents_expires_at on public.guardian_consents(expires_at);
create index if not exists idx_guardian_consents_status on public.guardian_consents(status);
create index if not exists idx_consent_invites_org_student on public.consent_invites(org_id, student_id);
create index if not exists idx_consent_invites_token on public.consent_invites(token);
create index if not exists idx_consent_invites_expires_at on public.consent_invites(expires_at);

-- Enable RLS
alter table public.guardian_consents enable row level security;
alter table public.consent_invites enable row level security;

-- RLS Policies for guardian_consents
-- Teachers can read consent status for students in their org
create policy "teacher reads org student consents"
on public.guardian_consents for select using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = guardian_consents.org_id 
    and om.user_id = auth.uid() 
    and om.status = 'active'
  )
);

-- Admins can manage all consent records in their org
create policy "admin manages org consents"
on public.guardian_consents for all using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = guardian_consents.org_id 
    and om.user_id = auth.uid() 
    and om.role in ('owner', 'admin')
    and om.status = 'active'
  )
);

-- Students can read their own consent status (limited fields)
create policy "student reads own consent status"
on public.guardian_consents for select using (auth.uid() = student_id);

-- RLS Policies for consent_invites
-- Only teachers/admins can manage invites
create policy "teacher manages consent invites"
on public.consent_invites for all using (
  exists (
    select 1 from public.org_members om 
    where om.org_id = consent_invites.org_id 
    and om.user_id = auth.uid() 
    and om.status = 'active'
  )
);

-- Function to update updated_at timestamp
create or replace function update_guardian_consent_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  return NEW;
end;
$$;

-- Trigger to auto-update timestamps
create trigger trigger_update_guardian_consent_updated_at
  before update on public.guardian_consents
  for each row execute function update_guardian_consent_updated_at();

-- Function to auto-expire consents
create or replace function expire_guardian_consents()
returns void
language plpgsql
as $$
begin
  update public.guardian_consents 
  set status = 'expired', updated_at = now()
  where status = 'granted' 
  and expires_at < now();
  
  update public.consent_invites 
  set status = 'expired'
  where status in ('sent', 'visited') 
  and expires_at < now();
end;
$$;

-- Migrate existing consent data if any
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'consents_old') then
    insert into public.guardian_consents (
      student_id, 
      org_id,
      status, 
      granted_at, 
      expires_at, 
      method,
      created_at
    )
    select 
      student_id,
      -- We need to find the org_id for each student, defaulting to first org if multiple
      coalesce(
        (select om.org_id from public.org_members om where om.user_id = co.student_id and om.status = 'active' limit 1),
        (select id from public.orgs limit 1)
      ) as org_id,
      case 
        when co.status = 'approved' then 'granted'
        when co.status = 'denied' then 'revoked'
        when co.status = 'expired' then 'expired'
        else 'pending'
      end as status,
      co.granted_at,
      co.expires_at,
      'email' as method,
      co.created_at
    from consents_old co
    where exists (select 1 from auth.users u where u.id = co.student_id);
    
    -- Drop old table after migration
    drop table public.consents_old;
  end if;
end $$;