'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types/database'
import Link from 'next/link'

interface SchoolResult {
  schoolName: string
  chance: number
  admissionRate: number | null
  avgSAT: number | null
  sat25: number | null
  sat75: number | null
  aiTip: string | null
  portfolioRequired: boolean
  topFactors: string[]
  keyRequirements: string[]
  satSuperscore: boolean | null
  testPolicy: string | null
  satNotes: string[]
}

interface AdmissionSnapshotProps {
  profile: Profile | null | undefined
  loading: boolean
}

function chanceLabel(pct: number): { label: string; color: string } {
  if (pct >= 65) return { label: 'Safety', color: '#059669' }
  if (pct >= 35) return { label: 'Target', color: '#d97706' }
  return { label: 'Reach', color: '#dc2626' }
}

const SNAPSHOT_KEY = 'admission_snapshot_v2'

export function AdmissionSnapshot({ profile, loading }: AdmissionSnapshotProps) {
  const schools = profile
    ? [
        { name: profile.school1_name, id: profile.school1_id },
        { name: profile.school2_name, id: profile.school2_id },
        { name: profile.school3_name, id: profile.school3_id },
        { name: profile.school4_name, id: profile.school4_id },
      ].filter(s => s.name)
    : []

  // Re-fetch whenever GPA, SAT, major, or schools change
  const fetchKey = profile
    ? `${profile.gpa}|${profile.sat}|${profile.proposed_major}|${schools.map(s => s.name).join(',')}`
    : null

  // Restore cached results from sessionStorage on mount
  const [results, setResults] = useState<SchoolResult[]>(() => {
    try {
      const saved = sessionStorage.getItem(SNAPSHOT_KEY)
      if (saved) {
        const { key, data } = JSON.parse(saved)
        // Only restore if profile hasn't changed since last fetch
        if (key && data) return data
      }
    } catch { /* ignore */ }
    return []
  })
  const [fetching, setFetching] = useState(false)
  const [lastFetchKey, setLastFetchKey] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem(SNAPSHOT_KEY)
      if (saved) {
        const { key } = JSON.parse(saved)
        return key ?? null
      }
    } catch { /* ignore */ }
    return null
  })

  useEffect(() => {
    if (!profile || loading || !fetchKey || fetchKey === lastFetchKey || schools.length === 0) return
    setFetching(true)
    fetch('/api/colleges/chances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gpa: profile.gpa,
        sat: profile.sat,
        proposed_major: profile.proposed_major,
        schools,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const freshResults = data.results || []
        setResults(freshResults)
        setLastFetchKey(fetchKey)
        try { sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ key: fetchKey, data: freshResults })) } catch { /* ignore */ }
      })
      .catch(() => setLastFetchKey(fetchKey))
      .finally(() => setFetching(false))
  }, [fetchKey, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || schools.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-elevated"
      style={{ padding: '20px 24px', marginTop: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Admission Snapshot</h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Estimates based on your GPA{profile?.sat ? ', SAT' : ''} & school admit rates
          </p>
        </div>
        <Link href="/strategy" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          Full strategy →
        </Link>
      </div>

      {fetching && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {schools.map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {!fetching && results.length === 0 && lastFetchKey !== null && (
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '12px 0' }}>
          Couldn&apos;t load school data. Add your SAT score and try refreshing.{' '}
          <Link href="/profile" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Update profile →</Link>
        </div>
      )}

      {!fetching && results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {results.map((r, i) => {
            const { label, color } = chanceLabel(r.chance)
            const schoolAdmitRate = r.admissionRate != null ? `${r.admissionRate}% overall admit rate` : null
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--color-column)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  border: '1.5px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* School name + tier label */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3, maxWidth: 160 }}>
                    {r.schoolName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    {r.portfolioRequired && (
                      <span title="Portfolio required" style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                        background: 'rgba(124,58,237,0.1)', color: '#7c3aed',
                        border: '1px solid rgba(124,58,237,0.25)', whiteSpace: 'nowrap',
                      }}>
                        📁 Portfolio
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                      background: `${color}18`, color, border: `1px solid ${color}40`,
                      whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* Chance bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Your chance</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{r.chance}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.chance}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', background: color, borderRadius: 99 }}
                    />
                  </div>
                  {schoolAdmitRate && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3 }}>{schoolAdmitRate}</div>
                  )}
                </div>

                {/* Top factors */}
                {r.topFactors?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                      What they value most
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {r.topFactors.map((f, fi) => (
                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 900, color: fi === 0 ? color : 'var(--color-text-muted)',
                            minWidth: 14, textAlign: 'center',
                          }}>
                            {fi === 0 ? '①' : fi === 1 ? '②' : '③'}
                          </span>
                          <span style={{ fontSize: 11, color: fi === 0 ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: fi === 0 ? 600 : 400 }}>
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key requirements */}
                {r.keyRequirements?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {r.keyRequirements.map((req, ri) => (
                      <span key={ri} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--color-border)', color: 'var(--color-text-muted)',
                        fontWeight: 500,
                      }}>
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                {/* SAT policy */}
                {(r.testPolicy || r.satSuperscore != null || r.satNotes?.length > 0) && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      SAT Policy
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: r.satNotes?.length > 0 ? 6 : 0 }}>
                      {r.testPolicy && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: r.testPolicy === 'Required' ? 'rgba(239,68,68,0.08)' : r.testPolicy === 'Test-Optional' ? 'rgba(5,150,105,0.08)' : 'rgba(245,158,11,0.08)',
                          color: r.testPolicy === 'Required' ? '#dc2626' : r.testPolicy === 'Test-Optional' ? '#059669' : '#d97706',
                          border: `1px solid ${r.testPolicy === 'Required' ? 'rgba(239,68,68,0.2)' : r.testPolicy === 'Test-Optional' ? 'rgba(5,150,105,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        }}>
                          {r.testPolicy}
                        </span>
                      )}
                      {r.satSuperscore === true && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(37,99,235,0.08)', color: '#2563eb',
                          border: '1px solid rgba(37,99,235,0.2)',
                        }}>
                          ✓ Superscores
                        </span>
                      )}
                      {r.satSuperscore === false && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'var(--color-border)', color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)',
                        }}>
                          Single sitting only
                        </span>
                      )}
                    </div>
                    {r.satNotes?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {r.satNotes.map((note, ni) => (
                          <div key={ni} style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', gap: 4 }}>
                            <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>·</span>
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AI tip */}
                {r.aiTip && (
                  <div style={{
                    fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4,
                    borderTop: '1px solid var(--color-border)', paddingTop: 8,
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Focus: </span>
                    {r.aiTip}
                  </div>
                )}

              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
