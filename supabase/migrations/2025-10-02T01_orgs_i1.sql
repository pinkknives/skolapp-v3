-- I1: Orgs slug, schools.org_id + RLS, tighten org/org_members policies

begin;

-- Add slug to orgs (unique, lowercase)
alter table if exists public.orgs
  add column if not exists slug text;

create unique index if not exists idx_orgs_slug on public.orgs((lower(slug)));

-- Add org_id to schools and index
alter table if exists public.schools
  add column if not exists org_id uuid references public.orgs(id) on delete cascade;

create index if not exists idx_schools_org_id on public.schools(org_id);

-- Enable RLS on schools
alter table if exists public.schools enable row level security;

-- RLS: members of org can select schools in their org
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'schools' and policyname = 'member reads org schools'
  ) then
    create policy "member reads org schools"
      on public.schools for select
      using (
        org_id is null or exists (
          select 1 from public.org_members om
          where om.org_id = schools.org_id
          and om.user_id = auth.uid()
          and om.status = 'active'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'schools' and policyname = 'admin manages org schools'
  ) then
    create policy "admin manages org schools"
      on public.schools for all
      using (
        org_id is not null and exists (
          select 1 from public.org_members om
          where om.org_id = schools.org_id
          and om.user_id = auth.uid()
          and om.role in ('owner','admin')
          and om.status = 'active'
        )
      )
      with check (
        org_id is not null and exists (
          select 1 from public.org_members om
          where om.org_id = schools.org_id
          and om.user_id = auth.uid()
          and om.role in ('owner','admin')
          and om.status = 'active'
        )
      );
  end if;
end $$;

-- Tighten orgs: allow delete to owner/admin only (insert/update already set)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'orgs' and policyname = 'owner admin deletes orgs'
  ) then
    create policy "owner admin deletes orgs"
      on public.orgs for delete using (
        exists (
          select 1 from public.org_members om
          where om.org_id = orgs.id
          and om.user_id = auth.uid()
          and om.role in ('owner','admin')
          and om.status = 'active'
        )
      );
  end if;
end $$;

-- Tighten org_members: allow delete by owner/admin only (optional, many flows use status)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'org_members' and policyname = 'owner admin deletes members'
  ) then
    create policy "owner admin deletes members"
      on public.org_members for delete using (
        exists (
          select 1 from public.org_members om
          where om.org_id = org_members.org_id
          and om.user_id = auth.uid()
          and om.role in ('owner','admin')
          and om.status = 'active'
        )
      );
  end if;
end $$;

commit;


