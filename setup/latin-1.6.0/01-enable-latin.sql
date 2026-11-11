-- Latin enablement. Run after the existing course, profile and Word Drift setup.
-- Additive: existing accounts, progress, rewards and retired-language blocks are kept.
begin;
do $latin$
declare f record; definition text; guard text[]; required text;
begin
 foreach required in array array['public.glossix_language_set(text,boolean)','public.glossix_course_state(text)','public.glossix_course_answer(text,text,text,boolean)'] loop
  if to_regprocedure(required) is null then raise exception 'Existing Glossix course setup is required: %',required;end if;
 end loop;
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind='f' and p.proname in ('glossix_language_set','glossix_course_state','glossix_course_answer','glossix_learning_state','glossix_learning_answer')
  and pg_get_function_arguments(p.oid) like '%p_language text%' loop
  definition:=pg_get_functiondef(f.oid);
  guard:=regexp_match(definition,$rx$(p_language\s+not\s+in\s*\()([^)]*)(\))$rx$,'i');
  if guard is not null and position('''la''' in guard[2])=0 then
   definition:=regexp_replace(definition,$rx$(p_language\s+not\s+in\s*\()([^)]*)(\))$rx$,$replacement$\1\2,'la'\3$replacement$,'i');
  end if;
  if f.proname='glossix_course_answer' and position('glossix_latin_optional_macrons' in definition)=0 then
   definition:=regexp_replace(definition,$rx$\mbegin\M$rx$,$replacement$begin
 -- glossix_latin_optional_macrons: normalise Latin vowel-length marks only.
 if p_language='la' then p_answer:=translate(normalize(p_answer,NFC),'āēīōūȳĀĒĪŌŪȲ','aeiouyAEIOUY');end if;
 $replacement$,'i');
  end if;
  execute definition;
 end loop;
 -- Preserve public wrappers and their anti-cheat rules; add Latin to the existing activity language inference.
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind='f' and p.proname ~ '^glossix_award(_.*)?$' loop
  definition:=pg_get_functiondef(f.oid);
  if position('cards:la-%' in definition)=0 and definition ~* $rx$case\s+when\s+p_activity\s+like$rx$ then
   definition:=regexp_replace(definition,$rx$case\s+when\s+p_activity\s+like$rx$,$replacement$case when p_activity like 'cards:la-%' or p_activity like 'spelling:la-%' or p_activity like '%:la:%' then 'la' when p_activity like$replacement$,'i');
   execute definition;
  end if;
 end loop;
 if to_regprocedure('public.glossix_favourites_set(text[])') is not null then
  definition:=pg_get_functiondef('public.glossix_favourites_set(text[])'::regprocedure);
  guard:=regexp_match(definition,$rx$(x\s+not\s+in\s*\()([^)]*)(\))$rx$,'i');
  if guard is not null and position('''la''' in guard[2])=0 then
   execute regexp_replace(definition,$rx$(x\s+not\s+in\s*\()([^)]*)(\))$rx$,$replacement$\1\2,'la'\3$replacement$,'i');
  end if;
 end if;
end $latin$;
create or replace function glossix_private.learning_language_touch(u uuid,code text) returns void language sql set search_path='' as $$
 update glossix_private.profiles set active_languages=case when code=any(active_languages) then active_languages else array_append(active_languages,code) end,recent_language=code
 where user_id=u and code in ('ru','it','es','fr','de','pt-br','pt-pt','la');
$$;
notify pgrst,'reload schema';
commit;
