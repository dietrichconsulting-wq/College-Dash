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

export async function createProfile({ userId, displayName, email, gpa, sat, proposedMajor, schools }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      display_name: displayName || '',
      email: email || '',
      gpa: gpa || null,
      sat: sat || null,
      proposed_major: proposedMajor || '',
      school1: schools?.[0]?.name || '',
      school1_id: schools?.[0]?.id || '',
      school2: schools?.[1]?.name || '',
      school2_id: schools?.[1]?.id || '',
      school3: schools?.[2]?.name || '',
      school3_id: schools?.[2]?.id || '',
      school4: schools?.[3]?.name || '',
      school4_id: schools?.[3]?.id || '',
    })
    .select()
    .single();
  if (error) throw error;
  return parseProfile(data);
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return parseProfile(data);
}

export async function updateProfile(userId, updates) {
  const row = {};
  if (updates.displayName !== undefined) row.display_name = updates.displayName;
  if (updates.gpa !== undefined) row.gpa = updates.gpa;
  if (updates.sat !== undefined) row.sat = updates.sat;
  if (updates.proposedMajor !== undefined) row.proposed_major = updates.proposedMajor;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.subscriptionStatus !== undefined) row.subscription_status = updates.subscriptionStatus;
  if (updates.subscriptionEnd !== undefined) row.subscription_end = updates.subscriptionEnd || null;
  if (updates.stripeCustomerId !== undefined) row.stripe_customer_id = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) row.stripe_subscription_id = updates.stripeSubscriptionId;
  if (updates.schools) {
    for (let i = 0; i < 4; i++) {
      const n = i + 1;
      if (updates.schools[i]) {
        row[`school${n}`] = updates.schools[i].name || '';
        row[`school${n}_id`] = updates.schools[i].id || '';
      }
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return parseProfile(data);
}

export async function getProfileByStripeCustomerId(customerId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return parseProfile(data);
}

function parseProfile(row) {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name || '',
    email: row.email || '',
    gpa: row.gpa != null ? Number(row.gpa) : undefined,
    sat: row.sat,
    proposedMajor: row.proposed_major || '',
    schools: [
      { name: row.school1 || '', id: row.school1_id || '' },
      { name: row.school2 || '', id: row.school2_id || '' },
      { name: row.school3 || '', id: row.school3_id || '' },
      { name: row.school4 || '', id: row.school4_id || '' },
    ],
    subscriptionStatus: row.subscription_status || null,
    subscriptionEnd: row.subscription_end || null,
    stripeCustomerId: row.stripe_customer_id || '',
    stripeSubscriptionId: row.stripe_subscription_id || '',
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
