/**
 * College Comparison Service
 *
 * Hybrid approach:
 *   - Real data (College Scorecard + IPEDS + US News) for factual fields
 *   - Gemini AI fills only fields that can't come from APIs:
 *       yourChance, programRank, climate, climateEmoji
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { batchCollegeProfiles } from './collegeDataAggregator.js';

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

    const prompt = `You are a college admissions advisor. Below is REAL verified data for each school. Your ONLY job is to estimate each student's admission probability.

STUDENT PROFILE:
- GPA: ${gpa ?? 'Not provided'}
- SAT: ${sat ?? 'Not provided'}
- Intended Major: ${majorLabel}
- Home State: ${homeState || 'Not provided'}

REAL DATA (do NOT override these — only use them to inform yourChance):
${schoolSummaries}

For EACH school provide ONLY these fields:
- name: exactly as given above
- yourChance: ${hasProfile
    ? `this student's estimated admission probability (0-100 integer) based on their GPA ${gpa} and SAT ${sat} vs the school's real SAT range and admit rate above. Factor in ${majorLabel} competitiveness. Be realistic and honest.`
    : 'null (no student profile provided)'}

Respond ONLY with a valid JSON array. No markdown fences.
Example: [{"name":"University of Oregon","yourChance":62}]`;

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
      yourChance: ai.yourChance != null ? Math.round(ai.yourChance / 5) * 5 : null,
      // ── Metadata ──
      _dataSources: real._dataSources ?? { scorecard: false, ipeds: false, usNews: false },
    };
  });
}
