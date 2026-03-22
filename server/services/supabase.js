import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── Profiles ────────────────────────────────────────────

export async function createProfile({ userId, displayName, gpa, sat, act, proposedMajor, schools }) {
  const insertRow = {
    display_name: displayName || '',
    gpa: gpa || null,
    sat: sat || null,
    act_score: act || null,
    proposed_major: proposedMajor || '',
  };
  // If a specific id is provided, use it; otherwise let Supabase generate one
  if (userId) insertRow.id = userId;

  const { data, error } = await supabase
    .from('profiles')
    .insert(insertRow)
    .select()
    .single();
  if (error) throw error;

  const profileId = data.id;
  if (schools?.length) {
    await upsertSchools(profileId, schools);
  }

  return getProfile(profileId);
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const schools = await getSchools(userId);
  return parseProfile(data, schools);
}

export async function updateProfile(userId, updates) {
  const row = {};
  if (updates.displayName !== undefined) row.display_name = updates.displayName;
  if (updates.gpa !== undefined) row.gpa = updates.gpa;
  if (updates.sat !== undefined) row.sat = updates.sat;
  if (updates.act !== undefined) row.act_score = updates.act;
  if (updates.proposedMajor !== undefined) row.proposed_major = updates.proposedMajor;

  if (Object.keys(row).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', userId);
    if (error) throw error;
  }

  if (updates.schools) {
    await upsertSchools(userId, updates.schools);
  }

  return getProfile(userId);
}

export async function getProfileByStripeCustomerId(customerId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const schools = await getSchools(data.id);
  return parseProfile(data, schools);
}

// ─── School helpers (junction table) ─────────────────────

async function getSchools(userId) {
  const { data, error } = await supabase
    .from('user_schools')
    .select('school_name, school_id, sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(r => ({ name: r.school_name, id: r.school_id }));
}

async function upsertSchools(userId, schools) {
  const valid = schools.filter(s => s?.name && s.name.trim() !== '');

  const { error: delErr } = await supabase
    .from('user_schools')
    .delete()
    .eq('user_id', userId);
  if (delErr) throw delErr;

  if (valid.length > 0) {
    const rows = valid.map((s, i) => ({
      user_id: userId,
      school_name: s.name,
      school_id: s.id || '',
      sort_order: i,
    }));
    const { error: insErr } = await supabase
      .from('user_schools')
      .insert(rows);
    if (insErr) throw insErr;
  }
}

function parseProfile(row, schools = []) {
  return {
    id: row.id,
    userId: row.id,
    displayName: row.display_name || '',
    gpa: row.gpa != null ? Number(row.gpa) : undefined,
    sat: row.sat,
    act: row.act_score,
    proposedMajor: row.proposed_major || '',
    schools,
    homeState: row.home_state || '',
    gradYear: row.grad_year,
    onboardingComplete: !!row.onboarding_complete,
    desiredClimate: row.desired_climate || '',
    schoolSizePref: row.school_size_pref || '',
    schoolTypePref: row.school_type_pref || '',
    distancePref: row.distance_pref || '',
    extracurriculars: row.extracurriculars || '',
    careerInterests: row.career_interests || '',
    strategyResult: row.strategy_result || null,
    strategyGeneratedAt: row.strategy_generated_at || null,
  };
}

// ─── Tasks ───────────────────────────────────────────────

export async function createTask({ taskId, userId, title, description, status, category, dueDate, sortOrder }) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      task_id: taskId,
      user_id: userId,
      title,
      description: description || '',
      status: status || 'To Do',
      category: category || 'Other',
      due_date: dueDate || null,
      sort_order: sortOrder || 0,
      calendar_event_id: '',
    })
    .select()
    .single();
  if (error) throw error;
  return parseTask(data);
}

export async function getTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });
  if (error) throw error;

  const tasks = (data || []).map(parseTask);
  return {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done'),
  };
}

export async function updateTask(taskId, updates) {
  const row = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.dueDate !== undefined) row.due_date = updates.dueDate || null;
  if (updates.calendarEventId !== undefined) row.calendar_event_id = updates.calendarEventId;
  if (updates.sortOrder !== undefined) row.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('task_id', taskId)
    .select()
    .single();
  if (error) throw error;
  return parseTask(data);
}

