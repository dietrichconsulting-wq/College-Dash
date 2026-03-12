'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScholarships, useCreateScholarship, useUpdateScholarship, useDeleteScholarship } from '@/hooks/useScholarships'
import type { Scholarship, ScholarshipStage, ScholarshipDifficulty } from '@/lib/types/database'

const STAGES: ScholarshipStage[] = ['Researching', 'Applying', 'Submitted', 'Won']
const DIFFICULTIES: ScholarshipDifficulty[] = ['Easy', 'Medium', 'Hard']

const STAGE_COLORS: Record<ScholarshipStage, { bg: string; color: string; border: string }> = {
  Researching: { bg: 'rgba(100,116,139,0.08)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
  Applying:    { bg: 'rgba(37,99,235,0.08)',   color: '#2563EB', border: 'rgba(37,99,235,0.2)'  },
  Submitted:   { bg: 'rgba(245,158,11,0.08)',  color: '#d97706', border: 'rgba(245,158,11,0.2)' },
  Won:         { bg: 'rgba(34,197,94,0.08)',   color: '#16a34a', border: 'rgba(34,197,94,0.2)'  },
}

const DIFF_COLORS: Record<ScholarshipDifficulty, string> = { Easy: '#16a34a', Medium: '#d97706', Hard: '#dc2626' }

const emptyForm = { name: '', amount: '', deadline: '', stage: 'Researching' as ScholarshipStage, difficulty: 'Medium' as ScholarshipDifficulty, url: '', essay_required: false, notes: '' }

export function ScholarshipsPageClient({ userId }: { userId: string }) {
  const { data: scholarships = [], isLoading } = useScholarships(userId)
  const createScholarship = useCreateScholarship(userId)
  const updateScholarship = useUpdateScholarship(userId)
  const deleteScholarship = useDeleteScholarship(userId)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)

  const totalWon = scholarships.filter(s => s.stage === 'Won').reduce((sum, s) => sum + (s.amount ?? 0), 0)
  const totalApplied = scholarships.filter(s => s.stage !== 'Researching').length

  async function handleSubmit() {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(),
      amount: form.amount ? parseInt(form.amount) : null,
      deadline: form.deadline || null,
      stage: form.stage,
      difficulty: form.difficulty,
      essay_required: form.essay_required,
      url: form.url || null,
      notes: form.notes || null,
    }
    if (editId) {
      await updateScholarship.mutateAsync({ id: editId, ...payload })
      setEditId(null)
    } else {
      await createScholarship.mutateAsync(payload)
    }
    setForm(emptyForm)
    setAdding(false)
  }

  function startEdit(s: Scholarship) {
    setForm({
      name: s.name,
      amount: s.amount?.toString() ?? '',
      deadline: s.deadline ?? '',
      stage: s.stage,
      difficulty: s.difficulty,
      essay_required: s.essay_required,
      url: s.url ?? '',
      notes: s.notes ?? '',
    })
    setEditId(s.id)
    setAdding(true)
  }

  if (isLoading) {
    return <div style={{ maxWidth: 900 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12, borderRadius: 12 }} />)}</div>
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Scholarships 🏆</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {totalWon > 0 ? `$${totalWon.toLocaleString()} won · ` : ''}{totalApplied} in pipeline · {scholarships.length} total
          </p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setAdding(true) }} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + Add Scholarship
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card-elevated" style={{ padding: '20px 24px', marginBottom: 24 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{editId ? 'Edit' : 'New'} Scholarship</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Scholarship name *" style={iS} />
              <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount ($)" type="number" style={iS} />
              <input value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} type="date" style={iS} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as ScholarshipStage }))} style={iS}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as ScholarshipDifficulty }))} style={iS}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="URL (optional)" style={iS} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '9px 0' }}>
                <input type="checkbox" checked={form.essay_required} onChange={e => setForm(f => ({ ...f, essay_required: e.target.checked }))} />
                Essay required
              </label>
            </div>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes…" rows={2} style={{ ...iS, width: '100%', resize: 'vertical', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmit} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {editId ? 'Save Changes' : 'Add Scholarship'}
              </button>
              <button onClick={() => { setAdding(false); setEditId(null) }} style={{ background: 'var(--color-column)', border: '1.5px solid var(--color-border)', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--color-text)' }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STAGES.map(stage => {
          const items = scholarships.filter(s => s.stage === stage)
          const c = STAGE_COLORS[stage]
          const stageTotal = items.reduce((sum, s) => sum + (s.amount ?? 0), 0)
          return (
            <div key={stage} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '14px 14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stage}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.color }}>
                  {items.length > 0 && `${items.length}${stageTotal > 0 ? ` · $${(stageTotal / 1000).toFixed(0)}k` : ''}`}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(s => (
                  <motion.div key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}
                    onClick={() => startEdit(s)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {s.amount && <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>${(s.amount / 1000).toFixed(0)}k</span>}
                      <span style={{ fontSize: 10, fontWeight: 600, color: DIFF_COLORS[s.difficulty] }}>{s.difficulty}</span>
                      {s.deadline && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      {s.essay_required && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Essay</span>}
                    </div>
                  </motion.div>
                ))}
                {items.length === 0 && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>Empty</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const iS: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-column)', color: 'var(--color-text)', fontSize: 13, outline: 'none', width: '100%' }
