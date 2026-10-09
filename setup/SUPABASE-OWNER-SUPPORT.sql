-- Apply after SUPABASE-OWNER-CROWN.sql. Support chats are only with that owner.
begin;
create table if not exists glossix_private.support_threads (
 user_id uuid primary key references glossix_private.profiles(user_id) on delete cascade,
 closed boolean not null default false,blocked boolean not null default false,
 user_read bigint not null default 0,owner_read bigint not null default 0,
 updated_at timestamptz not null default now()
);
create table if not exists glossix_private.support_messages (
 id bigint generated always as identity primary key,
 thread_user uuid not null references glossix_private.support_threads(user_id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 2000),
 sent_at timestamptz not null default now()
);
create index if not exists support_message_thread_idx on glossix_private.support_messages(thread_user,id desc);
create index if not exists support_message_author_idx on glossix_private.support_messages(author_id,sent_at);
alter table glossix_private.support_threads enable row level security;
alter table glossix_private.support_messages enable row level security;
revoke all on glossix_private.support_threads,glossix_private.support_messages from public,anon,authenticated;
revoke all on sequence glossix_private.support_messages_id_seq from public,anon,authenticated;

create or replace function public.glossix_support_state(p_thread_user uuid default null,p_before bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();o uuid;t uuid;is_owner boolean;threads jsonb;messages jsonb;meta jsonb;last_id bigint;
begin
 if u is null then raise exception 'Please sign in';end if;
 select user_id into o from glossix_private.owner_badge;
 if o is null then raise exception 'Support is not available yet';end if;
 is_owner:=u=o;
 if not is_owner and p_thread_user is not null and p_thread_user<>u then raise exception 'This conversation is private';end if;
 t:=case when is_owner then p_thread_user else u end;
 select coalesce(jsonb_agg(q.payload order by q.updated_at desc),'[]'::jsonb) into threads from (
  select s.updated_at,jsonb_build_object('user_id',s.user_id,'username',p.username,'closed',s.closed,'blocked',s.blocked,'updated_at',s.updated_at,
   'unread',(select count(*) from glossix_private.support_messages m where m.thread_user=s.user_id and m.author_id<>u and m.id>case when is_owner then s.owner_read else s.user_read end)) payload
  from glossix_private.support_threads s join glossix_private.profiles p on p.user_id=s.user_id
  where is_owner or s.user_id=u order by s.updated_at desc limit 100
 ) q;
 if t is not null then
  select jsonb_build_object('user_id',s.user_id,'username',p.username,'closed',s.closed,'blocked',s.blocked) into meta
  from glossix_private.support_threads s join glossix_private.profiles p on p.user_id=s.user_id where s.user_id=t;
  select coalesce(jsonb_agg(q.payload order by q.id),'[]'::jsonb) into messages from (
   select m.id,jsonb_build_object('id',m.id,'body',m.body,'sent_at',m.sent_at,'from_owner',m.author_id=o) payload
   from glossix_private.support_messages m where m.thread_user=t and (p_before is null or m.id<p_before) order by m.id desc limit 100
  ) q;
  if p_before is null then
   select coalesce(max(id),0) into last_id from glossix_private.support_messages where thread_user=t;
   if is_owner then update glossix_private.support_threads set owner_read=greatest(owner_read,last_id) where user_id=t;
   else update glossix_private.support_threads set user_read=greatest(user_read,last_id) where user_id=t;end if;
  end if;
 end if;
 return jsonb_build_object('is_owner',is_owner,'owner_username',(select username from glossix_private.profiles where user_id=o),'threads',threads,'thread',meta,'messages',coalesce(messages,'[]'::jsonb));
end;$$;

create or replace function public.glossix_support_send(p_body text,p_thread_user uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();o uuid;t uuid;r glossix_private.support_threads%rowtype;b text:=btrim(p_body);
begin
 if u is null then raise exception 'Please sign in';end if;
 select user_id into o from glossix_private.owner_badge;
 if o is null then raise exception 'Support is not available yet';end if;
 if b is null or char_length(b) not between 1 and 2000 then raise exception 'Write a message of 1 to 2000 characters';end if;
 if u=o then
  t:=p_thread_user;
  if t is null or t=o then raise exception 'Choose a support conversation';end if;
  if not exists(select 1 from glossix_private.support_threads where user_id=t) then raise exception 'This conversation does not exist';end if;
 else
  if p_thread_user is not null and p_thread_user<>u then raise exception 'You can only message the Glossix owner';end if;
  if not exists(select 1 from glossix_private.profiles where user_id=u) then raise exception 'Create your username on your profile first';end if;
  t:=u;
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('glossix-support:'||u::text,0));
 if u<>o and ((select count(*) from glossix_private.support_messages where author_id=u and sent_at>now()-interval '1 minute')>=5 or
 (select count(*) from glossix_private.support_messages where author_id=u and sent_at>now()-interval '1 day')>=60) then raise exception 'Please wait before sending more messages';end if;
 insert into glossix_private.support_threads(user_id) values(t) on conflict do nothing;
 select * into r from glossix_private.support_threads where user_id=t for update;
 if r.blocked then raise exception 'This support conversation is blocked';end if;
 if r.closed then raise exception 'This conversation is closed';end if;
 insert into glossix_private.support_messages(thread_user,author_id,body) values(t,u,b);
 update glossix_private.support_threads set updated_at=now() where user_id=t;
 return public.glossix_support_state(t);
end;$$;

create or replace function public.glossix_support_manage(p_thread_user uuid,p_action text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o uuid;
begin
 select user_id into o from glossix_private.owner_badge;
 if auth.uid() is null or auth.uid()<>o or o is null then raise exception 'Only the Glossix owner can manage support';end if;
 if p_action not in ('close','reopen','block','unblock') or p_action is null then raise exception 'Unknown action';end if;
 update glossix_private.support_threads set
 closed=case when p_action in ('close','block') then true else false end,
 blocked=case when p_action='block' then true when p_action='unblock' then false else blocked end,
 updated_at=now() where user_id=p_thread_user;
 if not found then raise exception 'Conversation not found';end if;
 return public.glossix_support_state(p_thread_user);
end;$$;
revoke all on function public.glossix_support_state(uuid,bigint),public.glossix_support_send(text,uuid),public.glossix_support_manage(uuid,text) from public,anon;
grant execute on function public.glossix_support_state(uuid,bigint),public.glossix_support_send(text,uuid),public.glossix_support_manage(uuid,text) to authenticated;
commit;
