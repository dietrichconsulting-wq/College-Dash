import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;

// All fields we care about — pulled in one request per school
const RICH_FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.school_url',
  'school.type',           // 1=public, 2=private nonprofit, 3=private for-profit
  'school.locale',         // 11=city large ... 43=rural remote
  'school.region_id',
  // Admissions
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.average.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.midpoint.cumulative',
  // Cost
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.avg_net_price.public',
  'latest.cost.avg_net_price.private',
  // Net price by income (public schools)
  'latest.cost.net_price.public.by_income_level.0-30000',
  'latest.cost.net_price.public.by_income_level.30001-48000',
  'latest.cost.net_price.public.by_income_level.48001-75000',
  'latest.cost.net_price.public.by_income_level.75001-110000',
  'latest.cost.net_price.public.by_income_level.110001-plus',
  // Net price by income (private schools)
  'latest.cost.net_price.private.by_income_level.0-30000',
  'latest.cost.net_price.private.by_income_level.30001-48000',
  'latest.cost.net_price.private.by_income_level.48001-75000',
  'latest.cost.net_price.private.by_income_level.75001-110000',
  'latest.cost.net_price.private.by_income_level.110001-plus',
  // Students
  'latest.student.size',
  'latest.student.retention_rate.four_year.full_time',
  // Completion
  'latest.completion.rate_suppressed.4yr',
  // Outcomes
  'latest.earnings.10_yrs_after_entry.median',
  'latest.earnings.6_yrs_after_entry.median',
].join(',');

const SEARCH_FIELDS = [
  'id', 'school.name', 'school.city', 'school.state',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.average.overall',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.student.size',
].join(',');

function mapRichResult(r) {
  if (!r) return null;

  const isPublic = r['school.type'] === 1;

  // SAT composite 25th/75th
  const cr25 = r['latest.admissions.sat_scores.25th_percentile.critical_reading'];
  const cr75 = r['latest.admissions.sat_scores.75th_percentile.critical_reading'];
  const m25 = r['latest.admissions.sat_scores.25th_percentile.math'];
  const m75 = r['latest.admissions.sat_scores.75th_percentile.math'];

  // Net price by income bracket
  const prefix = isPublic ? 'public' : 'private';
  const np = (bracket) => r[`latest.cost.net_price.${prefix}.by_income_level.${bracket}`] || null;

  const avgNetPrice = isPublic
    ? r['latest.cost.avg_net_price.public']
    : r['latest.cost.avg_net_price.private'];

  const gradRate = r['latest.completion.rate_suppressed.4yr'];
  const retentionRate = r['latest.student.retention_rate.four_year.full_time'];

  return {
    id: String(r.id),
    name: r['school.name'],
    city: r['school.city'],
    state: r['school.state'],
    url: r['school.school_url'] || null,
    control: isPublic ? 'Public' : (r['school.type'] === 2 ? 'Private Nonprofit' : 'Private For-Profit'),
    isPublic,
    localeCode: r['school.locale'] || null,
    regionId: r['school.region_id'] || null,
    // Admissions
    admissionRate: r['latest.admissions.admission_rate.overall'] != null
      ? Math.round(r['latest.admissions.admission_rate.overall'] * 100)
      : null,
    avgSAT: r['latest.admissions.sat_scores.average.overall']
      ? Math.round(r['latest.admissions.sat_scores.average.overall'])
      : null,
    sat25: (cr25 && m25) ? cr25 + m25 : null,
    sat75: (cr75 && m75) ? cr75 + m75 : null,
    actMidpoint: r['latest.admissions.act_scores.midpoint.cumulative'] || null,
    // Cost
    tuitionInState: r['latest.cost.tuition.in_state'] || null,
    tuitionOutOfState: r['latest.cost.tuition.out_of_state'] || null,
    avgNetPrice: avgNetPrice || null,
    netPriceByIncome: {
      '0-30k':    np('0-30000'),
      '30-48k':   np('30001-48000'),
      '48-75k':   np('48001-75000'),
      '75-110k':  np('75001-110000'),
      '110k+':    np('110001-plus'),
    },
    // Students & outcomes
    enrollment: r['latest.student.size'] || null,
    retentionRate: retentionRate != null ? Math.round(retentionRate * 100) : null,
    gradRate4yr: gradRate != null ? Math.round(gradRate * 100) : null,
    medianEarnings6yr: r['latest.earnings.6_yrs_after_entry.median'] || null,
    medianEarnings10yr: r['latest.earnings.10_yrs_after_entry.median'] || null,
    _dataSource: 'scorecard',
  };
}

