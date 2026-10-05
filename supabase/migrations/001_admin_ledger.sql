-- =====================================================================
-- Quantix: admin panel, balances, immutable ledger, audit log
-- Run once in the Supabase SQL editor (Production).
-- Existing table used as-is: public.users (id uuid PK, email, country, currency, ...)
-- All timestamps are timestamptz (stored in UTC).
-- Every new table has RLS ON with NO policies: anon/authenticated keys can
-- never read or write them. Only the server (service_role) can.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- helper: block UPDATE / DELETE / TRUNCATE on append-only tables
create or replace function public.reject_mutation()
returns trigger language plpgsql as $$
begin
  raise exception '% is not allowed on % (append-only table)', tg_op, tg_table_name
    using errcode = 'P0001';
end $$;

-- ---------- admin accounts & sessions
create table if not exists public.admin_users (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  email_norm      text not null unique,
  password_salt   text not null,
  password_hash   text not null,
  role            text not null default 'admin'
                  check (role in ('super_admin','admin','support')),   -- support = read-only
  is_active       boolean not null default true,
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  last_login_at   timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references public.admin_users(id) on delete cascade,
  token_hash  text not null unique,           -- sha256 of the cookie token; raw token is never stored
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  ip          text,
  user_agent  text
);
create index if not exists admin_sessions_admin_idx on public.admin_sessions(admin_id);

-- ---------- balances (one row per user, USD only, never negative)
create table if not exists public.account_balances (
  user_id     uuid primary key references public.users(id) on delete restrict,
  currency    text not null default 'USD' check (currency = 'USD'),
  balance     numeric(18,2) not null default 0 check (balance >= 0),
  status      text not null default 'active' check (status in ('active','frozen')),
  updated_at  timestamptz not null default now()
);

