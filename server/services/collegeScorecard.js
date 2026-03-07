import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;

export async function searchColleges(query) {
  if (!API_KEY) return [];

  const params = new URLSearchParams({
    'api_key': API_KEY,
    'school.name': query,
    'fields': 'id,school.name,school.city,school.state,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state',
    'per_page': '10',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || []).map(r => ({
    id: String(r.id),
    name: r['school.name'],
    city: r['school.city'],
    state: r['school.state'],
    admissionRate: r['latest.admissions.admission_rate.overall'],
    avgSAT: r['latest.admissions.sat_scores.average.overall'],
    tuitionInState: r['latest.cost.tuition.in_state'],
    tuitionOutOfState: r['latest.cost.tuition.out_of_state'],
  }));
}

export async function getCollege(id) {
  if (!API_KEY) return null;

  const params = new URLSearchParams({
    'api_key': API_KEY,
    'id': id,
    'fields': 'id,school.name,school.city,school.state,school.school_url,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.admissions.sat_scores.25th_percentile.critical_reading,latest.admissions.sat_scores.75th_percentile.critical_reading,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.student.size',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const r = data.results?.[0];
  if (!r) return null;

  return {
    id: String(r.id),
    name: r['school.name'],
    city: r['school.city'],
    state: r['school.state'],
    url: r['school.school_url'],
    admissionRate: r['latest.admissions.admission_rate.overall'],
    avgSAT: r['latest.admissions.sat_scores.average.overall'],
    tuitionInState: r['latest.cost.tuition.in_state'],
    tuitionOutOfState: r['latest.cost.tuition.out_of_state'],
    studentSize: r['latest.student.size'],
  };
}
