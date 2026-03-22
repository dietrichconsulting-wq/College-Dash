/**
 * ACT → SAT Concordance Table
 * Source: Official College Board / ACT joint concordance (2018)
 *
 * Used to convert ACT composite scores to SAT equivalents so that
 * all admission-chance and strategy calculations can work with a
 * single numeric scale (SAT 400-1600).
 */

const ACT_TO_SAT = {
  36: 1590,
  35: 1540,
  34: 1500,
  33: 1460,
  32: 1430,
  31: 1400,
  30: 1370,
  29: 1340,
  28: 1310,
  27: 1280,
  26: 1240,
  25: 1210,
  24: 1180,
  23: 1140,
  22: 1110,
  21: 1080,
  20: 1040,
  19: 1010,
  18: 970,
  17: 930,
  16: 890,
  15: 850,
  14: 810,
  13: 760,
  12: 710,
  11: 670,
};

/**
 * Convert an ACT composite score (11-36) to its SAT equivalent.
 * Returns null for out-of-range values.
 */
export function actToSAT(actScore) {
  if (actScore == null) return null;
  const rounded = Math.round(Number(actScore));
  return ACT_TO_SAT[rounded] ?? null;
}

/**
 * Given a profile with optional `sat` and `act` fields, return the
 * best available SAT-scale score for calculations.
 *
 * Priority: real SAT > concorded ACT.
 * Also returns metadata about the source.
 */
export function getEffectiveSAT(profile) {
  const sat = profile?.sat ? Number(profile.sat) : null;
  const act = profile?.act ? Number(profile.act) : null;

  if (sat) return { score: sat, source: 'sat', originalACT: null };
  if (act) {
    const converted = actToSAT(act);
    return converted
      ? { score: converted, source: 'act', originalACT: act }
      : { score: null, source: null, originalACT: act };
  }
  return { score: null, source: null, originalACT: null };
}
