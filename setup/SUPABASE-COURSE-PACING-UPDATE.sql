-- Glossix 0.2.12: self-paced lesson access; spaced memory reviews remain.
begin;
create or replace function public.glossix_course_state(p_language text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();d date:=(now() at time zone 'UTC')::date;score numeric;progress jsonb;daily jsonb;unlocked_lesson integer;done jsonb;last_lesson integer;
begin
 if p_language not in ('ru','it') or p_language is null then raise exception 'Unsupported language';end if;
 if u is null then raise exception 'Please sign in first';end if;
 if not exists(select 1 from glossix_private.profiles where user_id=u) then return jsonb_build_object('profileRequired',true,'points','0','unlocked',0,'items','{}'::jsonb,'daily','{}'::jsonb,'completedLessons','[]'::jsonb);end if;
 insert into glossix_private.learning_accounts(user_id,language) values(u,p_language) on conflict do nothing;
 select unlocked into unlocked_lesson from glossix_private.learning_accounts where user_id=u and language=p_language;
 select coalesce(sum(points),0) into score from glossix_private.points where user_id=u;
 select coalesce(max(lesson)+1,0) into last_lesson from glossix_private.learning_items where language=p_language;
 while unlocked_lesson<last_lesson and not exists(select 1 from glossix_private.learning_items x left join glossix_private.learning_progress r on r.user_id=u and r.item_id=x.id where x.language=p_language and x.lesson=unlocked_lesson and coalesce(r.successes,0)<1) loop unlocked_lesson:=unlocked_lesson+1;end loop;
 update glossix_private.learning_accounts set unlocked=unlocked_lesson where user_id=u and language=p_language;
 select coalesce(jsonb_object_agg(item_id,jsonb_build_object('successes',successes,'lastSuccess',case when last_success is null then null else floor(extract(epoch from last_success)*1000) end,'due',floor(extract(epoch from due)*1000),'interval',interval_days,'attempts',attempts,'mistakes',mistakes)),'{}'::jsonb) into progress from glossix_private.learning_progress where user_id=u;
 select jsonb_build_object('attempts',coalesce((select attempts from glossix_private.learning_daily where user_id=u and day=d),0),'correct',coalesce((select correct from glossix_private.learning_daily where user_id=u and day=d),0),'successIds',coalesce((select jsonb_agg(item_id) from glossix_private.learning_recalls where user_id=u and day=d),'[]'::jsonb),'spacedIds',coalesce((select jsonb_agg(item_id) from glossix_private.learning_recalls where user_id=u and day=d and spaced),'[]'::jsonb),'challenges',coalesce((select jsonb_agg(substr(activity,11)) from glossix_private.points where user_id=u and earned_day=d and activity like 'challenge:%'),'[]'::jsonb)) into daily;
 select coalesce(jsonb_agg(substr(activity,8)),'[]'::jsonb) into done from glossix_private.points where user_id=u and activity like 'lesson:%';
 return jsonb_build_object('curriculumLessons',(select coalesce(max(lesson)+1,0) from glossix_private.learning_items where language=p_language),'points',score::text,'level',public.glossix_level(score),'unlocked',unlocked_lesson,'items',progress,'daily',jsonb_build_object(d::text,daily),'completedLessons',done,'awards','{}'::jsonb);
end$$;
create or replace function public.glossix_course_answer(p_language text,p_item text,p_answer text,p_assisted boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();d date:=(now() at time zone 'UTC')::date;i glossix_private.learning_items%rowtype;p glossix_private.learning_progress%rowtype;correct_answer boolean;spaced_review boolean;earned integer:=0;unlocked_lesson integer;n integer;review_n integer;attempt_n integer;correct_n integer;lesson_id text;
begin
 if p_language not in ('ru','it') or p_language is null then raise exception 'Unsupported language';end if;
 if u is null then raise exception 'Please sign in first';end if;
 perform 1 from glossix_private.profiles where user_id=u for update;if not found then raise exception 'Choose your username first';end if;
 insert into glossix_private.learning_accounts(user_id,language) values(u,p_language) on conflict do nothing;
 select unlocked into unlocked_lesson from glossix_private.learning_accounts where user_id=u and language=p_language;
 select * into i from glossix_private.learning_items where id=p_item and language=p_language;if not found or i.lesson>unlocked_lesson then raise exception 'This lesson is locked';end if;
 if length(p_answer)>400 then raise exception 'Answer is too long';end if;
 correct_answer:=glossix_private.clean_answer(p_answer)=glossix_private.clean_answer(i.answer);
 if p_assisted then return jsonb_build_object('correct',correct_answer,'assisted',true,'earned',0,'state',public.glossix_course_state(p_language));end if;
 insert into glossix_private.learning_daily(user_id,day,attempts,correct) values(u,d,1,case when correct_answer then 1 else 0 end) on conflict(user_id,day) do update set attempts=glossix_private.learning_daily.attempts+1,correct=glossix_private.learning_daily.correct+case when correct_answer then 1 else 0 end;
 insert into glossix_private.learning_progress(user_id,item_id) values(u,p_item) on conflict do nothing;
 select * into p from glossix_private.learning_progress where user_id=u and item_id=p_item;
 if correct_answer then
  perform glossix_private.learning_language_touch(u,p_language);
  spaced_review:=p.last_success is not null and (p.last_success at time zone 'UTC')::date<>d and now()-p.last_success>=interval '20 hours';
  if p.last_success is null or spaced_review then p.successes:=p.successes+1;p.interval_days:=case when p.successes<2 then 1 else least(30,power(2,least(p.successes-1,5))::integer) end;p.last_success:=now();p.due:=now()+make_interval(days=>p.interval_days);end if;
  update glossix_private.learning_progress set successes=p.successes,last_success=p.last_success,due=p.due,interval_days=p.interval_days,attempts=attempts+1 where user_id=u and item_id=p_item;
  insert into glossix_private.learning_recalls(user_id,item_id,day,spaced) values(u,p_item,d,spaced_review) on conflict(user_id,item_id,day) do update set spaced=glossix_private.learning_recalls.spaced or excluded.spaced;
  earned:=earned+glossix_private.credit(u,'learning-recall:'||p_item,5);
  lesson_id:=p_language||'-l'||lpad((i.lesson+1)::text,greatest(2,length((i.lesson+1)::text)),'0');
  if not exists(select 1 from glossix_private.learning_items x left join glossix_private.learning_progress r on r.user_id=u and r.item_id=x.id where x.language=p_language and x.lesson=i.lesson and coalesce(r.successes,0)<1) then earned:=earned+glossix_private.credit(u,'lesson:'||lesson_id,50,true);end if;
  if i.lesson=unlocked_lesson and not exists(select 1 from glossix_private.learning_items x left join glossix_private.learning_progress r on r.user_id=u and r.item_id=x.id where x.language=p_language and x.lesson=i.lesson and coalesce(r.successes,0)<1) then update glossix_private.learning_accounts set unlocked=unlocked+1 where user_id=u and language=p_language;end if;
 else update glossix_private.learning_progress set successes=0,last_success=null,due=now()+interval '10 minutes',interval_days=0,attempts=attempts+1,mistakes=mistakes+1 where user_id=u and item_id=p_item;end if;
 select count(*),count(*) filter(where learning_recalls.spaced) into n,review_n from glossix_private.learning_recalls where user_id=u and day=d;
 select attempts,correct into attempt_n,correct_n from glossix_private.learning_daily where user_id=u and day=d;
 if n>=5 then earned:=earned+glossix_private.credit(u,'daily-practice',20);end if;
 if n>=10 then earned:=earned+glossix_private.credit(u,'challenge:vocabulary',25);end if;
 if n>=5 and correct_n::bigint*100>=attempt_n::bigint*80 then earned:=earned+glossix_private.credit(u,'challenge:accuracy',25);end if;
 if review_n>=5 then earned:=earned+glossix_private.credit(u,'challenge:memory',25);end if;
 return jsonb_build_object('correct',correct_answer,'assisted',false,'earned',earned,'state',public.glossix_course_state(p_language));
end$$;
commit;
