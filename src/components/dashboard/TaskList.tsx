'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUpdateTaskStatus, useCreateTask } from '@/hooks/useTasks'
import type { Task, TaskStatus, TaskCategory } from '@/lib/types/database'
import confetti from 'canvas-confetti'

const CATEGORIES: TaskCategory[] = [
  'Testing', 'Applications', 'Essays', 'Financial Aid',
  'Recommendations', 'Visits', 'Scholarships', 'Research', 'Other',
]

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Testing: '#7c3aed',
  Applications: '#2563EB',
  Essays: '#059669',
  'Financial Aid': '#d97706',
  Recommendations: '#dc2626',
  Visits: '#0891b2',
  Scholarships: '#7c3aed',
  Research: '#64748b',
  Other: '#94a3b8',
}

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  userId: string
}

export function TaskList({ tasks, loading, userId }: TaskListProps) {
  const [showDone, setShowDone] = useState(false)
  const [filter, setFilter] = useState<TaskCategory | 'All'>('All')
  const updateStatus = useUpdateTaskStatus(userId)
  const createTask = useCreateTask(userId)
  const [newTitle, setNewTitle] = useState('')

  const activeTasks = tasks.filter(t => t.status !== 'Done')
  const doneTasks = tasks.filter(t => t.status === 'Done')
  const filtered = activeTasks.filter(t => filter === 'All' || t.category === filter)

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / 86400000
    if (diff < 0) return { label: 'Overdue', color: '#EF4444' }
    if (diff <= 7) return { label: `${Math.ceil(diff)}d`, color: '#F59E0B' }
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'var(--color-text-muted)' }
  }

  async function markDone(task: Task) {
    await updateStatus.mutateAsync({ taskId: task.id, status: 'Done' })
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ['#2563EB', '#7c3aed', '#22C55E'] })
  }

  async function addTask() {
    if (!newTitle.trim()) return
    await createTask.mutateAsync({
      title: newTitle.trim(),
      description: null,
      status: 'To Do',
      category: 'Other',
      due_date: null,
      calendar_event_id: null,
      sort_order: tasks.length,
      completed_at: null,
    })
    setNewTitle('')
  }

  if (loading) {
    return (
      <div className="card-elevated" style={{ padding: '24px' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, marginBottom: 10, borderRadius: 10 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="card-elevated" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          Tasks
          <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>
            {activeTasks.length} active
          </span>
        </h2>
        {/* Category filter */}
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as TaskCategory | 'All')}
          style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-column)', color: 'var(--color-text)', outline: 'none' }}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Add task */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task…"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-column)', color: 'var(--color-text)', fontSize: 13, outline: 'none' }}
        />
        <button
          onClick={addTask}
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Add
        </button>
      </div>

      {/* Active tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {filtered.map(task => {
            const dateInfo = formatDate(task.due_date)
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: 'var(--color-column)',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                }}
              >
                <button
                  onClick={() => markDone(task)}
                  style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--color-border)', background: 'var(--color-card)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
                  title="Mark done"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: CATEGORY_COLORS[task.category], background: `${CATEGORY_COLORS[task.category]}18`, padding: '1px 6px', borderRadius: 10 }}>
                      {task.category}
                    </span>
                    {dateInfo && (
                      <span style={{ fontSize: 11, color: dateInfo.color, fontWeight: 600 }}>
                        {dateInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                {task.status === 'In Progress' && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', background: 'rgba(37,99,235,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                    In Progress
                  </span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14, padding: '32px 0' }}>
            {filter === 'All' ? '🎉 All tasks done!' : `No ${filter} tasks`}
          </div>
        )}
      </div>

      {/* Done section */}
      {doneTasks.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
          <button
            onClick={() => setShowDone(!showDone)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {showDone ? '▾' : '▸'} Done ({doneTasks.length})
          </button>
          <AnimatePresence>
            {showDone && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                {doneTasks.slice(0, 20).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', opacity: 0.55 }}>
                    <span style={{ fontSize: 14, color: 'var(--color-success)' }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{task.title}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
