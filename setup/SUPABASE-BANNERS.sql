-- Profile gradients and free level-earned banners. Run after profile/course setup.
begin;
create table if not exists glossix_private.profile_banners(user_id uuid primary key references auth.users(id) on delete cascade,banner_id text not null default 'classic');
alter table glossix_private.profile_banners enable row level security;
revoke all on glossix_private.profile_banners from public,anon,authenticated;
create or replace function public.glossix_banner_get(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b text;begin
 perform public.glossix_profile_view(p_user_id);
 select banner_id into b from glossix_private.profile_banners where user_id=p_user_id;
 return jsonb_build_object('banner_id',coalesce(b,'classic'));
end$$;
create or replace function public.glossix_banner_set(p_banner text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();required_level integer;account_level numeric;begin
 if u is null then raise exception 'Please sign in first';end if;
 perform public.glossix_profile_view(u);
 select v.minimum into required_level from (values ('classic',1),('black',1),('red',1),('yellow',1),('green',1),('purple',1),('brown',1),('blue',1),('pink',1),('orange',1),('navy',1),('coral',1),('mint',1),('plum',1),('bronze',5),('silver',10),('gold',20),('aurora',35),('sapphire',50),('rose-gold',75),('obsidian',100),('opal',150),('solar',250),('cosmos',500),('legend',1000)) v(id,minimum) where v.id=p_banner;
 if required_level is null then raise exception 'Choose a listed banner';end if;
 select public.glossix_level(coalesce(sum(points),0)) into account_level from glossix_private.points where user_id=u;
 if account_level<required_level then raise exception 'This banner unlocks at level %',required_level;end if;
 insert into glossix_private.profile_banners(user_id,banner_id) values(u,p_banner) on conflict(user_id) do update set banner_id=excluded.banner_id;
 return public.glossix_banner_get(u);
end$$;
revoke all on function public.glossix_banner_get(uuid),public.glossix_banner_set(text) from public,anon,authenticated;
grant execute on function public.glossix_banner_get(uuid),public.glossix_banner_set(text) to authenticated;
commit;
