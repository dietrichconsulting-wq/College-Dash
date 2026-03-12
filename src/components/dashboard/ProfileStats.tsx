'use client'

import { motion } from 'framer-motion'
import type { Profile, Task } from '@/lib/types/database'
import Link from 'next/link'

interface ProfileStatsProps {
  profile: Profile | null | undefined
  loading: boolean
  progress: number
  tasks: Task[]
}

const SCHOOLS_ORDER = ['school1', 'school2', 'school3', 'school4'] as const

export function ProfileStats({ profile, loading, progress, tasks }: ProfileStatsProps) {
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
        <StatPill label="GPA" value={loading ? '—' : profile?.gpa?.toString() ?? '—'} color="var(--color-primary)" />
        {/* SAT */}
        <StatPill label="SAT" value={loading ? '—' : profile?.sat?.toString() ?? '—'} color="#7c3aed" />
        {/* Major */}
        <StatPill label="Major" value={loading ? '—' : profile?.proposed_major ?? 'Not set'} color="#059669" />

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
