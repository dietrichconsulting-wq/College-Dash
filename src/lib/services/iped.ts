// @ts-nocheck
/**
 * Urban Institute Education Data Portal — IPEDS wrapper.
 * Free API, no key required.
 * Docs: https://educationdata.urban.org/documentation/
 */

const BASE = 'https://educationdata.urban.org/api/v1/college-university/ipeds';
const LATEST_YEAR = 2022; // Most complete year in the API

const LOCALE_LABELS = {
  11: 'City (Large)',    12: 'City (Midsize)',    13: 'City (Small)',
  21: 'Suburb (Large)',  22: 'Suburb (Midsize)',  23: 'Suburb (Small)',
  31: 'Town (Fringe)',   32: 'Town (Distant)',    33: 'Town (Remote)',
  41: 'Rural (Fringe)',  42: 'Rural (Distant)',   43: 'Rural (Remote)',
};

const CARNEGIE_LABELS = {
  15: 'R1 Doctoral (Very High)',
  16: 'R2 Doctoral (High)',
  17: 'R3 Doctoral',
  18: 'Masters (Large)',
  19: 'Masters (Medium)',
  20: 'Masters (Small)',
  21: 'Baccalaureate (Arts & Sciences)',
  22: 'Baccalaureate (Diverse Fields)',
  23: 'Baccalaureate/Associates',
};

const CONTROL_LABELS = {
  1: 'Public',
  2: 'Private Nonprofit',
  3: 'Private For-Profit',
};

/**
 * Fetch IPEDS directory data for a specific school by UNITID.
 * Returns null if not found or API unavailable.
 */
export async function getIpedsData(unitId) {
  if (!unitId) return null;
  try {
    const url = `${BASE}/directory/${LATEST_YEAR}/?unitid=${unitId}&fields=unitid,inst_name,state_abbr,urban_centric_locale,control_of_institution,carnegie_class_2021,hbcu,tribal_college,degree_granting,latitude,longitude`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) return null;

    return {
      locale: LOCALE_LABELS[r.urban_centric_locale] || null,
      localeCode: r.urban_centric_locale,
      control: CONTROL_LABELS[r.control_of_institution] || null,
      controlCode: r.control_of_institution,
      carnegieClass: CARNEGIE_LABELS[r.carnegie_class_2021] || null,
      isHBCU: r.hbcu === 1,
      isTribal: r.tribal_college === 1,
      latitude: r.latitude || null,
      longitude: r.longitude || null,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch graduation rate from IPEDS for a specific UNITID.
 */
export async function getIpedsGradRate(unitId) {
  if (!unitId) return null;
  try {
    // 150% graduation rate cohort (federal definition), all students
    const url = `${BASE}/graduation-rates/${LATEST_YEAR}/?unitid=${unitId}&race=99&sex=99&cohort_year=4`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.results?.[0];
    if (!r || r.grad_rate_150 == null) return null;
    return Math.round(r.grad_rate_150 * 100);
  } catch {
    return null;
  }
}
