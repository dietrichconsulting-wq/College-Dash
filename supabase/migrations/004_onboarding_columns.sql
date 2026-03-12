-- Add onboarding fields to profiles
alter table public.profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists grad_year           integer,
  add column if not exists act_score           integer,
  add column if not exists desired_climate     text,   -- 'Warm/Hot' | 'Mild' | 'Cold/Snowy' | 'Any'
  add column if not exists school_size_pref    text,   -- 'Small' | 'Medium' | 'Large' | 'Any'
  add column if not exists school_type_pref    text,   -- 'Public' | 'Private' | 'Either'
  add column if not exists distance_pref       text,   -- 'Close (<2h)' | 'Regional (<5h)' | 'Anywhere'
  add column if not exists extracurriculars    text,   -- free text summary
  add column if not exists career_interests    text;   -- free text summary
