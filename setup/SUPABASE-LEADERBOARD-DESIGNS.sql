-- Glossix 0.2.13 leaderboard appearance. Run as project owner.
begin;
alter table glossix_private.profile_extras add column if not exists leaderboard_design text not null default 'none';
insert into glossix_private.cosmetic_catalog(item_id,minimum_level) values ('leaderboard:woven',20),('leaderboard:tidal',35),('leaderboard:chevron',50),('leaderboard:botanical',75),('leaderboard:bronze',100),('leaderboard:crystal',150),('leaderboard:celestial',200),('leaderboard:amethyst',250),('leaderboard:aurora',350),('leaderboard:sapphire',450),('leaderboard:silver',550),('leaderboard:phoenix',650),('leaderboard:gold',750),('leaderboard:nebula',850),('leaderboard:imperial',950),('leaderboard:supreme',1000) on conflict(item_id) do update set minimum_level=excluded.minimum_level;
create or replace function public.glossix_profile_extras_get(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$declare r glossix_private.profile_extras%rowtype;n bigint;begin
 perform public.glossix_profile_view(p_user_id);
 select * into r from glossix_private.profile_extras where user_id=p_user_id;
 select count(*) into n from glossix_private.friendships where status='accepted' and (low_id=p_user_id or high_id=p_user_id);
 return jsonb_build_object('leaderboard_design',case when public.glossix_level(coalesce((select sum(points) from glossix_private.points where user_id=p_user_id),0))::numeric>=20 and glossix_private.cosmetic_allowed(p_user_id,'leaderboard:'||r.leaderboard_design) then r.leaderboard_design else 'none' end,'friend_count',n,'favourite_languages',coalesce(r.favourite_languages,'{}'::text[]),'border_id',case when glossix_private.cosmetic_allowed(p_user_id,'avatar-border:'||coalesce(r.border_id,'none')) then coalesce(r.border_id,'none') else 'none' end);end$$;
create or replace function public.glossix_leaderboard_design_set(p_design text) returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();begin
if u is null then raise exception 'Please sign in first';end if;perform public.glossix_profile_view(u);
if p_design is null or (p_design<>'none' and (public.glossix_level(coalesce((select sum(points) from glossix_private.points where user_id=u),0))::numeric<20 or not glossix_private.cosmetic_allowed(u,'leaderboard:'||p_design))) then raise exception 'This leaderboard design is locked or unavailable';end if;
insert into glossix_private.profile_extras(user_id,leaderboard_design) values(u,p_design) on conflict(user_id) do update set leaderboard_design=excluded.leaderboard_design;return public.glossix_profile_extras_get(u);end$$;
create or replace function public.glossix_leaderboard_languages(p_scope text default 'global',p_period text default 'weekly') returns jsonb language sql security definer set search_path='' as $$
select coalesce(jsonb_agg(to_jsonb(b)||jsonb_build_object('active_languages',p.active_languages,'recent_language',p.recent_language,'avatar_id',p.avatar_id,'border_id',case when glossix_private.cosmetic_allowed(b.user_id,'avatar-border:'||e.border_id) then e.border_id else 'none' end,'leaderboard_design',case when b.account_level::numeric>=20 and glossix_private.cosmetic_allowed(b.user_id,'leaderboard:'||e.leaderboard_design) then e.leaderboard_design else 'none' end) order by b.rank_position,b.username),'[]'::jsonb) from public.glossix_leaderboard_levels(p_scope,p_period) b join glossix_private.profiles p on p.user_id=b.user_id left join glossix_private.profile_extras e on e.user_id=b.user_id;
$$;
revoke all on function public.glossix_leaderboard_design_set(text) from public,anon,authenticated;
grant execute on function public.glossix_leaderboard_design_set(text) to authenticated;
commit;
