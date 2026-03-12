'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types/database'

interface ComparePageClientProps {
  profile: Profile | null
}

interface ComparedSchool {
  name: string
  city?: string
  state?: string
  admitRate?: number
  avgSAT?: number
  netCost?: number
  gradRate?: number
  medianEarnings10yr?: number
  usNewsRankDisplay?: string
  tuitionInState?: number
  tuitionOutOfState?: number
  yourChance?: number
  programRank?: string
  _dataSources?: { scorecard?: boolean }
}

export function ComparePageClient({ profile }: ComparePageClientProps) {
  const defaultSchools = [
    profile?.school1_name,
    profile?.school2_name,
    profile?.school3_name,
    profile?.school4_name,
  ].filter(Boolean) as string[]

  const [schools, setSchools] = useState<string[]>(defaultSchools.length >= 2 ? defaultSchools.slice(0, 4) : ['', ''])
  const [results, setResults] = useState<ComparedSchool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCompare() {
    const validSchools = schools.filter(s => s.trim())
    if (validSchools.length < 2) {
      setError('Enter at least 2 schools to compare.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/colleges/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schools: validSchools,
          gpa: profile?.gpa,
          sat: profile?.sat,
          major: profile?.proposed_major,
          homeState: profile?.home_state,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResults(data)
    } catch {
      setError('Comparison failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const METRICS: { key: keyof ComparedSchool; label: string; format: (v: unknown) => string }[] = [
    { key: 'admitRate', label: 'Admit Rate', format: v => v != null ? `${v}%` : '—' },
    { key: 'yourChance', label: 'Your Chance', format: v => v != null ? `${v}%` : '—' },
    { key: 'avgSAT', label: 'Avg SAT', format: v => v != null ? String(v) : '—' },
    { key: 'netCost', label: 'Net Cost/yr', format: v => v != null ? `$${((v as number) / 1000).toFixed(0)}k` : '—' },
    { key: 'tuitionInState', label: 'Tuition (in-state)', format: v => v != null ? `$${((v as number) / 1000).toFixed(0)}k` : '—' },
    { key: 'gradRate', label: 'Grad Rate', format: v => v != null ? `${v}%` : '—' },
    { key: 'medianEarnings10yr', label: 'Earnings 10yr', format: v => v != null ? `$${((v as number) / 1000).toFixed(0)}k` : '—' },
    { key: 'usNewsRankDisplay', label: 'US News Rank', format: v => (v as string) ?? '—' },
    { key: 'programRank', label: 'Program Strength', format: v => (v as string) ?? '—' },
  ]

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Compare Schools ⚖️</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 28 }}>
        Side-by-side comparison with real admissions data
      </p>

      <div className="card-elevated" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {schools.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={s}
                onChange={e => setSchools(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                placeholder={`School ${i + 1}`}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-column)', color: 'var(--color-text)', fontSize: 13, outline: 'none', width: 220 }}
              />
              {schools.length > 2 && (
                <button onClick={() => setSchools(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 16 }}>×</button>
              )}
            </div>
          ))}
          {schools.length < 5 && (
            <button onClick={() => setSchools(prev => [...prev, ''])} style={{ background: 'var(--color-column)', border: '1.5px dashed var(--color-border)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              + Add
            </button>
          )}
        </div>

        {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button onClick={handleCompare} disabled={loading} style={{ background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <><span className="strategy-spinner" /> Comparing…</> : '⚖️ Compare'}
        </button>
      </div>

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-elevated" style={{ padding: '24px 28px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metric</th>
                {results.map(r => (
                  <th key={r.name} style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700, color: 'var(--color-primary)', fontSize: 13, minWidth: 120 }}>
                    <div>{r.name.split(' ').pop()}</div>
                    {r._dataSources?.scorecard && <div style={{ fontSize: 9, fontWeight: 500, color: '#16a34a' }}>live data</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m, ri) => (
                <tr key={m.key} style={{ background: ri % 2 === 0 ? 'var(--color-column)' : 'transparent' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-text)', borderRadius: ri % 2 === 0 ? '8px 0 0 8px' : undefined }}>{m.label}</td>
                  {results.map(r => (
                    <td key={r.name} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                      {m.format(r[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
