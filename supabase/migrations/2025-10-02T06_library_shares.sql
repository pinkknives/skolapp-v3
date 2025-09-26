begin;

create table if not exists public.library_shares (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.library_items(id) on delete cascade,
  token text not null unique,
  can_copy boolean not null default true,
  expires_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_library_shares_item_id on public.library_shares(item_id);
create index if not exists idx_library_shares_expires_at on public.library_shares(expires_at);

alter table public.library_shares enable row level security;

-- Org members can read shares for items in their org
create policy if not exists "member reads library shares"
  on public.library_shares for select
  using (
    exists (
      select 1 from public.library_items li
      join public.libraries l on l.id = li.library_id
      join public.org_members om on om.org_id = l.org_id and om.user_id = auth.uid() and om.status = 'active'
      where li.id = library_shares.item_id
    )
  );

-- Any authenticated member who can access item can create a share
create policy if not exists "member inserts library shares"
  on public.library_shares for insert
  with check (
    exists (
      select 1 from public.library_items li
      join public.libraries l on l.id = li.library_id
      join public.org_members om on om.org_id = l.org_id and om.user_id = auth.uid() and om.status = 'active'
      where li.id = item_id
    )
  );

commit;
