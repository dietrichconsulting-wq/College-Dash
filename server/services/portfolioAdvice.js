import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PortfolioTipSchema, safeParseAI } from './aiSchemas.js';

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
 * Generate school-specific portfolio tips for a design student.
 */
export async function getPortfolioTips({ major, schools, gpa, sat }) {
  const gemini = getModel();
  if (!gemini) return [];

  const schoolList = (schools || []).filter(Boolean).join(', ') || 'unknown schools';

  const prompt = `You are an expert college admissions advisor specializing in design programs.

STUDENT PROFILE:
- Intended Major: ${major}
- Target Schools: ${schoolList}
- GPA: ${gpa || 'Not provided'}
- SAT: ${sat || 'Not provided'}

TASK: For each of the student's target schools, provide specific, actionable portfolio advice for their ${major} application. Be concrete about what each school's program values.

Respond ONLY with a JSON array. No markdown. Each object:
{
  "school": "school name",
  "tip": "2-3 sentence specific portfolio tip for this school's program",
  "emphasis": "one key differentiator this school cares about most (5-8 words)",
  "portfolioSize": "recommended page/project count (e.g. '15-20 pages')"
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const rawText = result.response.text();
    const parseResult = safeParseAI(PortfolioTipSchema, rawText);
    if (!parseResult.success) {
      console.error('Portfolio advice AI response invalid:', parseResult.error);
      return [];
    }
    return parseResult.data;
  } catch (err) {
    console.error('Portfolio advice AI error:', err);
    return [];
  }
}