-- every new signup automatically gets a $0.00 balance row (signup code is untouched)
create or replace function public.create_balance_for_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.account_balances (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists trg_users_create_balance on public.users;
create trigger trg_users_create_balance
  after insert on public.users
  for each row execute function public.create_balance_for_new_user();

-- backfill existing users
insert into public.account_balances (user_id)
select id from public.users
on conflict do nothing;

-- ---------- immutable balance ledger
create table if not exists public.balance_ledger (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete restrict,
  entry_type       text not null check (entry_type in ('deposit','withdrawal','admin_credit','admin_debit')),
  direction        text not null check (direction in ('credit','debit')),
  amount           numeric(18,2) not null check (amount > 0),
  currency         text not null default 'USD' check (currency = 'USD'),
  previous_balance numeric(18,2) not null check (previous_balance >= 0),
  new_balance      numeric(18,2) not null check (new_balance >= 0),
  reason           text not null check (char_length(btrim(reason)) between 3 and 200),
  note             text check (note is null or char_length(note) <= 500),
  admin_id         uuid references public.admin_users(id) on delete restrict,
  admin_email      text,                       -- snapshot at the time of the action
  idempotency_key  text unique,
  created_at       timestamptz not null default now(),
  constraint ledger_math check (
    (direction = 'credit' and new_balance = previous_balance + amount) or
    (direction = 'debit'  and new_balance = previous_balance - amount)
  ),
  constraint ledger_type_direction check (
    (entry_type in ('deposit','admin_credit') and direction = 'credit') or
    (entry_type in ('withdrawal','admin_debit') and direction = 'debit')
  ),
  constraint ledger_manual_needs_admin check (
    entry_type not in ('admin_credit','admin_debit') or (admin_id is not null and admin_email is not null)
  )
);
create index if not exists balance_ledger_user_idx    on public.balance_ledger(user_id, created_at desc);
create index if not exists balance_ledger_type_idx    on public.balance_ledger(entry_type, created_at desc);

drop trigger if exists trg_ledger_no_update on public.balance_ledger;
create trigger trg_ledger_no_update before update or delete on public.balance_ledger
  for each row execute function public.reject_mutation();
drop trigger if exists trg_ledger_no_truncate on public.balance_ledger;
create trigger trg_ledger_no_truncate before truncate on public.balance_ledger
  for each statement execute function public.reject_mutation();

-- ---------- immutable audit log
create table if not exists public.admin_audit_logs (
  id              uuid primary key default gen_random_uuid(),
  admin_id        uuid references public.admin_users(id) on delete restrict,   -- null for failed logins
  admin_email     text,
  action          text not null,           -- e.g. admin.login, admin.login_failed, user.view, balance.credit
  target_user_id  uuid references public.users(id) on delete restrict,
  details         jsonb not null default '{}'::jsonb,
  ip              text,
  created_at      timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_target_idx  on public.admin_audit_logs(target_user_id);

drop trigger if exists trg_audit_no_update on public.admin_audit_logs;
create trigger trg_audit_no_update before update or delete on public.admin_audit_logs
  for each row execute function public.reject_mutation();
drop trigger if exists trg_audit_no_truncate on public.admin_audit_logs;
create trigger trg_audit_no_truncate before truncate on public.admin_audit_logs
  for each statement execute function public.reject_mutation();

-- ---------- the ONLY way a manual adjustment happens (one atomic transaction)
create or replace function public.admin_adjust_balance(
  p_admin_id        uuid,
  p_user_id         uuid,
  p_direction       text,
  p_amount          numeric,
  p_currency        text,
  p_reason          text,
  p_note            text,
  p_idempotency_key text,
  p_ip              text default null
)
returns table (
  out_ledger_id  uuid,
  out_previous   numeric,
  out_new        numeric,
  out_created_at timestamptz,
  out_replayed   boolean
)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_admin    public.admin_users%rowtype;
  v_prev     numeric(18,2);
  v_new      numeric(18,2);
  v_amount   numeric(18,2);
  v_existing public.balance_ledger%rowtype;
  v_id       uuid;
  v_ts       timestamptz;
  v_type     text;
begin
  select * into v_admin from public.admin_users where id = p_admin_id and is_active;
  if not found or v_admin.role not in ('super_admin','admin') then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_direction not in ('credit','debit') then
    raise exception 'invalid direction' using errcode = '22023';
  end if;
  if p_currency is distinct from 'USD' then
    raise exception 'only USD adjustments are supported' using errcode = '22023';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000 or p_amount <> round(p_amount, 2) then
    raise exception 'invalid amount' using errcode = '22023';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) < 3 or char_length(btrim(p_reason)) > 200 then
    raise exception 'reason must be 3-200 characters' using errcode = '22023';
  end if;
  if p_note is not null and char_length(p_note) > 500 then
    raise exception 'note too long' using errcode = '22023';
  end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) < 8 then
    raise exception 'missing idempotency key' using errcode = '22023';
  end if;

  -- lock the balance row first: serialises concurrent adjustments for this user
  select balance into v_prev from public.account_balances where user_id = p_user_id for update;
  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  -- replay of an already-applied request (double click / retry): return the original result
  select * into v_existing from public.balance_ledger where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.user_id <> p_user_id or v_existing.admin_id is distinct from p_admin_id then
      raise exception 'idempotency key already used' using errcode = '23505';
    end if;
    return query select v_existing.id, v_existing.previous_balance, v_existing.new_balance, v_existing.created_at, true;
    return;
  end if;

  v_amount := round(p_amount, 2);
  v_new := case when p_direction = 'credit' then v_prev + v_amount else v_prev - v_amount end;
  if v_new < 0 then
    raise exception 'insufficient balance' using errcode = '23514';
  end if;
  v_type := case when p_direction = 'credit' then 'admin_credit' else 'admin_debit' end;

  update public.account_balances set balance = v_new, updated_at = now() where user_id = p_user_id;

  insert into public.balance_ledger
    (user_id, entry_type, direction, amount, currency, previous_balance, new_balance,
     reason, note, admin_id, admin_email, idempotency_key)
  values
    (p_user_id, v_type, p_direction, v_amount, 'USD', v_prev, v_new,
     btrim(p_reason), nullif(btrim(coalesce(p_note, '')), ''), v_admin.id, v_admin.email, p_idempotency_key)
  returning id, created_at into v_id, v_ts;

  insert into public.admin_audit_logs (admin_id, admin_email, action, target_user_id, details, ip)
  values (v_admin.id, v_admin.email, 'balance.' || p_direction, p_user_id,
          jsonb_build_object('ledger_id', v_id, 'amount', v_amount, 'currency', 'USD',
                             'previous_balance', v_prev, 'new_balance', v_new, 'reason', btrim(p_reason)),
          p_ip);

  return query select v_id, v_prev, v_new, v_ts, false;
