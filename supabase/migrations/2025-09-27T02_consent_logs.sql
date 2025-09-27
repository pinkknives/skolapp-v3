-- Consent logs for auditability and export
create table if not exists public.consent_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  org_id uuid,
  scope text not null, -- e.g., 'ai_training', 'cookies', 'telemetry'
  event text not null check (event in ('accepted','declined','changed')),
  previous boolean,
  current boolean,
  actor_user_id uuid not null,
  ip text,
  user_agent text
);

comment on table public.consent_logs is 'Immutable, append-only consent audit log. No PII beyond user-id + minimal headers.';

create index if not exists consent_logs_user_idx on public.consent_logs (user_id, created_at desc);
create index if not exists consent_logs_org_idx on public.consent_logs (org_id, created_at desc);
create index if not exists consent_logs_scope_idx on public.consent_logs (scope);

alter table public.consent_logs enable row level security;

-- Allow users to insert their own consent log entries
create policy consent_logs_insert_self on public.consent_logs
  for insert to authenticated
  with check (
    actor_user_id = auth.uid() and user_id = auth.uid()
  );

-- Allow users to view their own consent logs
create policy consent_logs_select_self on public.consent_logs
  for select to authenticated
  using (user_id = auth.uid());

-- Allow org admins to view consent logs for their org
create policy consent_logs_select_org_admin on public.consent_logs
  for select to authenticated
  using (
    org_id is not null and exists (
      select 1 from public.org_members m
      where m.org_id = consent_logs.org_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and (m.role = 'admin' or m.role = 'owner')
    )
  );
