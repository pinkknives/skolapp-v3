begin;

create table if not exists public.org_domains (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  domain text not null,
  created_at timestamptz default now(),
  unique(org_id, lower(domain)),
  unique(lower(domain))
);

create index if not exists idx_org_domains_org_id on public.org_domains(org_id);

alter table public.org_domains enable row level security;

-- Members can read domains for their org
create policy if not exists "member reads org domains"
  on public.org_domains for select
  using (
    exists (
      select 1 from public.org_members om
      where om.org_id = org_domains.org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
    )
  );

-- Only owner/admin can manage domains for their org
create policy if not exists "admin manages org domains"
  on public.org_domains for all
  using (
    exists (
      select 1 from public.org_members om
      where om.org_id = org_domains.org_id
      and om.user_id = auth.uid()
      and om.role in ('owner','admin')
      and om.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.org_members om
      where om.org_id = org_domains.org_id
      and om.user_id = auth.uid()
      and om.role in ('owner','admin')
      and om.status = 'active'
    )
  );

commit;
