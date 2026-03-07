# SOP-001: Project Setup

## Prerequisites
- Node.js 18+
- Notion account with an integration created at https://www.notion.so/my-integrations
- (Optional) Google Cloud project with Calendar API enabled
- (Optional) Anthropic API key
- (Optional) College Scorecard API key from https://api.data.gov/signup/

## Setup Steps

1. Clone/download the project
2. Copy `.env` and fill in your API keys
3. For Notion:
   - Create an integration at https://www.notion.so/my-integrations
   - Copy the integration token to `NOTION_API_KEY`
   - Create a blank Notion page and share it with your integration
   - Copy that page's ID to `NOTION_PARENT_PAGE_ID`
   - Run `npm run setup:notion` to create the 3 databases
   - Copy the output DB IDs into `.env`
4. Run `npm install` in root, `client/`, and `server/`
5. Run `npm run dev` to start development
6. Visit http://localhost:5173

## Production
1. Run `npm run build`
2. Run `npm start`
3. Access at http://<your-ip>:3001 from any device on your network
