import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const API_KEY = process.env.NOTION_API_KEY;
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;
const NOTION_VERSION = '2022-06-28';

async function notionFetch(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: body ? 'PATCH' : 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion API error: ${err.message}`);
  }
  return res.json();
}

async function createDB(title, properties) {
  const res = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
      title: [{ text: { content: title } }],
      properties,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to create "${title}": ${err.message}`);
  }
  return res.json();
}

async function main() {
  if (!PARENT_PAGE_ID) {
    console.error('Set NOTION_PARENT_PAGE_ID in .env');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error('Set NOTION_API_KEY in .env');
    process.exit(1);
  }

  console.log('Creating Notion databases...');

  const profiles = await createDB('College Dashboard - Profiles', {
    UserID:        { title: {} },
    DisplayName:   { rich_text: {} },
    GPA:           { number: { format: 'number' } },
    SAT:           { number: { format: 'number' } },
    ProposedMajor: { rich_text: {} },
    School1:       { rich_text: {} },
    School1ID:     { rich_text: {} },
    School2:       { rich_text: {} },
    School2ID:     { rich_text: {} },
    School3:       { rich_text: {} },
    School3ID:     { rich_text: {} },
    School4:       { rich_text: {} },
    School4ID:     { rich_text: {} },
    Email:         { rich_text: {} },
    SubscriptionStatus: { select: { options: [
      { name: 'trial', color: 'yellow' },
      { name: 'active', color: 'green' },
      { name: 'cancelled', color: 'orange' },
      { name: 'expired', color: 'red' },
    ]}},
    SubscriptionEnd:    { date: {} },
    StripeCustomerID:   { rich_text: {} },
    StripeSubscriptionID: { rich_text: {} },
  });
  console.log(`Profiles DB created: ${profiles.id}`);

  const tasks = await createDB('College Dashboard - Tasks', {
    TaskID:          { title: {} },
    UserID:          { rich_text: {} },
    Title:           { rich_text: {} },
    Description:     { rich_text: {} },
    Status:          { select: { options: [
      { name: 'To Do', color: 'blue' },
      { name: 'In Progress', color: 'yellow' },
      { name: 'Done', color: 'green' },
    ]}},
    Category:        { select: { options: [
      { name: 'Testing', color: 'blue' },
      { name: 'Application', color: 'purple' },
      { name: 'Financial', color: 'green' },
      { name: 'Visit', color: 'orange' },
      { name: 'Portfolio', color: 'pink' },
      { name: 'Recommendation', color: 'yellow' },
      { name: 'Other', color: 'gray' },
    ]}},
    DueDate:         { date: {} },
    CalendarEventID: { rich_text: {} },
    SortOrder:       { number: { format: 'number' } },
    CompletedAt:     { date: {} },
  });
  console.log(`Tasks DB created: ${tasks.id}`);

  const progress = await createDB('College Dashboard - Progress', {
    EntryID:      { title: {} },
    UserID:       { rich_text: {} },
    MilestoneKey: { select: { options: [
      { name: 'profile_complete', color: 'blue' },
      { name: 'sat_prep_started', color: 'blue' },
      { name: 'sat_taken', color: 'green' },
      { name: 'applications_started', color: 'purple' },
      { name: 'recommendations_requested', color: 'yellow' },
      { name: 'essays_drafted', color: 'purple' },
      { name: 'applications_submitted', color: 'green' },
      { name: 'scholarships_applied', color: 'green' },
      { name: 'decisions_received', color: 'orange' },
      { name: 'committed', color: 'green' },
    ]}},
    ReachedAt: { date: {} },
    Notes:     { rich_text: {} },
  });
  console.log(`Progress DB created: ${progress.id}`);

  console.log('\nAdd these to your .env file:');
  console.log(`NOTION_PROFILES_DB_ID=${profiles.id}`);
  console.log(`NOTION_TASKS_DB_ID=${tasks.id}`);
  console.log(`NOTION_PROGRESS_DB_ID=${progress.id}`);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
