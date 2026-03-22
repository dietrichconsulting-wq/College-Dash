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

export async function createProfile({ userId, displayName, email, gpa, sat, act, proposedMajor, schools, accountType }) {
  const insertRow = {
    display_name: displayName || '',
    email: email || '',
    gpa: gpa || null,
    sat: sat || null,
    act_score: act || null,
    proposed_major: proposedMajor || '',
    account_type: accountType || 'student',
  };
  // If a specific id is provided, use it; otherwise let Supabase generate one
  if (userId) insertRow.id = userId;
  // Generate a link code for student accounts
  if ((accountType || 'student') === 'student') {
    insertRow.link_code = generateLinkCode();
  }

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
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.gpa !== undefined) row.gpa = updates.gpa;
  if (updates.sat !== undefined) row.sat = updates.sat;
  if (updates.act !== undefined) row.act_score = updates.act;
  if (updates.proposedMajor !== undefined) row.proposed_major = updates.proposedMajor;
  if (updates.accountType !== undefined) row.account_type = updates.accountType;
  if (updates.linkCode !== undefined) row.link_code = updates.linkCode;
  if (updates.stripeCustomerId !== undefined) row.stripe_customer_id = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) row.stripe_subscription_id = updates.stripeSubscriptionId;
  if (updates.subscriptionStatus !== undefined) row.subscription_status = updates.subscriptionStatus;
  if (updates.subscriptionEnd !== undefined) row.subscription_end = updates.subscriptionEnd;

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
    email: row.email || '',
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
    accountType: row.account_type || 'student',
    linkCode: row.link_code || null,
    stripeCustomerId: row.stripe_customer_id || null,
    subscriptionStatus: row.subscription_status || 'none',
    subscriptionEnd: row.subscription_end || null,
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

// ─── Link Code Helper ────────────────────────────────────────

function generateLinkCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/1/I to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Parent Links ────────────────────────────────────────────

export async function getProfileByLinkCode(linkCode) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('link_code', linkCode.toUpperCase())
    .eq('account_type', 'student')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const schools = await getSchools(data.id);
  return parseProfile(data, schools);
}

export async function createParentLink(parentId, studentId) {
  const { data, error } = await supabase
    .from('parent_links')
    .insert({ parent_id: parentId, student_id: studentId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLinkedStudent(parentId) {
  const { data, error } = await supabase
    .from('parent_links')
    .select('student_id')
    .eq('parent_id', parentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return getProfile(data.student_id);
}

export async function getLinkedParents(studentId) {
  const { data, error } = await supabase
    .from('parent_links')
    .select('parent_id')
    .eq('student_id', studentId);
  if (error) throw error;

  const parents = [];
  for (const row of data || []) {
    const profile = await getProfile(row.parent_id);
    if (profile) parents.push({ id: profile.id, displayName: profile.displayName, email: profile.email });
  }
  return parents;
}

export async function deleteParentLink(parentId) {
  const { error } = await supabase
    .from('parent_links')
    .delete()
    .eq('parent_id', parentId);
  if (error) throw error;
  return { success: true };
}

export async function regenerateLinkCode(userId) {
  const newCode = generateLinkCode();
  const { error } = await supabase
    .from('profiles')
    .update({ link_code: newCode })
    .eq('id', userId)
    .eq('account_type', 'student');
  if (error) throw error;
  return newCode;
}

// ─── Digest Queries ──────────────────────────────────────────

export async function getTasksCompletedSince(userId, sinceDate) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'Done')
    .gte('completed_at', sinceDate.toISOString())
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(parseTask);
}

export async function getMilestonesSince(userId, sinceDate) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .gte('reached_at', sinceDate.toISOString())
    .order('reached_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    milestoneKey: row.milestone_key,
    reachedAt: row.reached_at,
    notes: row.notes || '',
  }));
}

export async function getUpcomingDeadlines(userId, limit = 5) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'Done')
    .not('due_date', 'is', null)
    .gte('due_date', new Date().toISOString().split('T')[0])
    .order('due_date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(parseTask);
}

export async function getAllParentLinksWithEmails() {
  const { data, error } = await supabase
    .from('parent_links')
    .select(`
      parent_id,
      student_id,
      parent:profiles!parent_links_parent_id_fkey(id, display_name, email),
      student:profiles!parent_links_student_id_fkey(id, display_name)
    `);
  if (error) throw error;
  return (data || []).map(row => ({
    parentId: row.parent_id,
    studentId: row.student_id,
    parentName: row.parent?.display_name || '',
    parentEmail: row.parent?.email || '',
    studentName: row.student?.display_name || '',
  }));
}

export async function logDigestSent(parentId, studentId, weekKey) {
  const { error } = await supabase
    .from('digest_log')
    .insert({ parent_id: parentId, student_id: studentId, week_key: weekKey });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function wasDigestSent(parentId, studentId, weekKey) {
  const { data, error } = await supabase
    .from('digest_log')
    .select('id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .eq('week_key', weekKey)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}
