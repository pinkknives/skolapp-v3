-- Create table for API request metrics
create table if not exists public.api_metrics (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  route text not null,
  method text not null,
  status integer not null,
  duration_ms integer not null check (duration_ms >= 0),
  correlation_id text
);

comment on table public.api_metrics is 'Observability: per-request metrics for API routes (duration, status, etc).';
comment on column public.api_metrics.route is 'Logical route key, e.g., quiz-sessions.answer or quiz-sessions.create';
comment on column public.api_metrics.method is 'HTTP method (GET/POST/...)';
comment on column public.api_metrics.status is 'HTTP status code of the response';
comment on column public.api_metrics.duration_ms is 'Measured duration in milliseconds';
comment on column public.api_metrics.correlation_id is 'Correlation ID propagated via x-correlation-id';

-- Indexes for querying by time and route
create index if not exists api_metrics_created_at_idx on public.api_metrics (created_at desc);
create index if not exists api_metrics_route_created_idx on public.api_metrics (route, created_at desc);
create index if not exists api_metrics_status_idx on public.api_metrics (status);

-- Enable Row Level Security; no public policies by default
alter table public.api_metrics enable row level security;
-- Intentionally no SELECT/INSERT policies. Service role bypasses RLS. Application code should aggregate metrics server-side.
