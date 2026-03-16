import { NextResponse } from 'next/server'

const FIELDS = 'id,school.name,school.city,school.state,latest.cost.attendance.academic_year,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.student.size'

interface ScorecardResult {
  id: number
  'school.name': string
  'school.city': string
  'school.state': string
  'latest.cost.attendance.academic_year'?: number | null
  'latest.cost.tuition.in_state'?: number | null
  'latest.cost.tuition.out_of_state'?: number | null
  'latest.student.size'?: number | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q || q.length < 2) return NextResponse.json([])

  const key = process.env.COLLEGE_SCORECARD_API_KEY
  const base = 'https://api.data.gov/ed/collegescorecard/v1/schools'

  try {
    // Run two queries in parallel: exact-name prefix match + full-text search
    // This ensures "texas" finds both "Texas Tech" (prefix) and "University of Texas at San Antonio" (full-text)
    const [nameRes, searchRes] = await Promise.all([
      fetch(`${base}?api_key=${key}&school.name=${encodeURIComponent(q)}&fields=${FIELDS}&per_page=15`),
      fetch(`${base}?api_key=${key}&school.search=${encodeURIComponent(q)}&fields=${FIELDS}&per_page=15`),
    ])

    const [nameJson, searchJson] = await Promise.all([nameRes.json(), searchRes.json()])
    const raw: ScorecardResult[] = [...(nameJson.results ?? []), ...(searchJson.results ?? [])]

    // Deduplicate by id
    const seen = new Set<number>()
    const deduped: ScorecardResult[] = []
    for (const r of raw) {
      if (!seen.has(r.id)) {
        seen.add(r.id)
        deduped.push(r)
      }
    }

    const qLower = q.toLowerCase()
    const results = deduped
      // Filter out tiny/vocational schools when query is broad (single word)
      .filter(r => {
        const size = r['latest.student.size']
        // Keep all schools if query has multiple words (more specific)
        if (q.includes(' ')) return true
        // For single-word queries, prefer schools with 1000+ students to cut noise
        return size == null || size >= 1000
      })
      // Sort: name starts with query first, then larger schools first
      .sort((a, b) => {
        const aName = (a['school.name'] as string).toLowerCase()
        const bName = (b['school.name'] as string).toLowerCase()
        const aStarts = aName.startsWith(qLower) ? 0 : 1
        const bStarts = bName.startsWith(qLower) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        // Larger schools first
        const aSize = a['latest.student.size'] ?? 0
        const bSize = b['latest.student.size'] ?? 0
        return bSize - aSize
      })
      .slice(0, 15)
      .map(r => ({
        id: r.id,
        name: r['school.name'],
        city: r['school.city'],
        state: r['school.state'],
        costAttendance: r['latest.cost.attendance.academic_year'] ?? null,
        tuitionInState: r['latest.cost.tuition.in_state'] ?? null,
        tuitionOutOfState: r['latest.cost.tuition.out_of_state'] ?? null,
      }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
