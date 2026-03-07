# SOP-002: Notion Database Setup

## Integration Setup
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "College Dashboard"
4. Select your workspace
5. Copy the "Internal Integration Secret" -> this is your `NOTION_API_KEY`

## Database Creation
The `tools/setup-notion-dbs.js` script creates 3 databases automatically:

### Profiles Database
- UserID (title) - UUID generated on first visit
- DisplayName, GPA, SAT, ProposedMajor
- School1-4 with associated Scorecard IDs

### Tasks Database
- TaskID (title) - UUID per task
- Status: To Do | In Progress | Done
- Category: Testing | Application | Financial | Visit | Portfolio | Recommendation | Other
- DueDate, SortOrder for kanban ordering
- CalendarEventID for Google Calendar sync

### Progress Database
- MilestoneKey: 10 milestones from profile_complete through committed
- ReachedAt timestamp
- Auto-triggered by task completion patterns

## Sharing
After creating the databases, share the parent page with your integration (click "..." -> "Connections" -> add your integration).
