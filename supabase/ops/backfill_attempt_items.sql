-- Backfill attempt_items from legacy session_attempts and refresh analytics views
-- Safe to run multiple times (idempotent).

begin;
set local statement_timeout = '10min';
set local lock_timeout = '30s';

-- Populate attempt_items from session_attempts if missing
select migrate_session_attempts_to_items();

-- Refresh materialized views that power teacher analytics
refresh materialized view concurrently public.session_question_stats;
refresh materialized view concurrently public.session_user_best;

-- Update planner stats
analyze public.attempt_items;

commit;

-- Verification (read-only)
-- Total count and time span
select count(*) as total_items,
       min(answered_at) as first_answer,
       max(answered_at) as last_answer
from public.attempt_items;

-- Coverage
select count(distinct session_id) as sessions,
       count(distinct user_id) as users
from public.attempt_items;

-- Duplicate guard check (should return 0 rows)
select session_id, user_id, question_id, attempt_no, count(*) as c
from public.attempt_items
group by 1,2,3,4
having count(*) > 1;


