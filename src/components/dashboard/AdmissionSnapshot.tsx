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
  aiTip: string | null
  improvement: { improvedSAT: number; currentChance: number; improvedChance: number; delta: number } | null
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

export function AdmissionSnapshot({ profile, loading }: AdmissionSnapshotProps) {
  const [results, setResults] = useState<SchoolResult[]>([])
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState(false)

  const schools = profile
    ? [
        { name: profile.school1_name, id: profile.school1_id },
        { name: profile.school2_name, id: profile.school2_id },
        { name: profile.school3_name, id: profile.school3_id },
        { name: profile.school4_name, id: profile.school4_id },
      ].filter(s => s.name)
    : []

  useEffect(() => {
    if (!profile || loading || fetched || schools.length === 0) return
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
        setResults(data.results || [])
        setFetched(true)
      })
      .catch(() => setFetched(true))
      .finally(() => setFetching(false))
  }, [profile, loading]) // eslint-disable-line react-hooks/exhaustive-deps

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
            AI-powered estimates based on your GPA{profile?.sat ? ', SAT' : ''} & major
          </p>
        </div>
        <Link href="/strategy" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          Full strategy →
        </Link>
      </div>

      {fetching && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {schools.map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {!fetching && results.length === 0 && fetched && (
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '12px 0' }}>
          Couldn&apos;t load school data. Add your SAT score and try refreshing.{' '}
          <Link href="/profile" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Update profile →</Link>
        </div>
      )}

      {!fetching && results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {results.map((r, i) => {
            const { label, color } = chanceLabel(r.chance)
            const schoolAdmitRate = r.admissionRate != null ? `${Math.round(r.admissionRate * 100)}% admit rate` : null
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
                }}
              >
                {/* School name + label */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3, maxWidth: 130 }}>
                    {r.schoolName}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                    background: `${color}18`, color, border: `1px solid ${color}40`,
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                </div>

                {/* Chance bar */}
                <div style={{ marginBottom: 8 }}>
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

                {/* AI tip */}
                {r.aiTip && (
                  <div style={{
                    fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4,
                    borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4,
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Focus: </span>
                    {r.aiTip}
                  </div>
                )}

                {/* SAT improvement nudge */}
                {!r.aiTip && r.improvement && (
                  <div style={{
                    fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4,
                    borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4,
                  }}>
                    <span style={{ fontWeight: 700, color: '#d97706' }}>Boost: </span>
                    SAT {r.improvement.improvedSAT} → +{r.improvement.delta}% chance
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
