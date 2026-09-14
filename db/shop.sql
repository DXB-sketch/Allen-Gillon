-- Apply once per database with npm run shop:setup. Server access only.
create schema if not exists art_shop;
revoke all on schema art_shop from public;
create table if not exists art_shop.orders (
  id uuid primary key,
  environment text not null check (environment in ('sandbox','live')),
  product_id text not null,
  session_hash text not null,
  paypal_order_id text unique,
  amount_cents integer not null check (amount_cents between 10000 and 25000),
  status text not null default 'CREATED' check (status in ('CREATED','CAPTURING','COMPLETED','PENDING','DECLINED','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
  capture_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_session_created on art_shop.orders(session_hash,created_at);
create table if not exists art_shop.stock (
  product_id text not null,
  environment text not null check (environment in ('sandbox','live')),
  claimed_order uuid references art_shop.orders(id),
  sold boolean not null default false,
  primary key (product_id,environment)
);
revoke all on all tables in schema art_shop from public;
