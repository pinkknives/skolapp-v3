begin;

create table if not exists public.libraries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries(id) on delete cascade,
  type text check (type in ('quiz','question')) not null,
  title text not null,
  tags text[],
  latest_version_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.item_versions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.library_items(id) on delete cascade,
  version_no int not null,
  payload jsonb not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(item_id, version_no)
);

create index if not exists idx_libraries_org_id on public.libraries(org_id);
create index if not exists idx_library_items_library_id on public.library_items(library_id);
create index if not exists idx_item_versions_item_id on public.item_versions(item_id);

alter table public.libraries enable row level security;
alter table public.library_items enable row level security;
alter table public.item_versions enable row level security;

-- Members of org can read their libraries
create policy if not exists "member reads org libraries"
  on public.libraries for select
  using (
    exists (
      select 1 from public.org_members om
      where om.org_id = libraries.org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
    )
  );

-- Admin/owner can manage libraries
create policy if not exists "admin manages libraries"
  on public.libraries for all
  using (
    exists (
      select 1 from public.org_members om
      where om.org_id = libraries.org_id
      and om.user_id = auth.uid()
      and om.role in ('owner','admin')
      and om.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.org_members om
      where om.org_id = libraries.org_id
      and om.user_id = auth.uid()
      and om.role in ('owner','admin')
      and om.status = 'active'
    )
  );

-- Items: org members can read; admins create/update
create policy if not exists "member reads library items"
  on public.library_items for select
  using (
    exists (
      select 1 from public.libraries l
      where l.id = library_id
      and exists (
        select 1 from public.org_members om
        where om.org_id = l.org_id
        and om.user_id = auth.uid()
        and om.status = 'active'
      )
    )
  );

create policy if not exists "admin manages library items"
  on public.library_items for all
  using (
    exists (
      select 1 from public.libraries l
      where l.id = library_id
      and exists (
        select 1 from public.org_members om
        where om.org_id = l.org_id
        and om.user_id = auth.uid()
        and om.role in ('owner','admin')
        and om.status = 'active'
      )
    )
  )
  with check (
    exists (
      select 1 from public.libraries l
      where l.id = library_id
      and exists (
        select 1 from public.org_members om
        where om.org_id = l.org_id
        and om.user_id = auth.uid()
        and om.role in ('owner','admin')
        and om.status = 'active'
      )
    )
  );

-- Versions: read for org, insert by any member
create policy if not exists "member reads item versions"
  on public.item_versions for select
  using (
    exists (
      select 1 from public.library_items li
      join public.libraries l on l.id = li.library_id
      where li.id = item_versions.item_id
      and exists (
        select 1 from public.org_members om
        where om.org_id = l.org_id
        and om.user_id = auth.uid()
        and om.status = 'active'
      )
    )
  );

create policy if not exists "member inserts item versions"
  on public.item_versions for insert
  with check (
    exists (
      select 1 from public.library_items li
      join public.libraries l on l.id = li.library_id
      where li.id = item_id
      and exists (
        select 1 from public.org_members om
        where om.org_id = l.org_id
        and om.user_id = auth.uid()
        and om.status = 'active'
      )
    )
  );

commit;
