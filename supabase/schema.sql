-- Run in Supabase SQL Editor. Server-only service-role key bypasses RLS; never expose it in browser.
create extension if not exists btree_gist;
create table if not exists public.appointments (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null check(length(customer_name) between 2 and 80),
 phone text not null check(phone ~ '^\+[1-9][0-9]{7,14}$'),
 service_id text not null,
 service_name text not null,
 stylist_id text not null,
 stylist_name text not null,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'confirmed' check(status in ('confirmed','cancelled')),
 sms_consent boolean not null default false,
 reminder_sent_at timestamptz,
 created_at timestamptz not null default now(),
 constraint positive_duration check(ends_at > starts_at),
 constraint no_stylist_overlap exclude using gist (
   stylist_id with =, tstzrange(starts_at,ends_at,'[)') with &&
 ) where (status='confirmed')
);
create index if not exists appointments_time_idx on public.appointments (starts_at,stylist_id);
alter table public.appointments enable row level security;
-- No public SELECT, INSERT, UPDATE, DELETE policies: anon/authenticated clients cannot read personal data.
-- Staff access is through a private, restricted Google Sheet; admin changes in Supabase initially.
