-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  gpa           numeric(3,2),
  sat           integer,
  proposed_major text,
  school1_name  text,
  school1_id    text,
  school2_name  text,
  school2_id    text,
  school3_name  text,
  school3_id    text,
  school4_name  text,
  school4_id    text,
  home_state    char(2),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
create type task_status as enum ('To Do', 'In Progress', 'Done');
create type task_category as enum (
  'Testing', 'Applications', 'Essays', 'Financial Aid',
  'Recommendations', 'Visits', 'Scholarships', 'Research', 'Other'
);

create table public.tasks (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  description      text,
  status           task_status not null default 'To Do',
  category         task_category not null default 'Other',
  due_date         date,
  calendar_event_id text,
  sort_order       integer not null default 0,
  completed_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_status_idx on public.tasks(user_id, status);

-- ─── Progress / Milestones ────────────────────────────────────────────────────
create table public.progress (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  milestone_key text not null,
  reached_at    timestamptz default now(),
  notes         text,
  unique(user_id, milestone_key)
);

create index progress_user_id_idx on public.progress(user_id);

-- ─── Scholarships ─────────────────────────────────────────────────────────────
create type scholarship_difficulty as enum ('Easy', 'Medium', 'Hard');
create type scholarship_stage as enum ('Researching', 'Applying', 'Submitted', 'Won');

create table public.scholarships (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  amount           integer,
  deadline         date,
  essay_required   boolean default false,
  difficulty       scholarship_difficulty default 'Medium',
  stage            scholarship_stage not null default 'Researching',
  url              text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index scholarships_user_id_idx on public.scholarships(user_id);

-- ─── Subscriptions ────────────────────────────────────────────────────────────
create type subscription_tier as enum ('free', 'pro');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'paused');

create table public.subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade unique,
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  tier                  subscription_tier not null default 'free',
  status                subscription_status,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean default false,
  trial_end             timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─── AI Usage Tracking ────────────────────────────────────────────────────────
create table public.ai_usage (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  feature    text not null,  -- 'chat', 'strategy', 'comparison', 'roadmap'
  tokens     integer,
  created_at timestamptz default now()
);

create index ai_usage_user_month_idx on public.ai_usage(user_id, created_at);

-- ─── Updated-at trigger ───────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();
create trigger scholarships_updated_at before update on public.scholarships
  for each row execute function public.handle_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ─── New user handler ─────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  insert into public.subscriptions (user_id, tier)
  values (new.id, 'free');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
