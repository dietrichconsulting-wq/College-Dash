'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PRO_FEATURES = [
  { icon: '⚡', label: 'College Strategy Generator', desc: 'AI-powered reach/target/safety list with real data' },
  { icon: '⚖️', label: 'College Comparison', desc: 'Side-by-side with live admissions stats' },
  { icon: '🏆', label: 'Unlimited scholarships', desc: 'Track as many as you need' },
  { icon: '🤖', label: 'AI Advisor — unlimited', desc: 'Portfolio and scholarship brainstorming' },
  { icon: '📡', label: 'Deadline Radar', desc: 'Smart deadline tracking across all apps' },
  { icon: '🗺️', label: 'Journey milestones', desc: 'Visual progress tracker' },
]

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 480, width: '100%' }}>
        <div className="card-elevated" style={{ padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 6 }}>Stairway U Pro</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Everything you need to get into your dream school
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 28 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>$9.99</span>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>/month</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
            {PRO_FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', fontWeight: 800, fontSize: 16, cursor: 'pointer', width: '100%', marginBottom: 12 }}
          >
            {loading ? 'Redirecting…' : 'Start 7-day Free Trial →'}
          </button>

          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            No credit card required to start trial. Cancel anytime.
          </div>

          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            ← Back to dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
