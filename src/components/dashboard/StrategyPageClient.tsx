'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CLIMATE_OPTIONS = [
  '', 'Mountains', 'Beach / Coastal', 'Sunny / Southwest',
  'Midwest', 'Pacific Northwest', 'Northeast', 'Southeast', 'No Preference',
]

const TIER_CONFIG = {
  reach:  { label: 'Reach',  emoji: '🚀', color: '#EF4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)'  },
  target: { label: 'Target', emoji: '🎯', color: '#F59E0B', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)' },
  safety: { label: 'Safety', emoji: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)'  },
} as const

type Tier = keyof typeof TIER_CONFIG

interface School {
  name: string
  city: string | null
  state: string | null
  admitRate: number | null
  yourChance: number | null
  sat25: number | null
  sat75: number | null
  netCost: number | null
  gradRate: number | null
  medianEarnings10yr: number | null
  usNewsRankDisplay: string | null
  programStrength: string | null
  whyFit: string | null
  _dataSources?: { scorecard?: boolean }
}

interface StrategyResult {
  rationale: string
  reach: School[]
  target: School[]
  safety: School[]
}

interface StrategyPageClientProps {
  profile: { gpa: number | null; sat: number | null; proposed_major: string | null } | null
}

export function StrategyPageClient({ profile }: StrategyPageClientProps) {
  const [form, setForm] = useState({
    gpa: profile?.gpa?.toString() ?? '',
    sat: profile?.sat?.toString() ?? '',
    major: profile?.proposed_major ?? '',
    budget: '',
    climate: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StrategyResult | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!form.gpa || !form.sat || !form.major) {
      setError('GPA, SAT, and major are required.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/strategy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Failed to generate strategy. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>College Strategy ⚡</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 28 }}>
        AI-powered reach / target / safety list backed by real admissions data
      </p>

      <div className="card-elevated" style={{ padding: '28px 28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
          <Field label="GPA" type="number" step="0.01" min="0" max="4.0" placeholder="3.9" value={form.gpa} onChange={v => setForm(f => ({ ...f, gpa: v }))} />
          <Field label="SAT Score" type="number" min="400" max="1600" placeholder="1400" value={form.sat} onChange={v => setForm(f => ({ ...f, sat: v }))} />
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Intended Major" placeholder="Environmental Design" value={form.major} onChange={v => setForm(f => ({ ...f, major: v }))} />
          </div>
          <Field label="Annual Budget ($)" type="number" min="0" placeholder="30000" value={form.budget} onChange={v => setForm(f => ({ ...f, budget: v }))} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Climate <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <select value={form.climate} onChange={e => setForm(f => ({ ...f, climate: e.target.value }))} style={inputStyle}>
              {CLIMATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || 'Any climate'}</option>)}
            </select>
          </div>
        </div>

        {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button onClick={handleGenerate} disabled={loading} style={{ background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <><span className="strategy-spinner" /> Generating…</> : <>✨ Generate Strategy</>}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 32 }}>
              {result.rationale && (
                <div style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)', borderRadius: 10, padding: '12px 16px', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                  <strong style={{ color: 'var(--color-primary)' }}>Strategy: </strong>{result.rationale}
                </div>
              )}
              {(['reach', 'target', 'safety'] as Tier[]).map(tier => (
                <TierSection key={tier} tier={tier} schools={result[tier]} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TierSection({ tier, schools }: { tier: Tier; schools: School[] }) {
  const cfg = TIER_CONFIG[tier]
  if (!schools?.length) return null
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: cfg.color, margin: 0 }}>{cfg.label}</h3>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{schools.length} schools</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {schools.map((school, i) => (
          <SchoolCard key={school.name} school={school} tier={tier} index={i} />
        ))}
      </div>
    </div>
  )
}

function SchoolCard({ school, tier, index }: { school: School; tier: Tier; index: number }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 + 0.1 }}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{school.name}</div>
          {(school.city || school.state) && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{[school.city, school.state].filter(Boolean).join(', ')}</div>}
        </div>
        {school.programStrength && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: cfg.color, color: '#fff', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {school.programStrength}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
        {school.yourChance != null && <Stat label="Your Chance" value={`${school.yourChance}%`} color={cfg.color} />}
        {school.admitRate != null && <Stat label="Admit Rate" value={`${school.admitRate}%`} real={school._dataSources?.scorecard} />}
        {school.netCost != null && <Stat label="Net Cost/yr" value={`$${(school.netCost / 1000).toFixed(0)}k`} real={school._dataSources?.scorecard} />}
        {school.gradRate != null && <Stat label="Grad Rate" value={`${school.gradRate}%`} real />}
        {school.usNewsRankDisplay && <Stat label="US News" value={school.usNewsRankDisplay} real />}
        {school.medianEarnings10yr != null && <Stat label="Earnings 10yr" value={`$${(school.medianEarnings10yr / 1000).toFixed(0)}k`} real />}
      </div>
      {school.sat25 && school.sat75 && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          <span style={{ fontWeight: 600 }}>SAT range:</span> {school.sat25}–{school.sat75}
          <span className="strat-real-badge">live</span>
        </div>
      )}
      {school.whyFit && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.4 }}>
          &ldquo;{school.whyFit}&rdquo;
        </div>
      )}
    </motion.div>
  )
}

function Stat({ label, value, color, real }: { label: string; value: string; color?: string; real?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 3 }}>
        {value}
        {real && <span className="strat-real-badge">live</span>}
      </span>
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>{label}</span>
    </div>
  )
}

function Field({ label, onChange, ...inputProps }: { label: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <input {...inputProps} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }
const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-column)', color: 'var(--color-text)', fontSize: 13, outline: 'none', width: '100%' }
