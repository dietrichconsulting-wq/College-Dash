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
 * Fetch comparison data for a list of school names using Gemini AI.
 * Falls back to College Scorecard if API key is set.
 */
export async function compareColleges(schoolNames, { major, gpa, sat, homeState } = {}) {
  if (!schoolNames || schoolNames.length === 0) return [];

  const gemini = getModel();
  if (!gemini) {
    return schoolNames.map(name => ({ name }));
  }

  const majorLabel = major || 'Undecided';
  const hasProfile = gpa || sat;

  const prompt = `You are a college admissions data expert with knowledge of US universities.

STUDENT PROFILE:
- GPA: ${gpa ?? 'Not provided'}
- SAT: ${sat ?? 'Not provided'}
- Intended Major: ${majorLabel}
- Home State: ${homeState || 'Not provided'}

Universities to compare: ${schoolNames.join(', ')}

For EACH university provide these fields (use null if unknown):
- name: the university name exactly as given
- admitRate: the school's OVERALL admission rate as a percentage integer (e.g. 83) — this is the school's published rate, not personalized
- yourChance: ${hasProfile
    ? `this SPECIFIC student's estimated admission probability (0-100 integer) based on their GPA of ${gpa} and SAT of ${sat} compared to the school's typical admitted student profile for ${majorLabel}. Factor in major competitiveness. Be realistic.`
    : 'null (no profile data provided)'}
- avgSAT: average composite SAT of admitted students (integer), or null if test-optional
- netCost: ${homeState
    ? `estimated annual net cost after typical financial aid for a ${homeState} resident — if the school is in ${homeState} use in-state tuition as the base, otherwise use out-of-state tuition as the base (integer dollars)`
    : 'estimated annual net cost after typical financial aid, using out-of-state tuition as base (integer dollars)'}
- tuitionOutOfState: official out-of-state (non-resident) tuition in dollars (integer)
- enrollment: total undergraduate enrollment integer (e.g. 22000)
- city: city name string
- state: 2-letter US state code string
- climate: one word: Sunny, Mild, Rainy, Snowy, Hot, Humid, Dry, or Temperate
- climateEmoji: single weather emoji matching the climate
- programRank: ranking string for "${majorLabel}" programs (e.g. "#12", "Top 25", or null if unknown)
- gradRate: 4-year graduation rate as an integer percentage (e.g. 72)

Respond ONLY with a valid JSON array. No markdown fences, no extra text.
Example: {"name":"University of Oregon","admitRate":83,"yourChance":71,"avgSAT":1130,"netCost":27000,"tuitionOutOfState":38000,"enrollment":22000,"city":"Eugene","state":"OR","climate":"Rainy","climateEmoji":"🌧️","programRank":"#18","gradRate":72}`;

  try {
    const result = await gemini.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(text);
    // Ensure all requested schools are represented even if AI skipped one
    return schoolNames.map(name => {
      const found = parsed.find(p =>
        p.name?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name?.toLowerCase())
      );
      return found ? { ...found, name } : { name };
    });
  } catch (err) {
    console.error('College comparison AI error:', err);
    return schoolNames.map(name => ({ name }));
  }
}
