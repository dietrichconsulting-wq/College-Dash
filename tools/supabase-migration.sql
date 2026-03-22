-- Supabase Migration: College Dashboard
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─── Profiles ────────────────────────────────────────────
create table if not exists profiles (
  id                  uuid primary key default gen_random_uuid(),
  display_name        text default '',
  gpa                 numeric(4,2),
  sat                 integer,
  act_score           integer,
  proposed_major      text default '',
  home_state          text default '',
  grad_year           integer,
  onboarding_complete boolean default false,
  desired_climate     text default '',
  school_size_pref    text default '',
  school_type_pref    text default '',
  distance_pref       text default '',
  extracurriculars    text default '',
  career_interests    text default '',
  strategy_result     jsonb,
  strategy_generated_at timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─── User Schools (junction table, supports up to 12) ───
create table if not exists user_schools (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  school_name  text not null,
  school_id    text default '',
  sort_order   integer not null default 0,
  created_at   timestamptz default now(),
  unique(user_id, school_name)
);

create index if not exists idx_user_schools_user_id on user_schools(user_id);

-- ─── Tasks ───────────────────────────────────────────────
create table if not exists tasks (
  id               uuid primary key default gen_random_uuid(),
  task_id          text unique not null,
  user_id          text not null references profiles(user_id) on delete cascade,
  title            text not null,
  description      text default '',
  status           text default 'To Do' check (status in ('To Do','In Progress','Done')),
  category         text default 'Other' check (category in ('Testing','Application','Financial','Visit','Portfolio','Recommendation','Other')),
  due_date         date,
  calendar_event_id text default '',
  sort_order       integer default 0,
  completed_at     timestamptz,
  created_at       timestamptz default now()
);

create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_user_status on tasks(user_id, status);
create index if not exists idx_tasks_task_id on tasks(task_id);

-- ─── Progress ────────────────────────────────────────────
create table if not exists progress (
  id             uuid primary key default gen_random_uuid(),
  entry_id       text unique not null,
  user_id        text not null references profiles(user_id) on delete cascade,
  milestone_key  text not null check (milestone_key in (
    'profile_complete','sat_prep_started','sat_taken',
    'applications_started','recommendations_requested','essays_drafted',
    'applications_submitted','scholarships_applied','decisions_received','committed'
  )),
  reached_at     timestamptz default now(),
  notes          text default '',
  created_at     timestamptz default now()
);

create index if not exists idx_progress_user_id on progress(user_id);

-- ─── Scholarships ─────────────────────────────────────────
create table if not exists scholarships (
  id               uuid primary key default gen_random_uuid(),
  scholarship_id   text unique not null,
  user_id          text not null references profiles(user_id) on delete cascade,
  name             text default '',
  amount           numeric(10,2),
  deadline         date,
  essay_required   boolean default false,
  difficulty       text default 'Medium' check (difficulty in ('Easy','Medium','Hard')),
  stage            text default 'Researching' check (stage in ('Researching','Applying','Submitted','Won')),
  url              text default '',
  notes            text default '',
  created_at       timestamptz default now()
);

create index if not exists idx_scholarships_user_id on scholarships(user_id);
create index if not exists idx_scholarships_user_stage on scholarships(user_id, stage);
create index if not exists idx_scholarships_scholarship_id on scholarships(scholarship_id);

-- ─── Row Level Security ──────────────────────────────────
-- Enable RLS on all tables (policies added per your auth strategy)
alter table profiles enable row level security;
alter table user_schools enable row level security;
alter table tasks enable row level security;
alter table progress enable row level security;
alter table scholarships enable row level security;

-- Service-role key bypasses RLS, so the Express backend works without policies.
-- When you add end-user auth (Supabase Auth), add policies like:
--   create policy "Users can read own profile"
--     on profiles for select using (auth.uid()::text = user_id);
