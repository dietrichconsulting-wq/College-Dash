// @ts-nocheck
/**
 * College Comparison Service
 *
 * Hybrid approach:
 *   - Real data (College Scorecard + IPEDS + US News) for factual fields
 *   - Gemini AI fills only fields that can't come from APIs:
 *       yourChance, programRank, climate, climateEmoji
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { batchCollegeProfiles } from './collegeDataAggregator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let model: any = null;
function getModel() {
  if (!model && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

/**
 * Fetch comparison data combining real API data with AI-generated personalization.
 */
export async function compareColleges(schoolNames, { major, gpa, sat, homeState } = {}) {
  if (!schoolNames || schoolNames.length === 0) return [];

  const majorLabel = major || 'Undecided';
  const hasProfile = gpa || sat;

  // ── Step 1: Fetch real data for all schools in parallel ──────────────────
  const realData = await batchCollegeProfiles(schoolNames, homeState);

  // ── Step 2: Use Gemini only for AI-only fields ───────────────────────────
  const gemini = getModel();
  let aiData = {};

  if (gemini) {
    // Build a compact summary of real data to give Gemini context
    const schoolSummaries = schoolNames.map((name, i) => {
      const r = realData[i];
      const parts = [`${name}:`];
      if (r?.admitRate != null) parts.push(`admit_rate=${r.admitRate}%`);
      if (r?.avgSAT != null) parts.push(`avg_SAT=${r.avgSAT}`);
      if (r?.sat25 != null && r?.sat75 != null) parts.push(`SAT_range=${r.sat25}-${r.sat75}`);
      if (r?.state) parts.push(`state=${r.state}`);
      return parts.join(' ');
    }).join('\n');

    const prompt = `You are a college admissions advisor. Below is REAL verified data for each school. Your ONLY job is to fill in the 3 missing fields: yourChance, programRank, and climate.

STUDENT PROFILE:
- GPA: ${gpa ?? 'Not provided'}
- SAT: ${sat ?? 'Not provided'}
- Intended Major: ${majorLabel}
- Home State: ${homeState || 'Not provided'}

SCORECARD DATA (use only as a hint — name matching can occasionally return wrong campuses):
${schoolSummaries}

IMPORTANT: If any school's Scorecard admit rate looks wrong for that institution (e.g., University of Texas at Austin should be ~29%, not 89%), ignore that Scorecard value and use your own training knowledge instead. Always sanity-check against what you know about each school's selectivity.

For EACH school provide ONLY these 3 fields:
- name: exactly as given above
- yourChance: ${hasProfile
    ? `this student's realistic admission probability (0-100 integer) for GPA ${gpa} and SAT ${sat}. Use your own knowledge of each school's true selectivity — do NOT trust Scorecard admit rates that seem anomalously high for selective flagships. Be accurate and calibrated.`
    : 'null (no student profile provided)'}
- programRank: ranking string for "${majorLabel}" programs at this school (e.g. "#5", "Top 15", "Regionally Strong", or null if truly unknown)
- climate: one word describing campus weather: Sunny, Mild, Rainy, Snowy, Hot, Humid, Dry, or Temperate
- climateEmoji: single emoji matching the climate

Respond ONLY with a valid JSON array. No markdown fences.
Example: [{"name":"University of Oregon","yourChance":62,"programRank":"Top 20","climate":"Rainy","climateEmoji":"🌧️"}]`;

    try {
      const result = await gemini.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(text);
      // Index by name for fast lookup
      for (const item of parsed) {
        if (item.name) aiData[item.name.toLowerCase()] = item;
      }
    } catch (err) {
      console.error('College comparison AI error:', err.message);
    }
  }

  // ── Step 3: Merge real + AI data ─────────────────────────────────────────
  return schoolNames.map((name, i) => {
    const real = realData[i] || {};

    // Find AI entry (fuzzy key match)
    const aiKey = Object.keys(aiData).find(k =>
      k.includes(name.toLowerCase()) || name.toLowerCase().includes(k)
    );
    const ai = aiKey ? aiData[aiKey] : {};

    // Use real net cost if available, fall back to AI
    const netCost = real.netCostForResident ?? real.avgNetPrice ?? null;

    return {
      name,
      // ── Real data (authoritative) ──
      admitRate: real.admitRate ?? null,
      avgSAT: real.avgSAT ?? null,
      sat25: real.sat25 ?? null,
      sat75: real.sat75 ?? null,
      tuitionOutOfState: real.tuitionOutOfState ?? null,
      tuitionInState: real.tuitionInState ?? null,
      netCost,
      netPriceByIncome: real.netPriceByIncome ?? null,
      enrollment: real.enrollment ?? null,
      gradRate: real.gradRate ?? null,
      retentionRate: real.retentionRate ?? null,
      medianEarnings10yr: real.medianEarnings10yr ?? null,
      city: real.city ?? null,
      state: real.state ?? null,
      url: real.url ?? null,
      control: real.control ?? null,
      locale: real.locale ?? null,
      carnegieClass: real.carnegieClass ?? null,
      isHBCU: real.isHBCU ?? false,
      usNewsRank: real.usNewsRank ?? null,
      usNewsRankDisplay: real.usNewsRankDisplay ?? null,
      // ── AI-only fields ──
      yourChance: ai.yourChance ?? null,
      programRank: ai.programRank ?? null,
      climate: ai.climate ?? null,
      climateEmoji: ai.climateEmoji ?? null,
      // ── Metadata ──
      _dataSources: real._dataSources ?? { scorecard: false, ipeds: false, usNews: false },
    };
  });
}
