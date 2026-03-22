-- Migration: Move school1-4 columns into user_schools junction table
-- Run this in the Supabase SQL Editor.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).

-- Step 1: Drop table if a previous attempt left a broken version
drop table if exists user_schools;

-- Step 2: Create the junction table
create table user_schools (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  school_name  text not null,
  school_id    text default '',
  sort_order   integer not null default 0,
  created_at   timestamptz default now(),
  unique(user_id, school_name)
);

create index if not exists idx_user_schools_user_id on user_schools(user_id);
alter table user_schools enable row level security;

-- Step 3: Migrate existing data from profile columns into junction table
insert into user_schools (user_id, school_name, school_id, sort_order)
select id, school1_name, coalesce(school1_id, ''), 0
from profiles
where school1_name is not null and school1_name <> ''
on conflict (user_id, school_name) do nothing;

insert into user_schools (user_id, school_name, school_id, sort_order)
select id, school2_name, coalesce(school2_id, ''), 1
from profiles
where school2_name is not null and school2_name <> ''
on conflict (user_id, school_name) do nothing;

insert into user_schools (user_id, school_name, school_id, sort_order)
select id, school3_name, coalesce(school3_id, ''), 2
from profiles
where school3_name is not null and school3_name <> ''
on conflict (user_id, school_name) do nothing;

insert into user_schools (user_id, school_name, school_id, sort_order)
select id, school4_name, coalesce(school4_id, ''), 3
from profiles
where school4_name is not null and school4_name <> ''
on conflict (user_id, school_name) do nothing;

-- Step 4: Drop the old columns (uncomment when ready)
-- alter table profiles drop column if exists school1_name;
-- alter table profiles drop column if exists school1_id;
-- alter table profiles drop column if exists school2_name;
-- alter table profiles drop column if exists school2_id;
-- alter table profiles drop column if exists school3_name;
-- alter table profiles drop column if exists school3_id;
-- alter table profiles drop column if exists school4_name;
-- alter table profiles drop column if exists school4_id;
