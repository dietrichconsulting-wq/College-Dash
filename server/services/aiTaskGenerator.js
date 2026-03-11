import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

let model = null;

function getModel() {
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

function buildPrompt(profile, existingTasks) {
  const today = new Date().toISOString().split('T')[0];
  const schoolList = profile.schools
    ?.filter(s => s.name)
    .map(s => s.name)
    .join(', ') || 'Not specified';

  const existingTitles = existingTasks
    .filter(t => t.status !== 'Done')
    .map(t => `- ${t.title}`)
    .join('\n');

  return `You are a college admissions strategist. Based on this student's profile, generate a personalized 90-day action plan with 10-15 specific, actionable tasks.

STUDENT PROFILE:
- GPA: ${profile.gpa || 'Not provided'}
- SAT Score: ${profile.sat || 'Not provided'}
- Intended Major: ${profile.proposedMajor || 'Not provided'}
- Target Schools: ${schoolList}
- Today's Date: ${today}

EXISTING TASKS (do NOT duplicate these):
${existingTitles || '(none)'}

RULES:
1. Tasks must be SPECIFIC and PERSONALIZED — reference actual school names, real scholarship programs relevant to their major/stats, and concrete actions.
2. Spread due dates across the next 90 days from today (${today}).
3. Each task needs a category from EXACTLY these options: Testing, Application, Financial, Visit, Portfolio, Recommendation, Other
4. If SAT is below 1400, include SAT retake prep. If above 1400, skip SAT tasks.
5. Tailor scholarship suggestions to their GPA/SAT range and major.
6. Include school-specific tasks (visit, info session, essay) for their target schools.
7. Be encouraging in descriptions — this is a high schooler.
8. Do NOT duplicate any existing tasks listed above.

Respond with ONLY a JSON array. No markdown, no explanation. Each object must have exactly these fields:
{
  "title": "string — concise task title (max 60 chars)",
  "description": "string — 1-2 sentence helpful description",
  "category": "Testing | Application | Financial | Visit | Portfolio | Recommendation | Other",
  "dueDate": "YYYY-MM-DD"
}`;
}

export async function generateRoadmap(profile, existingTasks = []) {
  const gemini = getModel();

  const result = await gemini.generateContent(buildPrompt(profile, existingTasks));
  const text = result.response.text().trim();

  // Parse JSON — handle possible markdown code fences
  let jsonStr = text;
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const tasks = JSON.parse(jsonStr);

  // Validate structure
  const validCategories = new Set(['Testing', 'Application', 'Financial', 'Visit', 'Portfolio', 'Recommendation', 'Other']);

  return tasks
    .filter(t => t.title && t.category && validCategories.has(t.category))
    .map(t => ({
      title: t.title.slice(0, 80),
      description: t.description || '',
      category: t.category,
      dueDate: t.dueDate || null,
    }));
}
