-- Run after SUPABASE-OWNER-SUPPORT.sql. Owner-only full transcript export.
begin;
create or replace function public.glossix_support_export(p_thread_user uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o uuid;result jsonb;
begin
 select user_id into o from glossix_private.owner_badge;
 if auth.uid() is null or o is null or auth.uid()<>o then raise exception 'Only the owner can export support logs';end if;
 perform 1 from glossix_private.support_threads where user_id=p_thread_user and closed for update;
 if not found then raise exception 'Close the conversation before exporting';end if;
 select jsonb_build_object('user_id',s.user_id,'username',p.username,'messages',
 (select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'sent_at',m.sent_at,'username',a.username,'body',m.body) order by m.id),'[]'::jsonb)
 from glossix_private.support_messages m join glossix_private.profiles a on a.user_id=m.author_id where m.thread_user=s.user_id)) into result
 from glossix_private.support_threads s join glossix_private.profiles p on p.user_id=s.user_id where s.user_id=p_thread_user;
 return result;
end;$$;
revoke all on function public.glossix_support_export(uuid) from public,anon;
grant execute on function public.glossix_support_export(uuid) to authenticated;
commit;
