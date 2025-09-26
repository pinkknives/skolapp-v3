begin;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_audit_logs_org_id on public.audit_logs(org_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

-- Members of org can read audit logs
create policy if not exists "member reads org audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.org_members om
      where om.org_id = audit_logs.org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
    )
  );

-- Any authenticated user can insert for their org if they are a member
create policy if not exists "member inserts org audit logs"
  on public.audit_logs for insert
  with check (
    exists (
      select 1 from public.org_members om
      where om.org_id = audit_logs.org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
    )
  );

commit;
