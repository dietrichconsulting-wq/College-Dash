import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q || q.length < 2) return NextResponse.json([])

  try {
    const url = `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${process.env.COLLEGE_SCORECARD_API_KEY}&school.name=${encodeURIComponent(q)}&fields=id,school.name,school.city,school.state,latest.cost.attendance.academic_year,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state&per_page=10&_sort=school.name`
    const res = await fetch(url)
    const json = await res.json()
    const results = (json.results ?? []).map((r: Record<string, unknown>) => ({
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
