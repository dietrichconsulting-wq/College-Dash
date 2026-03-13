-- Persist the last generated college strategy for each user
alter table public.profiles
  add column if not exists strategy_result jsonb,
  add column if not exists strategy_generated_at timestamptz;
