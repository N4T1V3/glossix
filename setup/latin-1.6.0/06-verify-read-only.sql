-- Expected: 1968 targets, 328 lessons, 1989 Word Drift mappings.
select count(*) as latin_targets,count(distinct lesson) as latin_lessons from glossix_private.learning_items where language='la';
select count(*) as latin_matching_mappings from glossix_private.matching_catalog where language='la';
select p.proname,pg_get_functiondef(p.oid) like '%''la''%' as mentions_latin from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('glossix_language_set','glossix_course_state','glossix_course_answer','glossix_favourites_set');
