-- Private preferences only. Preserves accounts, progress and points.
begin;
create table if not exists glossix_private.language_preferences(user_id uuid primary key references auth.users(id) on delete cascade,language text not null check(language in ('en','fr','es','de','pt','it','ru','uk','pl','nl','sv','no','da','fi','cs','sk','hu','ro','bg','el','tr','ar','he','fa','hi','bn','ur','pa','ta','te','zh','ja','ko','vi','th','id','ms','tl','sw','af','ca','eu','cy','ga')));
alter table glossix_private.language_preferences enable row level security;
revoke all on glossix_private.language_preferences from public,anon,authenticated;
create or replace function public.glossix_spoken_language_get() returns jsonb language plpgsql security definer set search_path='' as $$begin if auth.uid() is null then raise exception 'Please sign in';end if;return jsonb_build_object('language',(select language from glossix_private.language_preferences where user_id=auth.uid()));end$$;
create or replace function public.glossix_spoken_language_set(p_language text) returns jsonb language plpgsql security definer set search_path='' as $$begin if auth.uid() is null then raise exception 'Please sign in';end if;if p_language not in ('en','fr','es','de','pt','it','ru','uk','pl','nl','sv','no','da','fi','cs','sk','hu','ro','bg','el','tr','ar','he','fa','hi','bn','ur','pa','ta','te','zh','ja','ko','vi','th','id','ms','tl','sw','af','ca','eu','cy','ga') or p_language is null then raise exception 'Choose a listed language';end if;insert into glossix_private.language_preferences(user_id,language) values(auth.uid(),p_language) on conflict(user_id) do update set language=excluded.language;return jsonb_build_object('language',p_language);end$$;
revoke all on function public.glossix_spoken_language_get(),public.glossix_spoken_language_set(text) from public,anon,authenticated;
grant execute on function public.glossix_spoken_language_get(),public.glossix_spoken_language_set(text) to authenticated;
commit;
