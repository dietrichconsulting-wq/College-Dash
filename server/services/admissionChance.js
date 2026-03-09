import { getCollege } from './collegeScorecard.js';

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
  const schools = (profile.schools || []).filter(s => s?.id && s.id.trim() !== '');

  const results = await Promise.all(
    schools.map(async (s) => {
      try {
        const college = await getCollege(s.id);
        if (!college) return null;

        const chance = calculateChance(profile.sat, profile.gpa, college);
        if (chance == null) return null;

        const improvement = calculateImprovement(profile.sat, profile.gpa, college);

        return {
          schoolName: college.name,
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

  return results.filter(Boolean);
}
