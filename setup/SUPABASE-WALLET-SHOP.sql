-- Run in the Supabase SQL Editor after the existing Glossix learning/social migrations.
-- Coins start accruing on new server-verified point awards after this migration.
begin;
create table if not exists glossix_private.wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 coins bigint not null default 0 check(coins>=0),
 gems bigint not null default 0 check(gems>=0),
 earned_coins bigint not null default 0 check(earned_coins>=0)
);
create table if not exists glossix_private.wallet_events (
 user_id uuid not null references auth.users(id) on delete cascade,
 activity text not null, earned_day date not null,
 coins bigint not null check(coins>0), created_at timestamptz not null default now(),
 primary key(user_id,activity,earned_day)
);
create table if not exists glossix_private.shop_catalog (
 item_id text primary key, name text not null, description text not null default '',
 currency text not null check(currency in ('coins','gems')),
 price bigint not null check(price>0), active boolean not null default false
);
alter table glossix_private.wallets enable row level security;
alter table glossix_private.wallet_events enable row level security;
alter table glossix_private.shop_catalog enable row level security;
revoke all on glossix_private.wallets,glossix_private.wallet_events,glossix_private.shop_catalog from public,anon,authenticated;
create or replace function glossix_private.credit_learning_coins() returns trigger
language plpgsql security definer set search_path='' as $$
declare reward bigint; credited integer;
begin
 reward := floor(new.points::numeric/10)::bigint;
 if reward<=0 then return new; end if;
 insert into glossix_private.wallet_events(user_id,activity,earned_day,coins)
 values(new.user_id,new.activity,new.earned_day,reward) on conflict do nothing;
 get diagnostics credited=row_count;
 if credited=1 then
  insert into glossix_private.wallets(user_id,coins,earned_coins) values(new.user_id,reward,reward)
  on conflict(user_id) do update set coins=glossix_private.wallets.coins+excluded.coins,
   earned_coins=glossix_private.wallets.earned_coins+excluded.earned_coins;
 end if;
 return new;
end $$;
revoke all on function glossix_private.credit_learning_coins() from public,anon,authenticated;
drop trigger if exists glossix_learning_coins on glossix_private.points;
create trigger glossix_learning_coins after insert on glossix_private.points for each row execute function glossix_private.credit_learning_coins();
create or replace function public.glossix_wallet_get() returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Sign in to view your wallet'; end if;
 insert into glossix_private.wallets(user_id) values(u) on conflict do nothing;
 select jsonb_build_object('coins',coins,'gems',gems,'earned_coins',earned_coins,
 'history',coalesce((select jsonb_agg(t) from (select coins,activity,created_at from glossix_private.wallet_events where user_id=u order by created_at desc limit 10)t),'[]'::jsonb))
 into result from glossix_private.wallets where user_id=u;
 return result;
end $$;
create or replace function public.glossix_shop_get() returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in to view the shop'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('item_id',item_id,'name',name,'description',description,'currency',currency,'price',price)) from glossix_private.shop_catalog where active),'[]'::jsonb);
end $$;
revoke all on function public.glossix_wallet_get(),public.glossix_shop_get() from public,anon;
grant execute on function public.glossix_wallet_get(),public.glossix_shop_get() to authenticated;
commit;
