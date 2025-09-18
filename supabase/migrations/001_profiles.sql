create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('teacher','student')) not null default 'teacher',
  display_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "read own profile"
on public.profiles for select
using (auth.uid() = user_id);

create policy "upsert own profile"
on public.profiles for insert with check (auth.uid() = user_id);

create policy "update own profile"
on public.profiles for update using (auth.uid() = user_id);