export async function moveTask(taskId, newStatus, sortOrder) {
  const row = {
    status: newStatus,
    sort_order: sortOrder ?? 0,
  };
  if (newStatus === 'Done') {
    row.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('task_id', taskId)
    .select()
    .single();
  if (error) throw error;
  return parseTask(data);
}

export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('task_id', taskId);
  if (error) throw error;
  return { success: true };
}

function parseTask(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    title: row.title || '',
    description: row.description || '',
    status: row.status || 'To Do',
    category: row.category || 'Other',
    dueDate: row.due_date || null,
    calendarEventId: row.calendar_event_id || '',
    sortOrder: row.sort_order || 0,
    completedAt: row.completed_at || null,
  };
}

// ─── Progress ────────────────────────────────────────────

export async function createProgress({ entryId, userId, milestoneKey, notes }) {
  const { data, error } = await supabase
    .from('progress')
    .insert({
      entry_id: entryId,
      user_id: userId,
      milestone_key: milestoneKey,
      reached_at: new Date().toISOString(),
      notes: notes || '',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .order('reached_at', { ascending: true });
  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    entryId: row.entry_id,
    userId: row.user_id,
    milestoneKey: row.milestone_key,
    reachedAt: row.reached_at,
    notes: row.notes || '',
  }));
}

// ─── Scholarships ─────────────────────────────────────────

export async function createScholarship({ scholarshipId, userId, name, amount, deadline, essayRequired, difficulty, stage, url, notes }) {
  const { data, error } = await supabase
    .from('scholarships')
    .insert({
      scholarship_id: scholarshipId,
      user_id: userId,
      name: name || '',
      amount: amount || null,
      deadline: deadline || null,
      essay_required: !!essayRequired,
      difficulty: difficulty || 'Medium',
      stage: stage || 'Researching',
      url: url || '',
      notes: notes || '',
    })
    .select()
    .single();
  if (error) throw error;
  return parseScholarship(data);
}

export async function getScholarships(userId) {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true });
  if (error) throw error;

  const all = (data || []).map(parseScholarship);
  return {
    Researching: all.filter(s => s.stage === 'Researching'),
    Applying: all.filter(s => s.stage === 'Applying'),
    Submitted: all.filter(s => s.stage === 'Submitted'),
    Won: all.filter(s => s.stage === 'Won'),
  };
}

export async function updateScholarship(scholarshipId, updates) {
  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.amount !== undefined) row.amount = updates.amount;
  if (updates.deadline !== undefined) row.deadline = updates.deadline || null;
  if (updates.essayRequired !== undefined) row.essay_required = !!updates.essayRequired;
  if (updates.difficulty !== undefined) row.difficulty = updates.difficulty;
  if (updates.stage !== undefined) row.stage = updates.stage;
  if (updates.url !== undefined) row.url = updates.url;
  if (updates.notes !== undefined) row.notes = updates.notes;

  const { data, error } = await supabase
    .from('scholarships')
    .update(row)
    .eq('scholarship_id', scholarshipId)
    .select()
    .single();
  if (error) throw error;
  return parseScholarship(data);
}

export async function moveScholarship(scholarshipId, newStage) {
  const { data, error } = await supabase
    .from('scholarships')
    .update({ stage: newStage })
    .eq('scholarship_id', scholarshipId)
    .select()
    .single();
  if (error) throw error;
  return parseScholarship(data);
}

export async function deleteScholarship(scholarshipId) {
  const { error } = await supabase
    .from('scholarships')
    .delete()
    .eq('scholarship_id', scholarshipId);
  if (error) throw error;
  return { success: true };
}

function parseScholarship(row) {
  return {
    id: row.id,
    scholarshipId: row.scholarship_id,
    userId: row.user_id,
    name: row.name || '',
    amount: row.amount != null ? Number(row.amount) : null,
    deadline: row.deadline || null,
    essayRequired: !!row.essay_required,
    difficulty: row.difficulty || 'Medium',
    stage: row.stage || 'Researching',
    url: row.url || '',
    notes: row.notes || '',
  };
}
