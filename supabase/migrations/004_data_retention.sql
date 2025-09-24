-- Data retention cleanup for GDPR compliance
-- This file contains SQL functions for cleaning up short-term data

-- Function to clean up expired short-term attempts and related data
create or replace function cleanup_short_term_data(cleanup_hours integer default 24)
returns table(
  deleted_attempts integer,
  deleted_answers integer
)
language plpgsql
security definer
as $$
declare
  cutoff_date timestamptz;
  attempt_count integer := 0;
  answer_count integer := 0;
begin
  -- Calculate cutoff date
  cutoff_date := now() - (cleanup_hours || ' hours')::interval;
  
  -- Count answers to be deleted first
  select count(*) into answer_count
  from public.answers a
  join public.attempts att on att.id = a.attempt_id
  where att.data_mode = 'short' 
    and att.created_at < cutoff_date;
  
  -- Delete answers first (due to foreign key constraints)
  delete from public.answers
  where attempt_id in (
    select id from public.attempts
    where data_mode = 'short' 
      and created_at < cutoff_date
  );
  
  -- Count and delete attempts
  select count(*) into attempt_count
  from public.attempts
  where data_mode = 'short' 
    and created_at < cutoff_date;
    
  delete from public.attempts
  where data_mode = 'short' 
    and created_at < cutoff_date;
  
  -- Return counts
  return query select attempt_count, answer_count;
end;
$$;

-- Function to get data retention statistics
create or replace function get_data_retention_stats()
returns table(
  total_attempts integer,
  short_term_attempts integer,
  long_term_attempts integer,
  pending_cleanup integer
)
language plpgsql
security definer
as $$
declare
  cutoff_date timestamptz;
begin
  cutoff_date := now() - '24 hours'::interval;
  
  return query
  select 
    (select count(*)::integer from public.attempts) as total_attempts,
    (select count(*)::integer from public.attempts where data_mode = 'short') as short_term_attempts,
    (select count(*)::integer from public.attempts where data_mode = 'long') as long_term_attempts,
    (select count(*)::integer from public.attempts where data_mode = 'short' and created_at < cutoff_date) as pending_cleanup;
end;
$$;

-- Example usage:
-- SELECT * FROM cleanup_short_term_data(24); -- Clean up data older than 24 hours
-- SELECT * FROM get_data_retention_stats(); -- Get current statistics