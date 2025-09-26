-- User settings for AI training consent
-- Creates table with RLS and index

begin;

-- Create table if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'user_settings'
  ) then
    create table public.user_settings (
      user_id uuid primary key references auth.users(id) on delete cascade,
      consent_to_ai_training boolean not null default false,
      updated_at timestamptz default now()
    );
  end if;
end $$;

-- Ensure required columns exist (idempotent)
alter table if exists public.user_settings
  add column if not exists consent_to_ai_training boolean not null default false,
  add column if not exists updated_at timestamptz default now();

-- Index (even though PK provides an index, kept per acceptance criteria)
create index if not exists user_settings_user_id_idx on public.user_settings(user_id);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Policies (create only if absent)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_settings' and policyname = 'Users can select own settings'
  ) then
    create policy "Users can select own settings"
      on public.user_settings for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_settings' and policyname = 'Users can insert own settings'
  ) then
    create policy "Users can insert own settings"
      on public.user_settings for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_settings' and policyname = 'Users can update own settings'
  ) then
    create policy "Users can update own settings"
      on public.user_settings for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

commit;


