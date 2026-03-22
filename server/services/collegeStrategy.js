/**
 * College Strategy Generator
 *
 * Flow:
 *   1. Gemini AI recommends reach/target/safety schools based on student profile
 *   2. Real data (College Scorecard + IPEDS + US News) enriches each suggestion
 *   3. Merge: real admission rate, SAT, tuition, net cost override AI estimates
 *      AI fields kept: yourChance, programStrength, whyFit, rationale
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { batchCollegeProfiles } from './collegeDataAggregator.js';
import { calculateChanceFromData } from './admissionChance.js';
import { StrategyAISchema, safeParseAI } from './aiSchemas.js';
import { getEffectiveSAT } from './actConcordance.js';

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
export async function generateStrategy({ gpa, sat, act, major, budget, climate, schools }) {
  const gemini = getModel();
  if (!gemini) throw new Error('Gemini API key not configured');

  const effective = getEffectiveSAT({ sat: sat ? Number(sat) : null, act: act ? Number(act) : null });
  const effectiveSAT = effective.score;

  const budgetNote = budget
    ? `Annual budget cap of $${Number(budget).toLocaleString()} (maximum out-of-pocket after aid — factor in net price, not sticker price).`
    : 'No specific budget constraint.';

  const climateNote = climate
    ? `Preferred campus climate/region: ${climate}. Prioritize schools in that environment but include strong options elsewhere.`
    : 'No climate preference.';

  const testScoreLine = act && !sat
    ? `- ACT: ${act} (SAT equivalent: ${effectiveSAT || 'N/A'})`
    : `- SAT: ${sat || 'Not provided'}${act ? `\n- ACT: ${act}` : ''}`;

  // ── Step 1: Get school recommendations from Gemini ─────────────────────
  const userSchools = Array.isArray(schools) ? schools.filter(s => s && s.trim()) : [];
  const userSchoolsNote = userSchools.length
    ? `\nTHE STUDENT'S SCHOOLS (must ALL be included and classified into the correct tier):\n${userSchools.map(s => `- ${s}`).join('\n')}\n\nYou MUST include every school listed above. Classify each into reach, target, or safety based on the student's profile. Then add additional schools to fill out the list.`
    : '';

  const recommendPrompt = `You are a college admissions strategist. Generate a balanced college list for this US high school student.

STUDENT PROFILE:
- GPA: ${gpa}
${testScoreLine}
- Intended Major: ${major}
- ${budgetNote}
- ${climateNote}
${userSchoolsNote}

Return a balanced list with roughly:
- REACH schools (<30% admission chance for this student but great fit)
- TARGET schools (40-65% admission chance)
- SAFETY schools (high confidence admission)

${userSchools.length ? `Include all ${userSchools.length} of the student's schools above, plus enough additional recommendations to reach at least 10 total schools.` : 'Return exactly 3 reach, 4 target, and 3 safety schools.'}

For each school provide ONLY:
- name: full official school name
- tier: "reach" | "target" | "safety"
- programStrength: 1-2 words for the ${major} program (e.g. "Top 10", "Strong", "Solid", "Emerging")
- whyFit: one sentence ≤15 words explaining fit

DO NOT include admission percentages — those are calculated from real data separately.

Also include top-level "rationale": 2-3 sentences on the overall strategy.

Respond ONLY with valid JSON, no markdown:
{
  "rationale": "...",
  "schools": [{ "name": "...", "tier": "reach|target|safety", "programStrength": "...", "whyFit": "..." }]
}`;

  const result = await gemini.generateContent(recommendPrompt);
  const rawText = result.response.text();
  const parseResult = safeParseAI(StrategyAISchema, rawText);
  if (!parseResult.success) {
    console.error('Strategy AI response invalid:', parseResult.error);
    return { rationale: '', reach: [], target: [], safety: [] };
  }

  const { rationale, schools: aiSchools } = parseResult.data;

  if (!aiSchools.length) return { rationale, reach: [], target: [], safety: [] };

  // ── Step 2: Fetch real data for all recommended schools ─────────────────
  const schoolNames = aiSchools.map(s => s.name);
  const realProfiles = await batchCollegeProfiles(schoolNames);

  // ── Step 3: Merge AI recommendations with real data ─────────────────────
  const enriched = aiSchools.map((ai, i) => {
    const real = realProfiles[i] || {};

    // Net cost: use real data, adjusted for budget context
    // If no real data available, leave null (AI didn't provide it — better than hallucinating)
    const netCost = real.netCostForResident ?? real.avgNetPrice ?? null;

    return {
      name: ai.name,
      city: real.city ?? null,
      state: real.state ?? null,
      // ── Real admissions data (override AI) ──
      admitRate: real.admitRate ?? null,         // [REAL]
      yourChance: (real.admitRate != null)
        ? calculateChanceFromData(effectiveSAT, Number(gpa), real)
        : null,                                  // [CALCULATED from real data, never AI-guessed]
      avgSAT: real.avgSAT ?? null,               // [REAL]
      sat25: real.sat25 ?? null,                 // [REAL]
      sat75: real.sat75 ?? null,                 // [REAL]
      // ── Real cost data ──
      netCost,                                   // [REAL]
      tuitionOutOfState: real.tuitionOutOfState ?? null, // [REAL]
      tuitionInState: real.tuitionInState ?? null,       // [REAL]
      netPriceByIncome: real.netPriceByIncome ?? null,   // [REAL]
      // ── Real outcomes ──
      gradRate: real.gradRate ?? null,           // [REAL]
      enrollment: real.enrollment ?? null,       // [REAL]
      medianEarnings10yr: real.medianEarnings10yr ?? null, // [REAL]
      // ── Rankings ──
      usNewsRank: real.usNewsRank ?? null,       // [STATIC]
      usNewsRankDisplay: real.usNewsRankDisplay ?? null,
      // ── Institution info ──
      control: real.control ?? null,
      locale: real.locale ?? null,
      isHBCU: real.isHBCU ?? false,
      // ── AI-only fields ──
      programStrength: ai.programStrength ?? null,
      whyFit: ai.whyFit ?? null,
      // ── Metadata ──
      _dataSources: real._dataSources ?? { scorecard: false, ipeds: false, usNews: false },
    };
  });

  // Split back into tiers (preserve tier from AI)
  const byTier = (tier) => enriched.filter((_, i) => aiSchools[i]?.tier === tier);

  return {
    rationale,
    reach: byTier('reach'),
    target: byTier('target'),
    safety: byTier('safety'),
  };
}
