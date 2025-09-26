-- L2: Push settings columns
begin;

alter table if exists public.user_settings
  add column if not exists push_enabled boolean not null default false;
comment on column public.user_settings.push_enabled is 'User allows push notifications';

alter table if exists public.classes
  add column if not exists push_notifications_enabled boolean not null default false;
comment on column public.classes.push_notifications_enabled is 'Enable push notifications for this class';

commit;

