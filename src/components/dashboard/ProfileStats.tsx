'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import type { Profile, Task } from '@/lib/types/database'
import Link from 'next/link'
import { useUpdateProfile } from '@/hooks/useProfile'

interface ProfileStatsProps {
  profile: Profile | null | undefined
  loading: boolean
  progress: number
  tasks: Task[]
  userId: string
}

const SCHOOLS_ORDER = ['school1', 'school2', 'school3', 'school4'] as const

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
        {schools.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
            {schools.map((s, i) => (
              <SchoolChip key={i} name={s.name!} rank={i + 1} />
            ))}
          </div>
        )}
        {schools.length === 0 && !loading && (
          <Link href="/profile" style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            + Add your schools →
          </Link>
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
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(display === 'Not set' || display === '—' ? '' : display)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  function commit() {
    setEditing(false)
    const val = draft.trim()
    onSave(val)
    if (val) { setSaved(true); setTimeout(() => setSaved(false), 1800) }
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
          type="text"
          placeholder="e.g. Computer Science"
          style={{
            fontSize: 16, fontWeight: 800, color, lineHeight: 1,
            width: 180, border: 'none', borderBottom: `2px solid ${color}`,
            background: 'transparent', outline: 'none', padding: '0 0 2px',
          }}
        />
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

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
        {label}
      </span>
      <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  )
}

function SchoolChip({ name, rank }: { name: string; rank: number }) {
  const short = name.split(' ').pop() || name
  const colors = [
    { bg: 'rgba(37,99,235,0.1)', color: '#2563EB' },
    { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
    { bg: 'rgba(5,150,105,0.1)', color: '#059669' },
    { bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
  ]
  const c = colors[(rank - 1) % colors.length]
  return (
    <div style={{ background: c.bg, color: c.color, fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 20, border: `1px solid ${c.color}30` }}>
      {short.length > 8 ? short.slice(0, 8) + '…' : short}
    </div>
  )
}
