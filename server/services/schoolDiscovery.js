/**
 * School Discovery Service
 *
 * For students with zero schools in mind. Given profile + preferences:
 *   1. Gemini generates 20 candidate school names across reach/target/safety
 *   2. Real data (College Scorecard + IPEDS + US News) enriches each candidate
 *   3. Budget filter applied using real net cost data (never AI-estimated)
 *   4. Tiers re-calibrated from real admission chances
 *   5. Returns up to 15 best-fit schools
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { batchCollegeProfiles } from './collegeDataAggregator.js';
import { calculateChanceFromData } from './admissionChance.js';
import { DiscoveryAISchema, safeParseAI } from './aiSchemas.js';
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
 * Discover schools that match a student's profile and preferences.
 * Returns an array of up to 15 enriched school objects.
 */
export async function discoverSchools({ gpa, sat, act, major, budget, climate, preferences = {} }) {
  const gemini = getModel();
  if (!gemini) throw new Error('Gemini API key not configured');

  const effective = getEffectiveSAT({ sat: sat ? Number(sat) : null, act: act ? Number(act) : null });
  const effectiveSAT = effective.score;

  const budgetNote = budget
    ? `Total all-in annual budget of $${Number(budget).toLocaleString()} (tuition + room & board + fees after financial aid).`
    : 'No specific budget constraint.';

  const climateNote = climate
    ? `Preferred campus climate/region: ${climate}. Prioritize schools in that environment.`
    : 'No climate preference.';

  const prefNotes = [];
  if (preferences.publicOnly) prefNotes.push('public universities strongly preferred');
  if (preferences.researchUniversity) prefNotes.push('major research university preferred (R1/R2)');
  if (preferences.liberalArts) prefNotes.push('liberal arts college preferred');
  if (preferences.largeCampus) prefNotes.push('large campus preferred (10,000+ students)');
  if (preferences.smallCampus) prefNotes.push('small campus preferred (under 5,000 students)');
  if (preferences.hbcu) prefNotes.push('HBCU preferred');

  const testScoreLine = act && !sat
    ? `- ACT: ${act} (SAT equivalent: ${effectiveSAT || 'N/A'})`
    : `- SAT: ${sat || 'Not provided'}${act ? `\n- ACT: ${act}` : ''}`;

  const prompt = `You are a college admissions counselor helping a student who has NO schools in mind yet. Recommend a diverse list of real US universities.

STUDENT PROFILE:
- GPA: ${gpa}
${testScoreLine}
- Intended Major: ${major}
- ${budgetNote}
- ${climateNote}
${prefNotes.length ? `- Preferences: ${prefNotes.join(', ')}` : ''}

Generate exactly 20 diverse US college recommendations:
- 5 REACH schools (highly selective, low admission chance but excellent ${major} programs)
- 9 TARGET schools (realistic for this student's GPA and test scores)
- 6 SAFETY schools (very likely admission)

For each school provide ONLY:
- name: full official school name (e.g. "University of Texas at Austin", not abbreviations)
- tier: "reach" | "target" | "safety"
- programStrength: 1-2 words rating the ${major} program (e.g. "Top 5", "Strong", "Solid", "Good", "Emerging")
- whyFit: one sentence ≤15 words on why this school fits this specific student

Prioritize strong ${major} programs. Include geographic diversity unless climate was specified. Only recommend real, accredited US universities.
DO NOT include any admission percentages or cost estimates — those come from authoritative data separately.

Respond ONLY with valid JSON, no markdown:
{"schools": [{"name": "...", "tier": "reach|target|safety", "programStrength": "...", "whyFit": "..."}]}`;

  const result = await gemini.generateContent(prompt);
  const rawText = result.response.text();
  const parseResult = safeParseAI(DiscoveryAISchema, rawText);
  if (!parseResult.success) {
    console.error('Discovery AI response invalid:', parseResult.error);
    return [];
  }

  const { schools: aiSchools } = parseResult.data;
  if (!aiSchools.length) return [];

  // ── Fetch real data for all candidates ──────────────────────────────────
  const schoolNames = aiSchools.map(s => s.name);
  const realProfiles = await batchCollegeProfiles(schoolNames);

  // ── Merge AI fields with real data ──────────────────────────────────────
  const enriched = aiSchools.map((ai, i) => {
    const real = realProfiles[i] || {};
    const netCost = real.netCostForResident ?? real.avgNetPrice ?? null;

    const yourChance = (real.admitRate != null && effectiveSAT)
      ? calculateChanceFromData(effectiveSAT, Number(gpa), real)
      : null;

    // Re-tier from real admission chance data when available
    let tier = ai.tier;
    if (yourChance != null) {
      if (yourChance < 30) tier = 'reach';
      else if (yourChance >= 60) tier = 'safety';
      else tier = 'target';
    }

    return {
      name: ai.name,
      city: real.city ?? null,
      state: real.state ?? null,
      tier,
      admitRate: real.admitRate ?? null,         // [REAL]
      yourChance,                                 // [CALCULATED from real data]
      avgSAT: real.avgSAT ?? null,               // [REAL]
      sat25: real.sat25 ?? null,                 // [REAL]
      sat75: real.sat75 ?? null,                 // [REAL]
      netCost,                                   // [REAL]
      tuitionOutOfState: real.tuitionOutOfState ?? null,
      tuitionInState: real.tuitionInState ?? null,
      gradRate: real.gradRate ?? null,           // [REAL]
      enrollment: real.enrollment ?? null,       // [REAL]
      medianEarnings10yr: real.medianEarnings10yr ?? null, // [REAL]
      usNewsRank: real.usNewsRank ?? null,       // [STATIC]
      usNewsRankDisplay: real.usNewsRankDisplay ?? null,
      control: real.control ?? null,
      locale: real.locale ?? null,
      isHBCU: real.isHBCU ?? false,
      programStrength: ai.programStrength ?? null,  // [AI]
      whyFit: ai.whyFit ?? null,                    // [AI]
      _dataSources: real._dataSources ?? { scorecard: false, ipeds: false, usNews: false },
    };
  });

  // ── Apply budget filter using real net cost ──────────────────────────────
  // Only exclude schools where we have real cost data AND it exceeds the budget
  let filtered = enriched;
  if (budget) {
    const budgetNum = Number(budget);
    filtered = enriched.filter(s => s.netCost == null || s.netCost <= budgetNum);
    // If filter is too aggressive, relax it (< 5 results → keep all)
    if (filtered.length < 5) filtered = enriched;
  }

  // ── Sort: reach → target → safety, within tier by yourChance desc ────────
  const tierOrder = { reach: 0, target: 1, safety: 2 };
  filtered.sort((a, b) => {
    const td = tierOrder[a.tier] - tierOrder[b.tier];
    if (td !== 0) return td;
    return (b.yourChance ?? 50) - (a.yourChance ?? 50);
  });

  return filtered.slice(0, 15);
}
