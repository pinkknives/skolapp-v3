-- Add teacher verification fields to profiles table
alter table public.profiles add column if not exists verification_status text check (verification_status in ('pending', 'verified', 'rejected')) default 'pending';
alter table public.profiles add column if not exists verification_documents text[]; -- Array of document URLs/paths
alter table public.profiles add column if not exists school_name text;
alter table public.profiles add column if not exists school_email text;
alter table public.profiles add column if not exists verification_requested_at timestamp with time zone;
alter table public.profiles add column if not exists verified_at timestamp with time zone;
alter table public.profiles add column if not exists verified_by uuid references auth.users(id);

-- Create verification requests table for tracking
create table if not exists public.teacher_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  school_name text not null,
  school_email text not null,
  work_email text not null,
  teaching_subject text,
  years_teaching integer,
  documents text[],
  status text check (status in ('pending', 'under_review', 'approved', 'rejected')) default 'pending',
  admin_notes text,
  created_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid references auth.users(id)
);

alter table public.teacher_verification_requests enable row level security;

-- RLS policies for verification requests
create policy "Users can read own verification requests"
on public.teacher_verification_requests for select
using (auth.uid() = user_id);

create policy "Users can create own verification requests"
on public.teacher_verification_requests for insert with check (auth.uid() = user_id);

create policy "Users can update own verification requests"
on public.teacher_verification_requests for update using (auth.uid() = user_id);