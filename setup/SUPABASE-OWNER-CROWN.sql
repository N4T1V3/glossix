-- Run in the Supabase SQL Editor as the project administrator.
-- Exactly one account can hold this badge. The UUID survives username changes.
begin;
create table if not exists glossix_private.owner_badge (
  singleton boolean primary key default true check(singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table glossix_private.owner_badge enable row level security;
revoke all on glossix_private.owner_badge from public,anon,authenticated;
insert into glossix_private.owner_badge(singleton,user_id)
select true,user_id from glossix_private.profiles where lower(username)='n4tive'
on conflict(singleton) do nothing;
create or replace function public.glossix_owner_badge(p_user_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  -- Reuse existing profile visibility checks. No private labels are returned.
  perform public.glossix_profile_view(p_user_id);
  return exists(select 1 from glossix_private.owner_badge where user_id=p_user_id);
end;
$$;
revoke all on function public.glossix_owner_badge(uuid) from public,anon;
grant execute on function public.glossix_owner_badge(uuid) to authenticated;
commit;
-- Confirm the selected owner privately.
select p.username,b.user_id from glossix_private.owner_badge b
join glossix_private.profiles p on p.user_id=b.user_id;
