-- Org budgets and usage for cost guards
create table if not exists public.org_budgets (
  org_id uuid not null,
  feature text not null check (feature in ('ai_generate','realtime')),
  daily_limit integer not null check (daily_limit >= 0),
  soft_percent integer not null default 80 check (soft_percent between 1 and 100),
  updated_at timestamptz not null default now(),
  primary key (org_id, feature)
);

create table if not exists public.org_usage (
  org_id uuid not null,
  feature text not null check (feature in ('ai_generate','realtime')),
  window_date date not null,
  used integer not null default 0 check (used >= 0),
  primary key (org_id, feature, window_date)
);

alter table public.org_budgets enable row level security;
alter table public.org_usage enable row level security;

-- Allow org admins to read budgets and usage; writes only budgets
create policy org_budgets_select_admin on public.org_budgets for select to authenticated using (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_budgets.org_id and m.user_id = auth.uid() and m.status = 'active' and (m.role = 'admin' or m.role = 'owner')
  )
);

create policy org_budgets_upsert_admin on public.org_budgets for insert to authenticated with check (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_budgets.org_id and m.user_id = auth.uid() and m.status = 'active' and (m.role = 'admin' or m.role = 'owner')
  )
);

create policy org_budgets_update_admin on public.org_budgets for update to authenticated using (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_budgets.org_id and m.user_id = auth.uid() and m.status = 'active' and (m.role = 'admin' or m.role = 'owner')
  )
) with check (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_budgets.org_id and m.user_id = auth.uid() and m.status = 'active' and (m.role = 'admin' or m.role = 'owner')
  )
);

create policy org_usage_select_admin on public.org_usage for select to authenticated using (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_usage.org_id and m.user_id = auth.uid() and m.status = 'active' and (m.role = 'admin' or m.role = 'owner')
  )
);

-- Service role will perform increments
