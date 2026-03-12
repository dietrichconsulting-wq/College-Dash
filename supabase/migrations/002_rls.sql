-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.progress enable row level security;
alter table public.scholarships enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_usage enable row level security;

-- Profiles: users see only their own
create policy "profiles: own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Tasks: users see only their own
create policy "tasks: own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Progress: users see only their own
create policy "progress: own" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Scholarships: users see only their own
create policy "scholarships: own" on public.scholarships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscriptions: users can read their own; service role manages writes
create policy "subscriptions: read own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- AI usage: users can read their own; service role manages inserts
create policy "ai_usage: read own" on public.ai_usage
  for select using (auth.uid() = user_id);
create policy "ai_usage: insert own" on public.ai_usage
  for insert with check (auth.uid() = user_id);
