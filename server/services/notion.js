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

export async function createProfile({ userId, displayName, gpa, sat, proposedMajor, schools }) {
  return notion.pages.create({
    parent: { database_id: PROFILES_DB },
    properties: {
      UserID:        { title: [{ text: { content: userId } }] },
      DisplayName:   { rich_text: [{ text: { content: displayName || '' } }] },
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

  return notion.pages.update({ page_id: pageId, properties });
}

function parseProfile(page) {
  const p = page.properties;
  return {
    id: page.id,
    userId: p.UserID?.title?.[0]?.plain_text || '',
    displayName: p.DisplayName?.rich_text?.[0]?.plain_text || '',
    gpa: p.GPA?.number,
    sat: p.SAT?.number,
    proposedMajor: p.ProposedMajor?.rich_text?.[0]?.plain_text || '',
    schools: [
      { name: p.School1?.rich_text?.[0]?.plain_text || '', id: p.School1ID?.rich_text?.[0]?.plain_text || '' },
      { name: p.School2?.rich_text?.[0]?.plain_text || '', id: p.School2ID?.rich_text?.[0]?.plain_text || '' },
      { name: p.School3?.rich_text?.[0]?.plain_text || '', id: p.School3ID?.rich_text?.[0]?.plain_text || '' },
      { name: p.School4?.rich_text?.[0]?.plain_text || '', id: p.School4ID?.rich_text?.[0]?.plain_text || '' },
    ]
  };
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
