-- Glossix profile extras, private notes with revision history and avatar border rewards.
begin;
create table if not exists glossix_private.profile_extras(user_id uuid primary key references auth.users(id) on delete cascade,favourite_languages text[] not null default '{}',border_id text not null default 'none');
create table if not exists glossix_private.notebooks(user_id uuid primary key references auth.users(id) on delete cascade,body text not null default '',revision bigint not null default 0,updated_at timestamptz not null default now());
create table if not exists glossix_private.note_revisions(user_id uuid not null references auth.users(id) on delete cascade,revision bigint not null,body text not null,saved_at timestamptz not null default now(),primary key(user_id,revision));
alter table glossix_private.profile_extras enable row level security;
alter table glossix_private.notebooks enable row level security;
alter table glossix_private.note_revisions enable row level security;
revoke all on glossix_private.profile_extras,glossix_private.notebooks,glossix_private.note_revisions from public,anon,authenticated;
insert into glossix_private.cosmetic_catalog(item_id,minimum_level) values ('avatar-border:none',1),('avatar-border:teal',1),('avatar-border:blue',1),('avatar-border:red',1),('avatar-border:green',1),('avatar-border:purple',1),('avatar-border:pink',1),('avatar-border:orange',1),('avatar-border:black',1),('avatar-border:pearl',5),('avatar-border:twine',10),('avatar-border:leaf',20),('avatar-border:ice',35),('avatar-border:orbit',50),('avatar-border:bronze',75),('avatar-border:silver',150),('avatar-border:amethyst',250),('avatar-border:aurora',350),('avatar-border:sapphire',500),('avatar-border:gold',650),('avatar-border:cosmic',800),('avatar-border:supreme',1000) on conflict(item_id) do update set minimum_level=excluded.minimum_level;
create or replace function public.glossix_profile_extras_get(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$declare r glossix_private.profile_extras%rowtype;n bigint;begin
 perform public.glossix_profile_view(p_user_id);
 select * into r from glossix_private.profile_extras where user_id=p_user_id;
 select count(*) into n from glossix_private.friendships where status='accepted' and (low_id=p_user_id or high_id=p_user_id);
 return jsonb_build_object('friend_count',n,'favourite_languages',coalesce(r.favourite_languages,'{}'::text[]),'border_id',case when glossix_private.cosmetic_allowed(p_user_id,'avatar-border:'||coalesce(r.border_id,'none')) then coalesce(r.border_id,'none') else 'none' end);end$$;
create or replace function public.glossix_favourites_set(p_languages text[]) returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Please sign in first';end if;perform public.glossix_profile_view(u);
 if p_languages is null or cardinality(p_languages)>8 or exists(select 1 from unnest(p_languages) x where x is null or x not in ('en','fr','es','de','pt','it','ru','uk','pl','nl','sv','no','da','fi','cs','sk','hu','ro','bg','el','tr','ar','he','fa','hi','bn','ur','pa','ta','te','zh','ja','ko','vi','th','id','ms','tl','sw','af','ca','eu','cy','ga')) or (select count(distinct x) from unnest(p_languages) x)<>cardinality(p_languages) then raise exception 'Choose up to eight different listed languages';end if;
 insert into glossix_private.profile_extras(user_id,favourite_languages) values(u,p_languages) on conflict(user_id) do update set favourite_languages=excluded.favourite_languages;return public.glossix_profile_extras_get(u);end$$;
create or replace function public.glossix_avatar_border_set(p_border text) returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Please sign in first';end if;perform public.glossix_profile_view(u);
 if p_border is null or not glossix_private.cosmetic_allowed(u,'avatar-border:'||p_border) then raise exception 'This avatar border is locked or unavailable';end if;
 insert into glossix_private.profile_extras(user_id,border_id) values(u,p_border) on conflict(user_id) do update set border_id=excluded.border_id;return public.glossix_profile_extras_get(u);end$$;
create or replace function public.glossix_notes_get() returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();r glossix_private.notebooks%rowtype;begin if u is null then raise exception 'Please sign in first';end if;select * into r from glossix_private.notebooks where user_id=u;return jsonb_build_object('body',coalesce(r.body,''),'revision',coalesce(r.revision,0),'updated_at',r.updated_at);end$$;
create or replace function public.glossix_notes_save(p_body text,p_revision bigint) returns jsonb language plpgsql security definer set search_path='' as $$declare u uuid:=auth.uid();r glossix_private.notebooks%rowtype;begin
 if u is null then raise exception 'Please sign in first';end if;if p_body is null or length(p_body)>200000 or p_revision is null then raise exception 'Notes must be text of at most 200000 characters';end if;
 insert into glossix_private.notebooks(user_id) values(u) on conflict do nothing;
 select * into r from glossix_private.notebooks where user_id=u for update;
 if r.revision<>p_revision then raise exception 'Notes changed on another device. Your draft is kept; reload the saved notes before saving again';end if;
 if r.body=p_body then return public.glossix_notes_get();end if;
 insert into glossix_private.note_revisions(user_id,revision,body) values(u,r.revision,r.body) on conflict do nothing;
 update glossix_private.notebooks set body=p_body,revision=r.revision+1,updated_at=now() where user_id=u;return public.glossix_notes_get();end$$;
create or replace function public.glossix_notes_history() returns jsonb language plpgsql security definer set search_path='' as $$begin if auth.uid() is null then raise exception 'Please sign in first';end if;return (select coalesce(jsonb_agg(jsonb_build_object('revision',revision,'saved_at',saved_at) order by revision desc),'[]'::jsonb) from glossix_private.note_revisions where user_id=auth.uid());end$$;
create or replace function public.glossix_notes_revision(p_revision bigint) returns jsonb language plpgsql security definer set search_path='' as $$declare r glossix_private.note_revisions%rowtype;begin if auth.uid() is null then raise exception 'Please sign in first';end if;select * into r from glossix_private.note_revisions where user_id=auth.uid() and revision=p_revision;if not found then raise exception 'Saved revision not found';end if;return jsonb_build_object('body',r.body,'revision',r.revision);end$$;
revoke all on function public.glossix_profile_extras_get(uuid),public.glossix_favourites_set(text[]),public.glossix_avatar_border_set(text),public.glossix_notes_get(),public.glossix_notes_save(text,bigint),public.glossix_notes_history(),public.glossix_notes_revision(bigint) from public,anon,authenticated;
grant execute on function public.glossix_profile_extras_get(uuid),public.glossix_favourites_set(text[]),public.glossix_avatar_border_set(text),public.glossix_notes_get(),public.glossix_notes_save(text,bigint),public.glossix_notes_history(),public.glossix_notes_revision(bigint) to authenticated;
commit;
