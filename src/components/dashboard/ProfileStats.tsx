'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import type { Profile, Task } from '@/lib/types/database'
import { useUpdateProfile } from '@/hooks/useProfile'
import { MajorSelect } from '@/components/MajorSelect'
import { CollegeSelect } from '@/components/CollegeSelect'

interface ProfileStatsProps {
  profile: Profile | null | undefined
  loading: boolean
  progress: number
  tasks: Task[]
  userId: string
}

const SCHOOLS_ORDER = ['school1', 'school2', 'school3', 'school4'] as const

/** Shorten school name: strip "University", "of", "The", "College" to fit chips */
function chipName(name: string): string {
  return name
    .replace(/^The\s+/i, '')
    .replace(/\s+at\s+/i, ' ')
    .replace(/\bUniversity\b/gi, '')
    .replace(/\bCollege\b/gi, '')
    .replace(/\bof\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function ProfileStats({ profile, loading, progress, tasks, userId }: ProfileStatsProps) {
  const updateProfile = useUpdateProfile(userId)
  const schools = SCHOOLS_ORDER
    .map(k => ({ name: profile?.[`${k}_name` as keyof Profile] as string | null }))
    .filter(s => s.name)

  const upcomingCount = tasks.filter(t => {
    if (t.status === 'Done' || !t.due_date) return false
    const daysUntil = (new Date(t.due_date).getTime() - Date.now()) / 86400000
    return daysUntil >= 0 && daysUntil <= 30
  }).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated"
      style={{ padding: '20px 24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* GPA */}
        <EditableStatPill
          label="GPA" color="var(--color-primary)"
          value={loading ? null : profile?.gpa ?? null}
          display={loading ? '—' : profile?.gpa?.toString() ?? '—'}
          type="gpa"
          onSave={v => updateProfile.mutate({ gpa: v ? parseFloat(v) : null })}
        />
        {/* SAT */}
        <EditableStatPill
          label="SAT" color="#7c3aed"
          value={loading ? null : profile?.sat ?? null}
          display={loading ? '—' : profile?.sat?.toString() ?? '—'}
          type="sat"
          onSave={v => updateProfile.mutate({ sat: v ? parseInt(v) : null })}
        />
        {/* Major */}
        <EditableMajorPill
          label="Major"
          display={loading ? '—' : profile?.proposed_major ?? 'Not set'}
          onSave={v => updateProfile.mutate({ proposed_major: v || null })}
        />

        {/* Progress ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-border)" strokeWidth="4" />
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="20" y="24" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-text)">
              {progress}%
            </text>
          </svg>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Progress
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {upcomingCount} due soon
            </div>
          </div>
        </div>

        {/* School chips */}
        {!loading && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>
            {SCHOOLS_ORDER.map((k, i) => {
              const name = profile?.[`${k}_name` as keyof Profile] as string | null
              return (
                <EditableSchoolChip
                  key={k}
                  name={name}
                  rank={i + 1}
                  onSave={v => updateProfile.mutate({ [`${k}_name`]: v || null })}
                />
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EditableStatPill({ label, color, display, onSave, type }: {
  label: string; color: string; value: number | null
  display: string; type: 'gpa' | 'sat'
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(display === '—' ? '' : display)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 30)
  }

  function commit() {
    setEditing(false)
    const val = draft.trim()
    // Basic validation
    if (type === 'gpa') {
      const n = parseFloat(val)
      if (!val || isNaN(n) || n < 0 || n > 5.0) { setSaved(false); return }
    } else {
      const n = parseInt(val)
      if (!val || isNaN(n) || n < 400 || n > 1600) { setSaved(false); return }
    }
    onSave(val)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
        {label}
      </span>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          type="number"
          step={type === 'gpa' ? '0.01' : '10'}
          min={type === 'gpa' ? '0' : '400'}
          max={type === 'gpa' ? '5.0' : '1600'}
          style={{
            fontSize: 20, fontWeight: 800, color, lineHeight: 1,
            width: type === 'gpa' ? 56 : 72, border: 'none', borderBottom: `2px solid ${color}`,
            background: 'transparent', outline: 'none', padding: '0 0 2px',
          }}
        />
      ) : (
        <button
          onClick={startEdit}
          title={`Click to edit ${label}`}
          style={{
            fontSize: 20, fontWeight: 800, color, lineHeight: 1,
            background: 'none', border: 'none', padding: 0, cursor: 'text',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {saved ? <span style={{ color: '#059669' }}>✓</span> : display}
          {!saved && <span style={{ fontSize: 9, color: 'var(--color-text-muted)', opacity: 0.6, fontWeight: 400, marginTop: 2 }}>✎</span>}
        </button>
      )}
    </div>
  )
}

function EditableMajorPill({ label, display, onSave }: {
  label: string; display: string; onSave: (v: string) => void
}) {
  const color = '#059669'
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  function startEdit() {
    setEditing(true)
  }

  function handleSelect(val: string) {
    setEditing(false)
    onSave(val)
    if (val) { setSaved(true); setTimeout(() => setSaved(false), 1800) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
        {label}
      </span>
      {editing ? (
        <div style={{ width: 200 }}>
          <MajorSelect
            value={display === 'Not set' || display === '—' ? '' : display}
            onChange={handleSelect}
            placeholder="Search major…"
          />
        </div>
      ) : (
        <button
          onClick={startEdit}
          title="Click to edit Major"
          style={{
            fontSize: 16, fontWeight: 800, color, lineHeight: 1,
            background: 'none', border: 'none', padding: 0, cursor: 'text',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {saved ? <span style={{ color: '#059669' }}>✓</span> : display}
          {!saved && <span style={{ fontSize: 9, color: 'var(--color-text-muted)', opacity: 0.6, fontWeight: 400, marginTop: 2 }}>✎</span>}
        </button>
      )}
    </div>
  )
}

function EditableSchoolChip({ name, rank, onSave }: { name: string | null; rank: number; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const colors = [
    { bg: 'rgba(37,99,235,0.1)', color: '#2563EB' },
    { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
    { bg: 'rgba(5,150,105,0.1)', color: '#059669' },
    { bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
  ]
  const c = colors[(rank - 1) % colors.length]

  if (editing) {
    return (
      <div style={{ width: 220 }}>
        <CollegeSelect
          value={name ?? ''}
          onChange={v => { onSave(v); setEditing(false) }}
          placeholder="Search for a college…"
          inputStyle={{ padding: '5px 10px', fontSize: 12, borderRadius: 20 }}
        />
      </div>
    )
  }

  if (!name) {
    return (
      <button
        onClick={() => setEditing(true)}
        style={{
          background: 'var(--color-column)', color: 'var(--color-text-muted)',
          fontWeight: 600, fontSize: 12, padding: '5px 12px', borderRadius: 20,
          border: '1.5px dashed var(--color-border)', cursor: 'pointer',
        }}
      >
        + School {rank}
      </button>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title={`${name} — click to change`}
      style={{
        background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 600, fontSize: 11,
        padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{chipName(name)}</span>
      <span style={{ fontSize: 9, opacity: 0.6, flexShrink: 0 }}>✎</span>
    </button>
  )
}
