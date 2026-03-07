import { google } from 'googleapis';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback';

// In-memory token store keyed by userId
const tokenStore = new Map();

export function isConfigured() {
  return !!(CLIENT_ID && CLIENT_SECRET);
}

export function createOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getAuthUrl(userId) {
  const oauth2 = createOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId,
  });
}

export async function handleCallback(code, userId) {
  const oauth2 = createOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  tokenStore.set(userId, tokens);
  return tokens;
}

export function hasTokens(userId) {
  return tokenStore.has(userId);
}

function getAuthenticatedClient(userId) {
  const tokens = tokenStore.get(userId);
  if (!tokens) throw new Error('User not authenticated with Google');
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials(tokens);
  return oauth2;
}

export async function createCalendarEvent(userId, { title, date, description }) {
  const auth = getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: title,
    description: description || '',
    start: { date },
    end: { date },
    reminders: { useDefault: true },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return res.data.id;
}

export async function deleteCalendarEvent(userId, eventId) {
  const auth = getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}