/** Search colleges by query string (lightweight) */
export async function searchColleges(query) {
  if (!API_KEY) return [];

  // Strip commas, hyphens, extra spaces — Scorecard does substring matching
  // but punctuation like "texas, austin" breaks it ("texas austin" works fine)
  const cleaned = query.replace(/[,\-]/g, ' ').replace(/\s+/g, ' ').trim();

  const params = new URLSearchParams({
    api_key: API_KEY,
    'school.name': cleaned,
    fields: SEARCH_FIELDS,
    per_page: '50',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  const mapped = (data.results || []).map(r => ({
    id: String(r.id),
    name: r['school.name'],
    city: r['school.city'],
    state: r['school.state'],
    admissionRate: r['latest.admissions.admission_rate.overall'] != null
      ? Math.round(r['latest.admissions.admission_rate.overall'] * 100) : null,
    avgSAT: r['latest.admissions.sat_scores.average.overall']
      ? Math.round(r['latest.admissions.sat_scores.average.overall']) : null,
    tuitionInState: r['latest.cost.tuition.in_state'] || null,
    tuitionOutOfState: r['latest.cost.tuition.out_of_state'] || null,
    _size: r['latest.student.size'] || 0,
  }));

  // Sort by relevance: prefer exact-start matches, then larger schools
  const q = cleaned.toLowerCase();
  mapped.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    // Schools whose name starts with the query come first
    const aStarts = aName.startsWith(q) || aName.startsWith('the ' + q) ? 1 : 0;
    const bStarts = bName.startsWith(q) || bName.startsWith('the ' + q) ? 1 : 0;
    if (bStarts !== aStarts) return bStarts - aStarts;
    // Then sort by enrollment (larger = more well-known)
    return b._size - a._size;
  });

  // Return top 10, drop internal _size field
  return mapped.slice(0, 10).map(({ _size, ...rest }) => rest);
}

/** Get full rich profile by Scorecard UNITID */
export async function getCollege(id) {
  if (!API_KEY) return null;

  const params = new URLSearchParams({
    api_key: API_KEY,
    id,
    fields: RICH_FIELDS,
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  return mapRichResult(data.results?.[0]);
}

/**
 * Look up a school by name — returns best match with full rich profile.
 * Returns null if not found or no API key.
 */
export async function lookupByName(schoolName) {
  if (!API_KEY || !schoolName) return null;

  const params = new URLSearchParams({
    api_key: API_KEY,
    'school.name': schoolName,
    fields: RICH_FIELDS,
    per_page: '5',
    'school.degrees_awarded.predominant__range': '3..4', // bachelor's and graduate
  });

  try {
    const res = await fetch(`${BASE_URL}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const results = data.results || [];
    if (!results.length) return null;

    // Pick best match: exact name match first, otherwise first result
    const q = schoolName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const exact = results.find(r => {
      const n = (r['school.name'] || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
      return n === q || n.includes(q) || q.includes(n);
    });

    return mapRichResult(exact || results[0]);
  } catch {
    return null;
  }
}

/**
 * Batch lookup for multiple school names in parallel.
 * Returns array in same order as input; null entries for not-found schools.
 */
export async function batchLookup(schoolNames) {
  if (!API_KEY || !schoolNames?.length) return schoolNames.map(() => null);
  const results = await Promise.all(schoolNames.map(name => lookupByName(name)));
  return results;
}
