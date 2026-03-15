-- Replace seed function: no auto-populated dates, season hints in descriptions
create or replace function public.seed_default_tasks(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.tasks (user_id, title, description, category, status, due_date, sort_order) values
  -- Testing (Fall Junior Year)
  (p_user_id, 'Register for PSAT/NMSQT', 'Fall — Junior Year', 'Testing', 'To Do', null, 1),
  (p_user_id, 'Take PSAT/NMSQT', 'Fall — Junior Year (October)', 'Testing', 'To Do', null, 2),
  (p_user_id, 'Register for SAT (Spring sitting)', 'Winter — Junior Year', 'Testing', 'To Do', null, 3),
  (p_user_id, 'Take SAT (Spring sitting)', 'Spring — Junior Year (March)', 'Testing', 'To Do', null, 4),
  (p_user_id, 'Register for SAT (Fall sitting)', 'Summer — Before Senior Year', 'Testing', 'To Do', null, 5),
  (p_user_id, 'Take SAT (Fall sitting)', 'Fall — Senior Year (October)', 'Testing', 'To Do', null, 6),
  -- Research
  (p_user_id, 'Research 10+ colleges that match your interests', 'Fall — Junior Year', 'Research', 'To Do', null, 10),
  (p_user_id, 'Narrow list to 8–12 schools (reach/target/safety)', 'Winter — Junior Year', 'Research', 'To Do', null, 11),
  (p_user_id, 'Research financial aid policies for target schools', 'Winter/Spring — Junior Year', 'Financial Aid', 'To Do', null, 12),
  -- Visits
  (p_user_id, 'Schedule campus visits (3–5 schools)', 'Spring — Junior Year', 'Visits', 'To Do', null, 20),
  (p_user_id, 'Complete campus visits before application season', 'Summer — Before Senior Year', 'Visits', 'To Do', null, 21),
  -- Recommendations
  (p_user_id, 'Identify 2–3 recommenders', 'Spring — Junior Year', 'Recommendations', 'To Do', null, 30),
  (p_user_id, 'Ask recommenders (give at least 2 months notice)', 'Late Spring — Junior Year', 'Recommendations', 'To Do', null, 31),
  (p_user_id, 'Share activity resume + talking points with recommenders', 'Summer — Before Senior Year', 'Recommendations', 'To Do', null, 32),
  -- Essays
  (p_user_id, 'Brainstorm Common App essay topics', 'Late Spring — Junior Year', 'Essays', 'To Do', null, 40),
  (p_user_id, 'Draft Common App personal statement', 'Summer — Before Senior Year', 'Essays', 'To Do', null, 41),
  (p_user_id, 'Revise Common App essay (at least 2 rounds)', 'Summer — Before Senior Year', 'Essays', 'To Do', null, 42),
  (p_user_id, 'Finalize Common App essay', 'Early Fall — Senior Year', 'Essays', 'To Do', null, 43),
  (p_user_id, 'Write supplemental essays for each school', 'Fall — Senior Year', 'Essays', 'To Do', null, 44),
  -- Applications
  (p_user_id, 'Create Common App account and fill in basics', 'Summer — Before Senior Year (Aug 1)', 'Applications', 'To Do', null, 50),
  (p_user_id, 'Request official transcripts from counselor', 'Early Fall — Senior Year', 'Applications', 'To Do', null, 51),
  (p_user_id, 'Submit Early Decision / Early Action applications', 'Fall — Senior Year (Nov 1)', 'Applications', 'To Do', null, 52),
  (p_user_id, 'Submit Regular Decision applications', 'Winter — Senior Year (Jan 1)', 'Applications', 'To Do', null, 53),
  -- Financial Aid
  (p_user_id, 'Complete FAFSA (opens Oct 1)', 'Fall — Senior Year', 'Financial Aid', 'To Do', null, 60),
  (p_user_id, 'Complete CSS Profile if required', 'Fall — Senior Year', 'Financial Aid', 'To Do', null, 61),
  (p_user_id, 'Review and compare financial aid award letters', 'Spring — Senior Year', 'Financial Aid', 'To Do', null, 62),
  -- Scholarships
  (p_user_id, 'Research local/state scholarships', 'Fall — Senior Year', 'Scholarships', 'To Do', null, 70),
  (p_user_id, 'Apply to 5+ external scholarships', 'Fall/Winter — Senior Year', 'Scholarships', 'To Do', null, 71),
  -- Decision
  (p_user_id, 'Make final college decision by May 1', 'Spring — Senior Year', 'Applications', 'To Do', null, 80);
end;
$$;
