-- Function to seed default tasks for a new user
-- Called after profile creation (or manually during onboarding)
create or replace function public.seed_default_tasks(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  base_date date := date_trunc('year', current_date)::date;
  yr int := extract(year from current_date)::int;
begin
  -- Use current year as junior year if before July, otherwise treat as senior year
  -- We seed for the common US college app timeline

  insert into public.tasks (user_id, title, category, status, due_date, sort_order) values
  -- Testing
  (p_user_id, 'Register for PSAT/NMSQT', 'Testing', 'To Do', make_date(yr, 9, 15), 1),
  (p_user_id, 'Take PSAT/NMSQT', 'Testing', 'To Do', make_date(yr, 10, 15), 2),
  (p_user_id, 'Register for SAT (Spring sitting)', 'Testing', 'To Do', make_date(yr, 12, 1), 3),
  (p_user_id, 'Take SAT (Spring sitting)', 'Testing', 'To Do', make_date(yr+1, 3, 8), 4),
  (p_user_id, 'Register for SAT (Fall sitting)', 'Testing', 'To Do', make_date(yr+1, 8, 15), 5),
  (p_user_id, 'Take SAT (Fall sitting)', 'Testing', 'To Do', make_date(yr+1, 10, 5), 6),
  -- Research
  (p_user_id, 'Research 10+ colleges that match your interests', 'Research', 'To Do', make_date(yr, 10, 1), 10),
  (p_user_id, 'Narrow list to 8–12 schools (reach/target/safety)', 'Research', 'To Do', make_date(yr+1, 1, 15), 11),
  (p_user_id, 'Research financial aid policies for target schools', 'Financial Aid', 'To Do', make_date(yr+1, 2, 1), 12),
  -- Visits
  (p_user_id, 'Schedule campus visits (3–5 schools)', 'Visits', 'To Do', make_date(yr+1, 3, 1), 20),
  (p_user_id, 'Complete campus visits before application season', 'Visits', 'To Do', make_date(yr+1, 7, 31), 21),
  -- Recommendations
  (p_user_id, 'Identify 2–3 recommenders', 'Recommendations', 'To Do', make_date(yr+1, 5, 1), 30),
  (p_user_id, 'Ask recommenders (give at least 2 months notice)', 'Recommendations', 'To Do', make_date(yr+1, 6, 1), 31),
  (p_user_id, 'Share activity resume + talking points with recommenders', 'Recommendations', 'To Do', make_date(yr+1, 8, 15), 32),
  -- Essays
  (p_user_id, 'Brainstorm Common App essay topics', 'Essays', 'To Do', make_date(yr+1, 6, 1), 40),
  (p_user_id, 'Draft Common App personal statement', 'Essays', 'To Do', make_date(yr+1, 7, 15), 41),
  (p_user_id, 'Revise Common App essay (at least 2 rounds)', 'Essays', 'To Do', make_date(yr+1, 8, 31), 42),
  (p_user_id, 'Finalize Common App essay', 'Essays', 'To Do', make_date(yr+1, 9, 15), 43),
  (p_user_id, 'Write supplemental essays for each school', 'Essays', 'To Do', make_date(yr+1, 10, 15), 44),
  -- Applications
  (p_user_id, 'Create Common App account and fill in basics', 'Applications', 'To Do', make_date(yr+1, 8, 1), 50),
  (p_user_id, 'Request official transcripts from counselor', 'Applications', 'To Do', make_date(yr+1, 9, 1), 51),
  (p_user_id, 'Submit Early Decision / Early Action applications', 'Applications', 'To Do', make_date(yr+1, 11, 1), 52),
  (p_user_id, 'Submit Regular Decision applications', 'Applications', 'To Do', make_date(yr+2, 1, 1), 53),
  -- Financial Aid
  (p_user_id, 'Complete FAFSA (opens Oct 1)', 'Financial Aid', 'To Do', make_date(yr+1, 10, 15), 60),
  (p_user_id, 'Complete CSS Profile if required', 'Financial Aid', 'To Do', make_date(yr+1, 11, 1), 61),
  (p_user_id, 'Review and compare financial aid award letters', 'Financial Aid', 'To Do', make_date(yr+2, 3, 15), 62),
  -- Scholarships
  (p_user_id, 'Research local/state scholarships', 'Scholarships', 'To Do', make_date(yr+1, 9, 1), 70),
  (p_user_id, 'Apply to 5+ external scholarships', 'Scholarships', 'To Do', make_date(yr+1, 12, 1), 71),
  -- Decision
  (p_user_id, 'Make final college decision by May 1', 'Applications', 'To Do', make_date(yr+2, 5, 1), 80);
end;
$$;
