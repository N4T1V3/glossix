-- Run once in Supabase SQL Editor. Requires the existing owner badge migration.
begin;
create schema if not exists glossix_private;
create table if not exists glossix_private.player_activity (
 user_id uuid primary key references auth.users(id) on delete cascade,
 last_active timestamptz not null,
 last_learning timestamptz
);
create index if not exists player_activity_recent on glossix_private.player_activity(last_active);
create table if not exists glossix_private.player_activity_days (
 user_id uuid not null references auth.users(id) on delete cascade,
 activity_day date not null,
 primary key (activity_day,user_id)
);
alter table glossix_private.player_activity enable row level security;
alter table glossix_private.player_activity_days enable row level security;
revoke all on glossix_private.player_activity,glossix_private.player_activity_days from public,anon,authenticated;
create or replace function public.glossix_activity_ping(p_learning boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); t timestamptz:=clock_timestamp(); updated uuid;
begin
 if u is null then raise exception 'Sign in required'; end if;
 insert into glossix_private.player_activity(user_id,last_active,last_learning)
 values(u,t,case when p_learning then t else null end)
 on conflict(user_id) do update set last_active=t,
 last_learning=case when p_learning then t else null end
 where glossix_private.player_activity.last_active<t-interval '10 seconds'
 returning user_id into updated;
 if updated is not null then
  insert into glossix_private.player_activity_days values(u,(t at time zone 'UTC')::date) on conflict do nothing;
 end if;
end;$$;
create or replace function public.glossix_activity_stats()
returns jsonb language plpgsql security definer set search_path='' as $$
declare t timestamptz:=clock_timestamp(); d date:=(t at time zone 'UTC')::date;
begin
 if coalesce(auth.role(),'')<>'service_role' and not exists(select 1 from glossix_private.owner_badge where user_id=auth.uid()) then
  raise exception 'Owner access required';
 end if;
 return jsonb_build_object(
  'as_of',t,
  'active_now',(select count(*) from glossix_private.player_activity where last_active>t-interval '5 minutes'),
  'learning_now',(select count(*) from glossix_private.player_activity where last_active>t-interval '5 minutes' and last_learning>t-interval '5 minutes'),
  'daily_active',(select count(*) from glossix_private.player_activity_days where activity_day=d),
  'weekly_active',(select count(distinct user_id) from glossix_private.player_activity_days where activity_day between d-6 and d)
 );
end;$$;
revoke all on function public.glossix_activity_ping(boolean) from public,anon;
grant execute on function public.glossix_activity_ping(boolean) to authenticated;
revoke all on function public.glossix_activity_stats() from public,anon;
grant execute on function public.glossix_activity_stats() to authenticated,service_role;
commit;
