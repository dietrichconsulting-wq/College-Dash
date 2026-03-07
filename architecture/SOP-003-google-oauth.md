# SOP-003: Google Calendar OAuth Setup

## Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "Credentials" -> "Create Credentials" -> "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

## OAuth Flow
1. User clicks "Connect Google Calendar" in the dashboard
2. GET /api/auth/google?userId=xxx -> returns Google OAuth URL
3. User authorizes in Google's consent screen
4. Callback at /api/auth/google/callback stores tokens in memory
5. Tasks with due dates show "+ Add to Calendar" button
6. POST /api/calendar/sync creates an all-day event in Google Calendar

## Limitations
- Tokens stored in-memory (lost on server restart)
- For production, implement persistent token storage in Notion or a database
- OAuth consent screen must be configured for external users if sharing broadly
