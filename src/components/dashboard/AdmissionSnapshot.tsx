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

function chanceLabel(pct: number): { label: string; color: string; softColor: string; bgColor: string; borderColor: string } {
  // Desaturated, softer palette for dark mode readability
  if (pct >= 65) return { label: 'Safety', color: '#34D399', softColor: '#6EE7B7', bgColor: 'rgba(52,211,153,0.10)', borderColor: 'rgba(52,211,153,0.22)' }
  if (pct >= 35) return { label: 'Target', color: '#FBBF24', softColor: '#FCD34D', bgColor: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.22)' }
  return { label: 'Reach', color: '#FB7185', softColor: '#FDA4AF', bgColor: 'rgba(251,113,133,0.10)', borderColor: 'rgba(251,113,133,0.22)' }
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
            const { label, color, softColor, bgColor, borderColor } = chanceLabel(r.chance)
            const schoolAdmitRate = r.admissionRate != null ? `${r.admissionRate}% overall admit rate` : null

            // Desaturated SAT policy colors for dark mode
            const testPolicyStyle = (() => {
              if (r.testPolicy === 'Required') return { bg: 'rgba(251,113,133,0.08)', color: '#FDA4AF', border: 'rgba(251,113,133,0.18)' }
              if (r.testPolicy === 'Test-Optional') return { bg: 'rgba(52,211,153,0.08)', color: '#6EE7B7', border: 'rgba(52,211,153,0.18)' }
              return { bg: 'rgba(251,191,36,0.08)', color: '#FCD34D', border: 'rgba(251,191,36,0.18)' }
            })()

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--color-card)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* School name + tier label */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3, maxWidth: 160 }}>
                    {r.schoolName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    {r.portfolioRequired && (
                      <span title="Portfolio required" style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                        background: 'rgba(167,139,250,0.10)', color: '#C4B5FD',
                        border: '1px solid rgba(167,139,250,0.20)', whiteSpace: 'nowrap',
                      }}>
                        📁 Portfolio
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                      background: bgColor, color: softColor, border: `1px solid ${borderColor}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </span>
                  </div>
                </div>

                {/* Chance bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', fontWeight: 600 }}>Your chance</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>{r.chance}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.chance}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', background: `${color}B3`, borderRadius: 99 }}
                    />
                  </div>
                  {schoolAdmitRate && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 4 }}>{schoolAdmitRate}</div>
                  )}
                </div>

                {/* Top factors */}
                {r.topFactors?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                      What they value most
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {r.topFactors.map((f, fi) => (
                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 900, color: fi === 0 ? softColor : 'rgba(255,255,255,0.35)',
                            minWidth: 14, textAlign: 'center',
                          }}>
                            {fi === 0 ? '①' : fi === 1 ? '②' : '③'}
                          </span>
                          <span style={{ fontSize: 11, color: fi === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.50)', fontWeight: fi === 0 ? 600 : 400 }}>
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
                        background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.50)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontWeight: 500,
                      }}>
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                {/* SAT policy */}
                {(r.testPolicy || r.satSuperscore != null || r.satNotes?.length > 0) && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      SAT Policy
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: r.satNotes?.length > 0 ? 6 : 0 }}>
                      {r.testPolicy && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: testPolicyStyle.bg, color: testPolicyStyle.color,
                          border: `1px solid ${testPolicyStyle.border}`,
                        }}>
                          {r.testPolicy}
                        </span>
                      )}
                      {r.satSuperscore === true && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(96,165,250,0.08)', color: '#93C5FD',
                          border: '1px solid rgba(96,165,250,0.18)',
                        }}>
                          ✓ Superscores
                        </span>
                      )}
                      {r.satSuperscore === false && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          Single sitting only
                        </span>
                      )}
                    </div>
                    {r.satNotes?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {r.satNotes.map((note, ni) => (
                          <div key={ni} style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', display: 'flex', gap: 4 }}>
                            <span style={{ color: '#93C5FD', flexShrink: 0 }}>·</span>
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
                    fontSize: 11, color: 'rgba(255,255,255,0.50)', lineHeight: 1.4,
                    borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8,
                  }}>
                    <span style={{ fontWeight: 700, color: '#93C5FD' }}>Focus: </span>
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
