# Stairway U — Project Constitution

## Product Goals
1. **Scale-ready SaaS** — Design every feature to work for thousands of concurrent users (caching, rate limiting, efficient queries). Never take shortcuts that only work for a single user.
2. **$9.99/month single tier, 7-day free trial** — One paid plan includes everything. Keep API costs near-zero per user (Gemini Flash only, aggressive caching, no expensive models). Every feature must justify its token cost.
3. **Never guess or fabricate data** — The app must NEVER invent dates, costs, tuition, admission rates, rankings, or any factual data. Use authoritative APIs (College Scorecard, IPEDS) or display "—" / "N/A". LLM outputs must be clearly labeled as AI-generated advice, not facts.
4. **Guide the user in every section** — Each tool/section must include a one-sentence explanation of what it does for the user. Examples:
   - Dashboard: "Change your GPA, SAT, ACT, major, and schools to check your chance of getting in."
   - Task List: "Track every step of your college application — check them off as you go."
   - Timeline: "See your progress toward key milestones on the road to acceptance."
   - AI Advisor: "Ask for personalized advice on your college list and scholarship strategy."
   - Scholarships: "Find, track, and manage scholarship applications in one place."
   - Comparison: "Compare your schools side by side on cost, acceptance rate, and fit."
   - Strategy: "Get an AI-powered game plan tailored to your profile and goals."

## Architecture
- **Frontend**: React 18+ with Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Express on Node.js (ES modules), port 3001, binds to 0.0.0.0
- **Database**: Supabase (Postgres) — 6 tables: profiles, tasks, progress, scholarships, parent_links, digest_log
- **External APIs**: College Scorecard, Google Calendar, Gemini 2.5 Flash

## Data Schema
- **Profiles**: UserID, DisplayName, GPA, SAT, ACT, ProposedMajor; schools stored in **user_schools** junction table (up to 12, ordered by sort_order)
- **Tasks**: TaskID, UserID, Title, Description, Status (To Do/In Progress/Done), Category (7 types), DueDate, CalendarEventID, SortOrder, CompletedAt
- **Progress**: EntryID, UserID, MilestoneKey (10 milestones), ReachedAt, Notes
- **Scholarships**: ScholarshipID, UserID, Name, Amount, Deadline, EssayRequired, Difficulty (Easy/Medium/Hard), Stage (Researching/Applying/Submitted/Won), URL, Notes

## Design Rules
- **Dark mode by default** — All UI should be designed in dark mode as the primary theme.

## Deployment
- **Repo**: https://github.com/dietrichconsulting-wq/stairwayu
- **Production**: stairwayu.com, deployed via Vercel watching `main`
- **Push**: `git push stairwayu main` (or `git deploy` alias) to update the live site

## Behavioral Rules
- Kanban and timeline update reactively on task changes
- Confetti + fight song play when task moves to Done
- 29 default tasks seeded on profile creation
- AI chat scoped to portfolio recommendations and scholarship brainstorming only
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
- `npm run setup:supabase` - Instructions for running the Supabase migration SQL
- `npm run validate` - Check .env variables
