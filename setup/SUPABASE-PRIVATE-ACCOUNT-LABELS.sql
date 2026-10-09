-- Run once in the Supabase SQL Editor as the project administrator.
-- Internal labels only. No app permissions or public badges are granted.
begin;
create schema if not exists glossix_private;
create table if not exists glossix_private.account_labels (
  user_id uuid primary key references auth.users(id) on delete cascade,
  label text not null default 'learner' check (label in ('learner','owner')),
  updated_at timestamptz not null default now()
);
alter table glossix_private.account_labels enable row level security;
revoke all on glossix_private.account_labels from public, anon, authenticated;
commit;

-- Assign your account by its existing Glossix username.
-- Change n4tive if your username is different. No other account is changed.
insert into glossix_private.account_labels(user_id,label)
select user_id,'owner' from glossix_private.profiles where lower(username)='n4tive'
on conflict(user_id) do update set label=excluded.label,updated_at=now();

-- Private administrator view, accessible through this SQL Editor only.
select p.user_id,p.username,coalesce(a.label,'learner') as internal_label
from glossix_private.profiles p
left join glossix_private.account_labels a on a.user_id=p.user_id
order by p.username;
