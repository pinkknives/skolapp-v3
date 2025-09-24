-- Verification queries for attempt_items and analytics views (no writes)

-- Totals and time span
select count(*) as total_items,
       min(answered_at) as first_answer,
       max(answered_at) as last_answer
from public.attempt_items;

-- Coverage
select count(distinct session_id) as sessions,
       count(distinct user_id) as users
from public.attempt_items;

-- Duplicate guard check (should be empty)
select session_id, user_id, question_id, attempt_no, count(*) as c
from public.attempt_items
group by 1,2,3,4
having count(*) > 1;

-- Quick sample: 5 most recent answers
select session_id, user_id, question_id, question_index, is_correct, score, answered_at
from public.attempt_items
order by answered_at desc
limit 5;


