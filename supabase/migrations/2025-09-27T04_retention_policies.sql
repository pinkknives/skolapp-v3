-- Retention report table
create table if not exists public.retention_reports (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  scope text not null,
  details jsonb not null
);

alter table public.retention_reports enable row level security;
-- Only service role will insert/read in practice; no public policies

-- Helper views for cleanup candidates (documentation, not enforced)
create or replace view public.v_expired_api_metrics as
  select * from public.api_metrics where created_at < now() - interval '90 days';

create or replace view public.v_old_sentry_events as
  select now() as created_at limit 0; -- placeholder, external service

-- Note: Actual scheduled deletion should be performed via a trusted job (Edge Function/cron)
