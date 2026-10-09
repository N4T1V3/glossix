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

-- Free earned designs and owner grants. Run after SUPABASE-BANNERS.sql.
begin;
create table if not exists glossix_private.cosmetic_catalog(item_id text primary key,minimum_level integer not null check(minimum_level>=1));
insert into glossix_private.cosmetic_catalog values ('banner:classic',1),('banner:black',1),('banner:red',1),('banner:yellow',1),('banner:green',1),('banner:purple',1),('banner:brown',1),('banner:blue',1),('banner:pink',1),('banner:orange',1),('banner:navy',1),('banner:coral',1),('banner:mint',1),('banner:plum',1),('banner:bronze',5),('banner:silver',10),('banner:gold',20),('banner:aurora',35),('banner:sapphire',50),('banner:rose-gold',75),('banner:obsidian',100),('banner:opal',150),('banner:solar',250),('banner:cosmos',500),('banner:legend',1000),('design:plain',1),('design:sage',5),('design:ocean',10),('design:rose',15),('design:sand',25),('design:lavender',35),('design:copper',50),('design:silver',75),('design:gold',100),('design:night',150),('design:forest',250),('design:cosmic',500),('design:legend',1000) on conflict(item_id) do update set minimum_level=excluded.minimum_level;
create table if not exists glossix_private.cosmetic_grants(user_id uuid references auth.users(id) on delete cascade,item_id text references glossix_private.cosmetic_catalog(item_id),granted_at timestamptz not null default now(),primary key(user_id,item_id));
create table if not exists glossix_private.profile_designs(user_id uuid primary key references auth.users(id) on delete cascade,design_id text not null default 'plain');
alter table glossix_private.cosmetic_catalog enable row level security;
alter table glossix_private.cosmetic_grants enable row level security;
alter table glossix_private.profile_designs enable row level security;
revoke all on glossix_private.cosmetic_catalog,glossix_private.cosmetic_grants,glossix_private.profile_designs from public,anon,authenticated;
create or replace function public.glossix_cosmetics_get(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b jsonb;d text;g jsonb;begin
 b:=public.glossix_banner_get(p_user_id);
 select design_id into d from glossix_private.profile_designs where user_id=p_user_id;
 if p_user_id=auth.uid() then select coalesce(jsonb_agg(item_id),'[]'::jsonb) into g from glossix_private.cosmetic_grants where user_id=p_user_id;else g:='[]'::jsonb;end if;
 return b||jsonb_build_object('design_id',coalesce(d,'plain'),'granted_items',g);end$$;
create or replace function glossix_private.cosmetic_allowed(p_user uuid,p_item text) returns boolean language sql stable set search_path='' as $$
 select exists(select 1 from glossix_private.cosmetic_catalog c where c.item_id=p_item and (public.glossix_level((select coalesce(sum(points),0) from glossix_private.points where user_id=p_user))::numeric>=c.minimum_level or exists(select 1 from glossix_private.cosmetic_grants g where g.user_id=p_user and g.item_id=p_item)));
$$;
create or replace function public.glossix_banner_set(p_banner text) returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Please sign in first';end if;perform public.glossix_profile_view(u);
 if not glossix_private.cosmetic_allowed(u,'banner:'||p_banner) then raise exception 'This banner is locked or unavailable';end if;
 insert into glossix_private.profile_banners(user_id,banner_id) values(u,p_banner) on conflict(user_id) do update set banner_id=excluded.banner_id;return public.glossix_cosmetics_get(u);end$$;
create or replace function public.glossix_design_set(p_design text) returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Please sign in first';end if;perform public.glossix_profile_view(u);
 if not glossix_private.cosmetic_allowed(u,'design:'||p_design) then raise exception 'This design is locked or unavailable';end if;
 insert into glossix_private.profile_designs(user_id,design_id) values(u,p_design) on conflict(user_id) do update set design_id=excluded.design_id;return public.glossix_cosmetics_get(u);end$$;
-- Owner-only: use SQL Editor, never grant this function to app roles.
create or replace function glossix_private.cosmetic_grant(p_username text,p_item text) returns void language plpgsql security definer set search_path='' as $$declare u uuid;begin
 select user_id into u from glossix_private.profiles where username=lower(trim(p_username));if u is null then raise exception 'Username not found';end if;
 if not exists(select 1 from glossix_private.cosmetic_catalog where item_id=p_item) then raise exception 'Unknown reward';end if;
 insert into glossix_private.cosmetic_grants(user_id,item_id) values(u,p_item) on conflict do nothing;end$$;
revoke all on function glossix_private.cosmetic_allowed(uuid,text),glossix_private.cosmetic_grant(text,text) from public,anon,authenticated;
revoke all on function public.glossix_cosmetics_get(uuid),public.glossix_banner_set(text),public.glossix_design_set(text) from public,anon,authenticated;
grant execute on function public.glossix_cosmetics_get(uuid),public.glossix_banner_set(text),public.glossix_design_set(text) to authenticated;
commit;

-- Expand the reward catalogue to fifty designs; existing selections/grants remain.
begin;
insert into glossix_private.cosmetic_catalog(item_id,minimum_level) values ('design:plain',1),('design:sage',5),('design:ocean',10),('design:rose',15),('design:tidal',20),('design:sand',25),('design:citrus',30),('design:lavender',35),('design:fuchsia',40),('design:copper',50),('design:azure',60),('design:silver',75),('design:ember',90),('design:gold',100),('design:jade',120),('design:night',150),('design:amethyst',175),('design:sunburst',200),('design:lagoon',225),('design:forest',250),('design:ruby',275),('design:peacock',300),('design:electric',325),('design:orchid',350),('design:terracotta',375),('design:glacier',400),('design:saffron',425),('design:cherry',450),('design:neon',475),('design:cosmic',500),('design:emerald',525),('design:prism',550),('design:indigo',575),('design:coral',600),('design:sapphire',625),('design:rainforest',650),('design:magenta',675),('design:cobalt',700),('design:carnival',725),('design:garnet',750),('design:aurora',775),('design:phoenix',800),('design:royal',825),('design:platinum',850),('design:solar',875),('design:nebula',900),('design:opal',925),('design:dragon',950),('design:infinity',975),('design:legend',1000) on conflict(item_id) do update set minimum_level=excluded.minimum_level;
commit;

-- Revised progression: ordinary colours below level 50; premium gold/supreme high.
begin;
insert into glossix_private.cosmetic_catalog(item_id,minimum_level) values ('banner:classic',1),('banner:black',1),('banner:red',1),('banner:yellow',1),('banner:green',1),('banner:purple',1),('banner:brown',1),('banner:blue',1),('banner:pink',1),('banner:orange',1),('banner:navy',1),('banner:coral',1),('banner:mint',1),('banner:plum',1),('banner:bronze',100),('banner:silver',300),('banner:gold',750),('banner:aurora',350),('banner:sapphire',500),('banner:rose-gold',800),('banner:obsidian',600),('banner:opal',650),('banner:solar',900),('banner:cosmos',950),('banner:legend',1000),('design:plain',1),('design:sage',3),('design:ocean',5),('design:rose',7),('design:sand',10),('design:lavender',13),('design:tidal',16),('design:citrus',20),('design:fuchsia',25),('design:azure',30),('design:ember',35),('design:jade',40),('design:amethyst',45),('design:copper',50),('design:night',75),('design:forest',100),('design:sunburst',125),('design:lagoon',150),('design:ruby',175),('design:peacock',200),('design:electric',225),('design:orchid',250),('design:terracotta',275),('design:glacier',300),('design:saffron',325),('design:cherry',350),('design:neon',375),('design:emerald',400),('design:prism',425),('design:indigo',450),('design:coral',475),('design:sapphire',500),('design:rainforest',525),('design:magenta',550),('design:cobalt',575),('design:carnival',600),('design:garnet',625),('design:silver',650),('design:cosmic',675),('design:aurora',700),('design:phoenix',725),('design:royal',750),('design:platinum',775),('design:solar',800),('design:nebula',825),('design:opal',850),('design:dragon',875),('design:gold',900),('design:infinity',950),('design:legend',1000) on conflict(item_id) do update set minimum_level=excluded.minimum_level;
create or replace function public.glossix_cosmetics_get(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare b jsonb;d text;g jsonb;begin
 b:=public.glossix_banner_get(p_user_id);
 if not glossix_private.cosmetic_allowed(p_user_id,'banner:'||(b->>'banner_id')) then b:=jsonb_build_object('banner_id','classic');end if;
 select design_id into d from glossix_private.profile_designs where user_id=p_user_id;
 if d is null or not glossix_private.cosmetic_allowed(p_user_id,'design:'||d) then d:='plain';end if;
 if p_user_id=auth.uid() then select coalesce(jsonb_agg(item_id),'[]'::jsonb) into g from glossix_private.cosmetic_grants where user_id=p_user_id;else g:='[]'::jsonb;end if;
 return b||jsonb_build_object('design_id',d,'granted_items',g);end$$;
revoke all on function public.glossix_cosmetics_get(uuid) from public,anon,authenticated;
grant execute on function public.glossix_cosmetics_get(uuid) to authenticated;
commit;

-- Expanded banner designs and level unlocks. Run after profile rewards setup.
begin;
insert into glossix_private.cosmetic_catalog(item_id,minimum_level) values ('banner:classic',1),('banner:black',1),('banner:red',1),('banner:yellow',1),('banner:green',1),('banner:purple',1),('banner:brown',1),('banner:blue',1),('banner:pink',1),('banner:orange',1),('banner:navy',1),('banner:coral',1),('banner:mint',1),('banner:plum',1),('banner:ripple',2),('banner:sunrise',3),('banner:petals',4),('banner:meadow',5),('banner:ocean-waves',7),('banner:violet-arcs',9),('banner:citrus-rays',12),('banner:blueprint',15),('banner:coral-ribbons',18),('banner:mint-mosaic',22),('banner:orchid-lace',26),('banner:ember-peaks',30),('banner:forest-canopy',35),('banner:moon-garden',40),('banner:prism-trails',45),('banner:tidal-orbits',50),('banner:copper-weave',60),('banner:starlight',75),('banner:crimson-facets',90),('banner:bronze',100),('banner:emerald-vault',125),('banner:neon-circuit',150),('banner:glacier-crown',175),('banner:peacock-fan',200),('banner:amethyst-mandala',250),('banner:celestial-map',275),('banner:silver',300),('banner:aurora',350),('banner:sapphire',500),('banner:obsidian',600),('banner:opal',650),('banner:gold',750),('banner:rose-gold',800),('banner:solar',900),('banner:cosmos',950),('banner:legend',1000) on conflict(item_id) do update set minimum_level=excluded.minimum_level;
commit;
