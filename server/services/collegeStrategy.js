import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

let model = null;
function getModel() {
  if (!model && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

/**
 * Generate a tiered college strategy list.
 * Returns { reach: [], target: [], safety: [], rationale: string }
 */
export async function generateStrategy({ gpa, sat, major, budget, climate }) {
  const gemini = getModel();
  if (!gemini) throw new Error('Gemini API key not configured');

  const budgetNote = budget
    ? `Annual budget cap of $${Number(budget).toLocaleString()} (this represents the student's maximum annual out-of-pocket cost after typical financial aid and scholarships — factor in net price, not sticker price).`
    : 'No specific budget constraint.';

  const climateNote = climate
    ? `Preferred campus climate/region: ${climate}. Prioritize schools in that environment but do not exclude excellent options outside it.`
    : 'No climate preference specified.';

  const prompt = `You are a college admissions strategist helping a US high school student build a balanced college list.

STUDENT PROFILE:
- GPA: ${gpa}
- SAT: ${sat}
- Intended Major: ${major}
- ${budgetNote}
- ${climateNote}

Generate a tiered college list with exactly:
- 3 REACH schools (admission rate or selectivity makes acceptance <30% likely for this student, but the school is a great fit)
- 4 TARGET schools (student is within or near the typical admitted range; ~40-65% chance)
- 3 SAFETY schools (student is well above typical admitted profile; high confidence of admission)

For each school include:
- name: full official school name
- city: city
- state: 2-letter state code
- admitRate: school's overall admit rate as integer percentage
- yourChance: estimated admission probability for THIS student (0-100 integer)
- netCost: estimated annual net cost after aid for this student's budget profile (integer dollars)
- programStrength: 1-2 word descriptor of how strong the ${major} program is (e.g. "Top 10", "Strong", "Solid", "Emerging")
- whyFit: one concise sentence (≤15 words) on why this school fits the student

Also include a top-level "rationale" string: 2-3 sentences summarizing the overall strategy and why these tiers were chosen.

Respond ONLY with valid JSON. No markdown, no extra text.
Format:
{
  "rationale": "...",
  "reach": [...],
  "target": [...],
  "safety": [...]
}`;

  const result = await gemini.generateContent(prompt);
  let text = result.response.text().trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(text);
}
