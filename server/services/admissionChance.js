import { getCollege, searchColleges } from './collegeScorecard.js';
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

  const baseRate = admissionRate * 100; // Convert 0.xx to percentage

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

  const chance = clamp(Math.round(baseRate + adjustedSAT + adjustedGPA), 3, 97);
  return chance;
}

/**
 * Calculate what a student's chance would be with an improved SAT score.
 */
function calculateImprovement(currentSAT, studentGPA, school) {
  if (!currentSAT) return null;

  const current = calculateChance(currentSAT, studentGPA, school);
  if (current == null) return null;

  // Try +50, +100 point improvements
  const bumps = [50, 100];
  for (const bump of bumps) {
    const improvedSAT = Math.min(currentSAT + bump, 1600);
    if (improvedSAT === currentSAT) continue;

    const improved = calculateChance(improvedSAT, studentGPA, school);
    if (improved != null && improved > current + 3) {
      return {
        improvedSAT,
        currentChance: current,
        improvedChance: improved,
        delta: improved - current,
      };
    }
  }

  return null;
}

/**
 * Main entry: compute chances for all of a student's target schools.
 */
export async function computeChances(profile) {
  const schools = (profile.schools || []).filter(s => s?.name && s.name.trim() !== '');

  const results = await Promise.all(
    schools.map(async (s) => {
      try {
        let collegeId = s.id;
        if (!collegeId || collegeId.trim() === '') {
          // Try name as-is, then with "University of" prefix
          const queries = [s.name, `University of ${s.name}`];
          let resolved = null;
          for (const q of queries) {
            const results = await searchColleges(q);
            if (results && results.length > 0) {
              // Prefer a result that has admission rate data
              resolved = results.find(r => r.admissionRate != null) || results[0];
              break;
            }
          }
          if (!resolved) return null;
          collegeId = resolved.id;
        }

        const college = await getCollege(collegeId);
        if (!college) return null;

        const chance = calculateChance(profile.sat, profile.gpa, college);
        if (chance == null) return null;

        const improvement = calculateImprovement(profile.sat, profile.gpa, college);

        return {
          schoolName: s.name,
          schoolId: college.id,
          chance,
          admissionRate: college.admissionRate,
          avgSAT: college.avgSAT,
          sat25: college.sat25,
          sat75: college.sat75,
          improvement,
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
      const prompt = `You are an expert college admissions AI. Evaluate this student's chances of admission to their target schools.
STUDENT PROFILE:
- GPA: ${profile.gpa || 'Not provided'}
- SAT: ${profile.sat || 'Not provided'}
- Intended Major: ${profile.proposedMajor || 'Not provided'}

TARGET SCHOOLS (with baseline mathematical heuristic):
${validResults.map(r =>
        `ID: ${r.schoolId} | Name: ${r.schoolName} | Admission Rate: ${Math.round(r.admissionRate * 100)}% | Avg SAT: ${r.avgSAT || 'N/A'} | Baseline Heuristic Chance: ${r.chance}%`
      ).join('\n')}

INSTRUCTIONS:
Refine the baseline heuristic chance into an AI-predicted percentage (0-100) based on the student's major competitiveness and profile. Also, provide a short 1-sentence personalized tip on how to improve their application for that SPECIFIC school and major.

Respond with ONLY a JSON array of objects. No markdown formatting.
[
  {
    "schoolId": "string",
    "aiChance": int (0-100),
    "aiTip": "string"
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
          res.chance = aiData.aiChance; // Replace heuristic with AI chance
          res.aiTip = aiData.aiTip;
        }
      });
    } catch (err) {
      console.error('Failed to augment admission chances with AI:', err);
    }
  }

  return validResults;
}