end $$;

-- ---------- read helpers used by the admin pages (service_role only)
create or replace function public.admin_list_users(
  p_search text default null, p_limit integer default 25, p_offset integer default 0
)
returns table (
  id uuid, email text, country text, currency text, created_at timestamptz, status text,
  balance numeric, total_deposited numeric, total_withdrawn numeric, manual_net numeric, total_count bigint
)
language sql stable set search_path = public, pg_temp as $$
  select u.id, u.email, u.country, u.currency, u.created_at,
         coalesce(b.status, 'active'),
         coalesce(b.balance, 0),
         coalesce(l.dep, 0), coalesce(l.wd, 0), coalesce(l.manual, 0),
         count(*) over()
  from public.users u
  left join public.account_balances b on b.user_id = u.id
  left join lateral (
    select
      sum(amount) filter (where entry_type = 'deposit')    as dep,
      sum(amount) filter (where entry_type = 'withdrawal') as wd,
      sum(case when entry_type = 'admin_credit' then amount
               when entry_type = 'admin_debit'  then -amount end) as manual
    from public.balance_ledger x where x.user_id = u.id
  ) l on true
  where p_search is null
     or u.email ilike '%' || p_search || '%'
     or u.id::text = p_search
  order by u.created_at desc
  limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0)
$$;

create or replace function public.admin_overview()
returns jsonb language sql stable set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'users_total',     (select count(*) from public.users),
    'users_today',     (select count(*) from public.users
                        where created_at >= (date_trunc('day', now() at time zone 'utc') at time zone 'utc')),
    'users_week',      (select count(*) from public.users where created_at >= now() - interval '7 days'),
    'total_balance',   (select coalesce(sum(balance), 0) from public.account_balances),
    'credits_30d',     (select coalesce(sum(amount), 0) from public.balance_ledger
                        where entry_type = 'admin_credit' and created_at >= now() - interval '30 days'),
    'debits_30d',      (select coalesce(sum(amount), 0) from public.balance_ledger
                        where entry_type = 'admin_debit' and created_at >= now() - interval '30 days'),
    'adjustments_30d', (select count(*) from public.balance_ledger
                        where entry_type in ('admin_credit','admin_debit') and created_at >= now() - interval '30 days')
  )
$$;

-- ---------- lock everything down
alter table public.admin_users       enable row level security;
alter table public.admin_sessions    enable row level security;
alter table public.account_balances  enable row level security;
alter table public.balance_ledger    enable row level security;
alter table public.admin_audit_logs  enable row level security;
-- (intentionally NO policies: only service_role, which bypasses RLS, can access these tables)

revoke all on public.admin_users, public.admin_sessions, public.account_balances,
              public.balance_ledger, public.admin_audit_logs from anon, authenticated;

revoke all on function public.admin_adjust_balance(uuid,uuid,text,numeric,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.admin_list_users(text,integer,integer)  from public, anon, authenticated;
revoke all on function public.admin_overview()                        from public, anon, authenticated;
revoke all on function public.create_balance_for_new_user()           from public, anon, authenticated;
grant execute on function public.admin_adjust_balance(uuid,uuid,text,numeric,text,text,text,text,text) to service_role;
grant execute on function public.admin_list_users(text,integer,integer) to service_role;
grant execute on function public.admin_overview()                       to service_role;

-- ---------- sanity checks (run after the migration)
-- select count(*) from public.users;  select count(*) from public.account_balances;   -- should match
-- update public.balance_ledger set amount = 1;   -- must FAIL: append-only table
