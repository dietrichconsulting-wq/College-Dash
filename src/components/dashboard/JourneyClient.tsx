'use client'

import { motion } from 'framer-motion'
import { useTasks } from '@/hooks/useTasks'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

const MILESTONES = [
  { key: 'psat_taken',          label: 'PSAT Taken',               icon: '📝', desc: 'You took the PSAT — your College Board journey begins.' },
  { key: 'schools_researched',  label: 'Schools Researched',        icon: '🔭', desc: 'Built your initial list of colleges.' },
  { key: 'first_sat',           label: 'First SAT Complete',        icon: '✏️', desc: 'First official SAT score in the books.' },
  { key: 'campus_visits_done',  label: 'Campus Visits Done',        icon: '🏫', desc: 'Visited campuses and got a feel for your schools.' },
  { key: 'recommenders_asked',  label: 'Recommenders Asked',        icon: '🤝', desc: 'Secured your letter writers.' },
  { key: 'essay_drafted',       label: 'Essay Drafted',             icon: '✍️', desc: 'Your Common App personal statement is drafted.' },
  { key: 'commonapp_started',   label: 'Common App Started',        icon: '🖥️', desc: 'Your Common App account is live.' },
  { key: 'fafsa_submitted',     label: 'FAFSA Submitted',           icon: '💰', desc: 'Financial aid form submitted on time.' },
  { key: 'apps_submitted',      label: 'Applications Submitted',    icon: '🚀', desc: 'All applications are in — now you wait!' },
  { key: 'decision_made',       label: 'Decision Made',             icon: '🎓', desc: 'You committed to your school — the journey ends here and a new one begins!' },
]

export function JourneyClient({ userId }: { userId: string }) {
  const supabase = createClient()
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', userId],
    queryFn: async () => {
      const { data } = await supabase.from('progress').select('milestone_key').eq('user_id', userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => r.milestone_key as string)
    },
  })

  const reached = new Set(milestones)
  const firstUnreached = MILESTONES.findIndex(m => !reached.has(m.key))

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Your Journey 🗺️</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32 }}>
        {reached.size} of {MILESTONES.length} milestones reached
      </p>

      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'var(--color-border)', zIndex: 0 }} />

        {MILESTONES.map((m, i) => {
          const isReached = reached.has(m.key)
          const isCurrent = i === firstUnreached

          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ display: 'flex', gap: 20, marginBottom: 24, position: 'relative', zIndex: 1 }}
            >
              {/* Circle */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
                background: isReached ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-column)',
                border: `2px solid ${isReached ? '#16a34a' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none',
                transition: 'all 0.3s',
              }}>
                {isReached ? '✓' : m.icon}
              </div>

              {/* Content */}
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isReached ? 'var(--color-text-muted)' : 'var(--color-text)', textDecoration: isReached ? 'line-through' : 'none' }}>
                  {m.label}
                </div>
                {(isReached || isCurrent) && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3, lineHeight: 1.4 }}>
                    {m.desc}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
