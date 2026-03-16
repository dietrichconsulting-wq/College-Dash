// @ts-nocheck
import { getCollege, lookupByName } from './collegeScorecard';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * Estimate admission probability using a logistic model based on:
 * 1. SAT score relative to school's 25th-75th percentile range
 * 2. GPA relative to a 4.0 scale (bonus for higher)
 * 3. School's overall admission rate as a baseline
 *
 * This is an ESTIMATE for guidance — not a guarantee.
 */

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Core probability calculation for a single school.
 * Returns 0-100 integer.
 */
function calculateChance(studentSAT, studentGPA, school) {
  const { admissionRate, avgSAT, sat25, sat75 } = school;

  // If no admission data at all, return null
  if (admissionRate == null) return null;

  const baseRate = admissionRate; // Already a percentage (0–100) from collegeScorecard

  // ── SAT Factor ──
  // Position student within 25th-75th range
  // Below 25th → penalty, above 75th → bonus
  let satFactor = 0;
  if (studentSAT && (sat25 || avgSAT)) {
    const low = sat25 || (avgSAT - 80);   // Estimate 25th if missing
    const high = sat75 || (avgSAT + 80);   // Estimate 75th if missing
    const mid = (low + high) / 2;
    const range = (high - low) || 1;

    // z-score style: how many half-ranges above/below midpoint
    const z = (studentSAT - mid) / (range / 2);

    // Map to factor: -30 to +25 percentage points
    satFactor = clamp(z * 18, -30, 25);
  }

  // ── GPA Factor ──
  // Above 3.7 = bonus, below 3.0 = penalty
  let gpaFactor = 0;
  if (studentGPA) {
    if (studentGPA >= 3.9) gpaFactor = 12;
    else if (studentGPA >= 3.7) gpaFactor = 8;
    else if (studentGPA >= 3.5) gpaFactor = 4;
    else if (studentGPA >= 3.2) gpaFactor = 0;
    else if (studentGPA >= 3.0) gpaFactor = -5;
    else if (studentGPA >= 2.7) gpaFactor = -12;
    else gpaFactor = -20;
  }

  // ── Selectivity adjustment ──
  // Very selective schools (<20% admission) have compressed ranges
  // Less selective schools (>60%) have wider ranges
  let selectivityScale = 1.0;
  if (baseRate < 10) selectivityScale = 0.5;        // Ivy-tier: small adjustments
  else if (baseRate < 20) selectivityScale = 0.65;   // Very selective
  else if (baseRate < 35) selectivityScale = 0.8;    // Selective
  else if (baseRate > 70) selectivityScale = 1.3;    // Less selective: wider swings

  const adjustedSAT = satFactor * selectivityScale;
  const adjustedGPA = gpaFactor * selectivityScale;

  // Round to nearest 5% to signal this is an estimate, not a precise prediction
  const raw = clamp(baseRate + adjustedSAT + adjustedGPA, 5, 95);
  return Math.round(raw / 5) * 5;
}

/**
 * Main entry: compute chances for all of a student's target schools.
 */
export async function computeChances(profile) {
  const schools = (profile.schools || []).filter(s => s?.name && s.name.trim() !== '');

  const results = await Promise.all(
    schools.map(async (s) => {
      try {
        let college;
        if (s.id && s.id.trim() !== '') {
          college = await getCollege(s.id);
        } else {
          // Use lookupByName which handles name expansions (e.g. "Texas" → "University of Texas at Austin")
          college = await lookupByName(s.name);
        }
        if (!college) return null;

        const chance = calculateChance(profile.sat, profile.gpa, college);
        if (chance == null) return null;

        return {
          schoolName: s.name,
          schoolId: college.id,
          chance,
          admissionRate: college.admissionRate,
          avgSAT: college.avgSAT,
          sat25: college.sat25,
          sat75: college.sat75,
        };
      } catch {
        return null;
      }
    })
  );

  const validResults = results.filter(Boolean);

  // If we have AI configured, enhance the chances with AI prediction and personalized tip
  const gemini = getModel();
  if (gemini && validResults.length > 0) {
    try {
      const prompt = `You are an expert college admissions counselor. Evaluate this student's realistic admission chances and provide detailed admissions intelligence for each school.

STUDENT PROFILE:
- GPA: ${profile.gpa || 'Not provided'}
- SAT: ${profile.sat || 'Not provided'}
- Intended Major: ${profile.proposedMajor || 'Not provided'}

TARGET SCHOOLS:
${validResults.map(r =>
        `ID: ${r.schoolId} | Name: ${r.schoolName} | Scorecard Avg SAT: ${r.avgSAT || 'N/A'}`
      ).join('\n')}

INSTRUCTIONS:
For each school, use your training knowledge (not numbers I provide) to return:
1. aiChance: realistic personal admission chance 0-100 for THIS student. Calibrate carefully — do not inflate. UT Austin (~29% overall) should not be 90%+ for anyone.
2. aiTip: 1-sentence personalized advice for this student's specific major at this school.
3. portfolioRequired: true if a portfolio/audition/creative supplement is typically required or strongly recommended for ${profile.proposedMajor || 'this major'} at this school, false otherwise.
4. topFactors: array of exactly 3 strings — the most important admission factors at this school in priority order (e.g. "GPA & class rank", "Essays", "Test scores", "Extracurriculars", "Portfolio", "Demonstrated interest", "Letters of recommendation", "Major-specific talent").
5. keyRequirements: array of 2-3 short strings listing notable application requirements or considerations specific to this school (e.g. "Holistic review", "No test score minimum", "Requires portfolio for design programs", "In-state applicants preferred", "Rolling admissions").
6. satSuperscore: true if this school superscores the SAT (takes highest section scores across test dates), false if they take the highest single sitting, null if test-optional with no clear policy.
7. testPolicy: one of "Required", "Test-Optional", "Test-Free", or "Recommended" — the school's current standardized test policy.
8. satNotes: array of 0-2 short strings with any notable SAT-specific policies (e.g. "CSS Profile required", "No score choice — must send all scores", "Score Choice accepted", "Self-reported scores accepted", "Requires SAT Essay"). Leave empty array if nothing notable.

Respond with ONLY a valid JSON array. No markdown, no explanation.
[
  {
    "schoolId": "string",
    "aiChance": integer 0-100,
    "aiTip": "string",
    "portfolioRequired": boolean,
    "topFactors": ["string", "string", "string"],
    "keyRequirements": ["string", "string"],
    "satSuperscore": boolean or null,
    "testPolicy": "Required" | "Test-Optional" | "Test-Free" | "Recommended",
    "satNotes": ["string"]
  }
]`;

      const aiResult = await gemini.generateContent(prompt);
      let text = aiResult.response.text().trim();
      if (text.startsWith('\`\`\`')) {
        text = text.replace(/^\`\`\`(?:json)?\s*/, '').replace(/\s*\`\`\`$/, '');
      }
      const parsed = JSON.parse(text);

      validResults.forEach(res => {
        const aiData = parsed.find(p => p.schoolId === res.schoolId);
        if (aiData) {
          // Never override data-driven chance with AI guess
          res.aiTip = aiData.aiTip;
          res.portfolioRequired = aiData.portfolioRequired ?? false;
          res.topFactors = aiData.topFactors ?? [];
          res.keyRequirements = aiData.keyRequirements ?? [];
          res.satSuperscore = aiData.satSuperscore ?? null;
          res.testPolicy = aiData.testPolicy ?? null;
          res.satNotes = aiData.satNotes ?? [];
        }
      });
    } catch (err) {
      console.error('Failed to augment admission chances with AI:', err);
    }
  }

  return validResults;
}
