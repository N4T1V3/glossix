-- Run after SUPABASE-OWNER-CROWN.sql in the Supabase SQL Editor.
-- Uses the same permanent owner account; no username-based badge assignment.
begin;
create or replace function public.glossix_owner_badges(p_user_ids uuid[])
returns uuid[] language plpgsql security definer set search_path='' as $$
declare owner_id uuid;
begin
  if auth.uid() is null then raise exception 'Please sign in'; end if;
  if coalesce(cardinality(p_user_ids),0)>101 then raise exception 'Too many profiles'; end if;
  select user_id into owner_id from glossix_private.owner_badge;
  if owner_id is null or not (owner_id=any(coalesce(p_user_ids,'{}'::uuid[]))) then
    return '{}'::uuid[];
  end if;
  perform public.glossix_profile_view(owner_id);
  return array[owner_id];
end;
$$;
revoke all on function public.glossix_owner_badges(uuid[]) from public,anon;
grant execute on function public.glossix_owner_badges(uuid[]) to authenticated;
commit;
