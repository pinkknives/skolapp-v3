-- Subject Rights Requests receipts
create table if not exists public.srr_requests (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  type text not null check (type in ('export','delete','rectify')),
  payload jsonb,
  status text not null default 'received',
  ack_id text not null
);

comment on table public.srr_requests is 'Receipts and audit for SRR requests (export/delete/rectify).';
create unique index if not exists srr_requests_ack_idx on public.srr_requests (ack_id);
create index if not exists srr_requests_user_idx on public.srr_requests (user_id, created_at desc);

alter table public.srr_requests enable row level security;

-- Users can insert their own requests
create policy srr_requests_insert_self on public.srr_requests
  for insert to authenticated
  with check (user_id = auth.uid());

-- Users can view their own receipts
create policy srr_requests_select_self on public.srr_requests
  for select to authenticated
  using (user_id = auth.uid());
