import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

const PROFILES_DB = process.env.NOTION_PROFILES_DB_ID;
const TASKS_DB = process.env.NOTION_TASKS_DB_ID;
const PROGRESS_DB = process.env.NOTION_PROGRESS_DB_ID;
const SCHOLARSHIPS_DB = process.env.NOTION_SCHOLARSHIPS_DB_ID;

// SDK v5 removed databases.query — use REST API directly
async function queryDatabase(databaseId, { filter, sorts, start_cursor } = {}) {
  const body = {};
  if (filter) body.filter = filter;
  if (sorts) body.sorts = sorts;
  if (start_cursor) body.start_cursor = start_cursor;

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion query failed: ${err.message}`);
  }
  return res.json();
}

// ─── Profiles ────────────────────────────────────────────

export async function createProfile({ userId, displayName, email, gpa, sat, proposedMajor, schools }) {
  return notion.pages.create({
    parent: { database_id: PROFILES_DB },
    properties: {
      UserID:        { title: [{ text: { content: userId } }] },
      DisplayName:   { rich_text: [{ text: { content: displayName || '' } }] },
      Email:         { rich_text: [{ text: { content: email || '' } }] },
      GPA:           { number: gpa || null },
      SAT:           { number: sat || null },
      ProposedMajor: { rich_text: [{ text: { content: proposedMajor || '' } }] },
      School1:       { rich_text: [{ text: { content: schools?.[0]?.name || '' } }] },
      School1ID:     { rich_text: [{ text: { content: schools?.[0]?.id || '' } }] },
      School2:       { rich_text: [{ text: { content: schools?.[1]?.name || '' } }] },
      School2ID:     { rich_text: [{ text: { content: schools?.[1]?.id || '' } }] },
      School3:       { rich_text: [{ text: { content: schools?.[2]?.name || '' } }] },
      School3ID:     { rich_text: [{ text: { content: schools?.[2]?.id || '' } }] },
      School4:       { rich_text: [{ text: { content: schools?.[3]?.name || '' } }] },
      School4ID:     { rich_text: [{ text: { content: schools?.[3]?.id || '' } }] },
    }
  });
}

export async function getProfile(userId) {
  const res = await queryDatabase(PROFILES_DB, {
    filter: { property: 'UserID', title: { equals: userId } }
  });
  if (res.results.length === 0) return null;
  return parseProfile(res.results[0]);
}

export async function updateProfile(userId, updates) {
  const res = await queryDatabase(PROFILES_DB, {
    filter: { property: 'UserID', title: { equals: userId } }
  });
  if (res.results.length === 0) return null;
  const pageId = res.results[0].id;

  const properties = {};
  if (updates.displayName !== undefined)
    properties.DisplayName = { rich_text: [{ text: { content: updates.displayName } }] };
  if (updates.gpa !== undefined)
    properties.GPA = { number: updates.gpa };
  if (updates.sat !== undefined)
    properties.SAT = { number: updates.sat };
  if (updates.proposedMajor !== undefined)
    properties.ProposedMajor = { rich_text: [{ text: { content: updates.proposedMajor } }] };
  if (updates.schools) {
    for (let i = 0; i < 4; i++) {
      const n = i + 1;
      if (updates.schools[i]) {
        properties[`School${n}`] = { rich_text: [{ text: { content: updates.schools[i].name || '' } }] };
        properties[`School${n}ID`] = { rich_text: [{ text: { content: updates.schools[i].id || '' } }] };
      }
    }
  }
  if (updates.email !== undefined)
    properties.Email = { rich_text: [{ text: { content: updates.email } }] };
  if (updates.subscriptionStatus !== undefined)
    properties.SubscriptionStatus = { select: { name: updates.subscriptionStatus } };
  if (updates.subscriptionEnd !== undefined)
    properties.SubscriptionEnd = updates.subscriptionEnd ? { date: { start: updates.subscriptionEnd } } : { date: null };
  if (updates.stripeCustomerId !== undefined)
    properties.StripeCustomerID = { rich_text: [{ text: { content: updates.stripeCustomerId } }] };
  if (updates.stripeSubscriptionId !== undefined)
    properties.StripeSubscriptionID = { rich_text: [{ text: { content: updates.stripeSubscriptionId } }] };

  return notion.pages.update({ page_id: pageId, properties });
}

function parseProfile(page) {
  const p = page.properties;
  return {
    id: page.id,
    userId: p.UserID?.title?.[0]?.plain_text || '',
    displayName: p.DisplayName?.rich_text?.[0]?.plain_text || '',
    email: p.Email?.rich_text?.[0]?.plain_text || '',
    gpa: p.GPA?.number,
    sat: p.SAT?.number,
    proposedMajor: p.ProposedMajor?.rich_text?.[0]?.plain_text || '',
    schools: [
      { name: p.School1?.rich_text?.[0]?.plain_text || '', id: p.School1ID?.rich_text?.[0]?.plain_text || '' },
      { name: p.School2?.rich_text?.[0]?.plain_text || '', id: p.School2ID?.rich_text?.[0]?.plain_text || '' },
      { name: p.School3?.rich_text?.[0]?.plain_text || '', id: p.School3ID?.rich_text?.[0]?.plain_text || '' },
      { name: p.School4?.rich_text?.[0]?.plain_text || '', id: p.School4ID?.rich_text?.[0]?.plain_text || '' },
    ],
    subscriptionStatus: p.SubscriptionStatus?.select?.name || null,
    subscriptionEnd: p.SubscriptionEnd?.date?.start || null,
    stripeCustomerId: p.StripeCustomerID?.rich_text?.[0]?.plain_text || '',
    stripeSubscriptionId: p.StripeSubscriptionID?.rich_text?.[0]?.plain_text || '',
  };
}

export async function getProfileByStripeCustomerId(customerId) {
  const res = await queryDatabase(PROFILES_DB, {
    filter: { property: 'StripeCustomerID', rich_text: { equals: customerId } }
  });
  if (res.results.length === 0) return null;
  return parseProfile(res.results[0]);
}

// ─── Tasks ───────────────────────────────────────────────

export async function createTask({ taskId, userId, title, description, status, category, dueDate, sortOrder }) {
  return notion.pages.create({
    parent: { database_id: TASKS_DB },
    properties: {
      TaskID:      { title: [{ text: { content: taskId } }] },
      UserID:      { rich_text: [{ text: { content: userId } }] },
      Title:       { rich_text: [{ text: { content: title } }] },
      Description: { rich_text: [{ text: { content: description || '' } }] },
      Status:      { select: { name: status || 'To Do' } },
      Category:    { select: { name: category || 'Other' } },
      DueDate:     dueDate ? { date: { start: dueDate } } : { date: null },
      SortOrder:   { number: sortOrder || 0 },
      CalendarEventID: { rich_text: [{ text: { content: '' } }] },
    }
  });
}

export async function getTasks(userId) {
  const allTasks = [];
  let cursor;
  do {
    const res = await queryDatabase(TASKS_DB, {
      filter: { property: 'UserID', rich_text: { equals: userId } },
      sorts: [{ property: 'SortOrder', direction: 'ascending' }],
      start_cursor: cursor,
    });
    allTasks.push(...res.results.map(parseTask));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return {
    'To Do': allTasks.filter(t => t.status === 'To Do'),
    'In Progress': allTasks.filter(t => t.status === 'In Progress'),
    'Done': allTasks.filter(t => t.status === 'Done'),
  };
}

export async function updateTask(taskId, updates) {
  const page = await findTaskPage(taskId);
  if (!page) return null;

  const properties = {};
  if (updates.title !== undefined)
    properties.Title = { rich_text: [{ text: { content: updates.title } }] };
  if (updates.description !== undefined)
    properties.Description = { rich_text: [{ text: { content: updates.description } }] };
  if (updates.category !== undefined)
    properties.Category = { select: { name: updates.category } };
  if (updates.dueDate !== undefined)
    properties.DueDate = updates.dueDate ? { date: { start: updates.dueDate } } : { date: null };
  if (updates.calendarEventId !== undefined)
    properties.CalendarEventID = { rich_text: [{ text: { content: updates.calendarEventId } }] };
  if (updates.sortOrder !== undefined)
    properties.SortOrder = { number: updates.sortOrder };

  return notion.pages.update({ page_id: page.id, properties });
}

export async function moveTask(taskId, newStatus, sortOrder) {
  const page = await findTaskPage(taskId);
  if (!page) return null;

  const properties = {
    Status: { select: { name: newStatus } },
    SortOrder: { number: sortOrder ?? 0 },
  };

  if (newStatus === 'Done') {
    properties.CompletedAt = { date: { start: new Date().toISOString() } };
  }

  return parseTask(await notion.pages.update({ page_id: page.id, properties }));
}

export async function deleteTask(taskId) {
  const page = await findTaskPage(taskId);
  if (!page) return null;
  return notion.pages.update({ page_id: page.id, archived: true });
}

async function findTaskPage(taskId) {
  const res = await queryDatabase(TASKS_DB, {
    filter: { property: 'TaskID', title: { equals: taskId } }
  });
  return res.results[0] || null;
}

function parseTask(page) {
  const p = page.properties;
  return {
    id: page.id,
    taskId: p.TaskID?.title?.[0]?.plain_text || '',
    userId: p.UserID?.rich_text?.[0]?.plain_text || '',
    title: p.Title?.rich_text?.[0]?.plain_text || '',
    description: p.Description?.rich_text?.[0]?.plain_text || '',
    status: p.Status?.select?.name || 'To Do',
    category: p.Category?.select?.name || 'Other',
    dueDate: p.DueDate?.date?.start || null,
    calendarEventId: p.CalendarEventID?.rich_text?.[0]?.plain_text || '',
    sortOrder: p.SortOrder?.number || 0,
    completedAt: p.CompletedAt?.date?.start || null,
  };
}

// ─── Progress ────────────────────────────────────────────

export async function createProgress({ entryId, userId, milestoneKey, notes }) {
  return notion.pages.create({
    parent: { database_id: PROGRESS_DB },
    properties: {
      EntryID:      { title: [{ text: { content: entryId } }] },
      UserID:       { rich_text: [{ text: { content: userId } }] },
      MilestoneKey: { select: { name: milestoneKey } },
      ReachedAt:    { date: { start: new Date().toISOString() } },
      Notes:        { rich_text: [{ text: { content: notes || '' } }] },
    }
  });
}

export async function getProgress(userId) {
  const res = await queryDatabase(PROGRESS_DB, {
    filter: { property: 'UserID', rich_text: { equals: userId } },
    sorts: [{ property: 'ReachedAt', direction: 'ascending' }],
  });
  return res.results.map(page => {
    const p = page.properties;
    return {
      id: page.id,
      entryId: p.EntryID?.title?.[0]?.plain_text || '',
      userId: p.UserID?.rich_text?.[0]?.plain_text || '',
      milestoneKey: p.MilestoneKey?.select?.name || '',
      reachedAt: p.ReachedAt?.date?.start || null,
      notes: p.Notes?.rich_text?.[0]?.plain_text || '',
    };
  });
}

// ─── Scholarships ─────────────────────────────────────────

export async function createScholarship({ scholarshipId, userId, name, amount, deadline, essayRequired, difficulty, stage, url, notes }) {
  if (!SCHOLARSHIPS_DB) throw new Error('NOTION_SCHOLARSHIPS_DB_ID not configured');
  return parseScholarship(await notion.pages.create({
    parent: { database_id: SCHOLARSHIPS_DB },
    properties: {
      ScholarshipID: { title: [{ text: { content: scholarshipId } }] },
      UserID:        { rich_text: [{ text: { content: userId } }] },
      Name:          { rich_text: [{ text: { content: name || '' } }] },
      Amount:        { number: amount || null },
      Deadline:      deadline ? { date: { start: deadline } } : { date: null },
      EssayRequired: { select: { name: essayRequired ? 'Yes' : 'No' } },
      Difficulty:    { select: { name: difficulty || 'Medium' } },
      Stage:         { select: { name: stage || 'Researching' } },
      URL:           { rich_text: [{ text: { content: url || '' } }] },
      Notes:         { rich_text: [{ text: { content: notes || '' } }] },
    }
  }));
}

export async function getScholarships(userId) {
  if (!SCHOLARSHIPS_DB) return { Researching: [], Applying: [], Submitted: [], Won: [] };
  const all = [];
  let cursor;
  do {
    const res = await queryDatabase(SCHOLARSHIPS_DB, {
      filter: { property: 'UserID', rich_text: { equals: userId } },
      sorts: [{ property: 'Deadline', direction: 'ascending' }],
      start_cursor: cursor,
    });
    all.push(...res.results.map(parseScholarship));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return {
    Researching: all.filter(s => s.stage === 'Researching'),
    Applying:    all.filter(s => s.stage === 'Applying'),
    Submitted:   all.filter(s => s.stage === 'Submitted'),
    Won:         all.filter(s => s.stage === 'Won'),
  };
}

export async function updateScholarship(scholarshipId, updates) {
  const page = await findScholarshipPage(scholarshipId);
  if (!page) return null;

  const properties = {};
  if (updates.name !== undefined)
    properties.Name = { rich_text: [{ text: { content: updates.name } }] };
  if (updates.amount !== undefined)
    properties.Amount = { number: updates.amount };
  if (updates.deadline !== undefined)
    properties.Deadline = updates.deadline ? { date: { start: updates.deadline } } : { date: null };
  if (updates.essayRequired !== undefined)
    properties.EssayRequired = { select: { name: updates.essayRequired ? 'Yes' : 'No' } };
  if (updates.difficulty !== undefined)
    properties.Difficulty = { select: { name: updates.difficulty } };
  if (updates.stage !== undefined)
    properties.Stage = { select: { name: updates.stage } };
  if (updates.url !== undefined)
    properties.URL = { rich_text: [{ text: { content: updates.url } }] };
  if (updates.notes !== undefined)
    properties.Notes = { rich_text: [{ text: { content: updates.notes } }] };

  return parseScholarship(await notion.pages.update({ page_id: page.id, properties }));
}

export async function moveScholarship(scholarshipId, newStage) {
  const page = await findScholarshipPage(scholarshipId);
  if (!page) return null;
  return parseScholarship(await notion.pages.update({
    page_id: page.id,
    properties: { Stage: { select: { name: newStage } } },
  }));
}

export async function deleteScholarship(scholarshipId) {
  const page = await findScholarshipPage(scholarshipId);
  if (!page) return null;
  return notion.pages.update({ page_id: page.id, archived: true });
}

async function findScholarshipPage(scholarshipId) {
  if (!SCHOLARSHIPS_DB) return null;
  const res = await queryDatabase(SCHOLARSHIPS_DB, {
    filter: { property: 'ScholarshipID', title: { equals: scholarshipId } }
  });
  return res.results[0] || null;
}

function parseScholarship(page) {
  const p = page.properties;
  return {
    id: page.id,
    scholarshipId: p.ScholarshipID?.title?.[0]?.plain_text || '',
    userId: p.UserID?.rich_text?.[0]?.plain_text || '',
    name: p.Name?.rich_text?.[0]?.plain_text || '',
    amount: p.Amount?.number || null,
    deadline: p.Deadline?.date?.start || null,
    essayRequired: p.EssayRequired?.select?.name === 'Yes',
    difficulty: p.Difficulty?.select?.name || 'Medium',
    stage: p.Stage?.select?.name || 'Researching',
    url: p.URL?.rich_text?.[0]?.plain_text || '',
    notes: p.Notes?.rich_text?.[0]?.plain_text || '',
  };
}
