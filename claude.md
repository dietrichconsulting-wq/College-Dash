# College Dashboard - Project Constitution

## Architecture
- **Frontend**: React 18+ with Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Express on Node.js (ES modules), port 3001, binds to 0.0.0.0
- **Database**: Notion API (3 databases: Profiles, Tasks, Progress)
- **External APIs**: College Scorecard, Google Calendar, Anthropic AI

## Data Schema
- **Profiles**: UserID, DisplayName, GPA, SAT, ProposedMajor, School1-4 (name + Scorecard ID)
- **Tasks**: TaskID, UserID, Title, Description, Status (To Do/In Progress/Done), Category (7 types), DueDate, CalendarEventID, SortOrder, CompletedAt
- **Progress**: EntryID, UserID, MilestoneKey (10 milestones), ReachedAt, Notes

## Behavioral Rules
- Kanban and timeline update reactively on task changes
- Confetti + fight song play when task moves to Done
- 25 default tasks seeded on profile creation
- AI chat scoped to portfolio recommendations and scholarship brainstorming only
- Multi-user via UUID in localStorage, no auth (trusted local network)
- All API keys in .env, never committed

## File Conventions
- Server: ES modules (type: "module"), services in server/services/, routes in server/routes/
- Client: React components in client/src/components/, hooks in client/src/hooks/
- Tools: Standalone scripts in tools/ (run with node)
- Fight songs: MP3 files in client/public/audio/{school-slug}.mp3

## Key Commands
- `npm run dev` - Start both client (Vite) and server (nodemon) in development
- `npm run build` - Build client to server/public/
- `npm start` - Production server serving built frontend
- `npm run setup:notion` - Create Notion databases (one-time setup)
- `npm run validate` - Check .env variables
