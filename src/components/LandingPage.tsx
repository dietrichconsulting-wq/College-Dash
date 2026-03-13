'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const FEATURES = [
  {
    icon: '🎯',
    title: 'Admission Snapshot',
    desc: 'See your real odds at every school on your list — plus what happens if your SAT goes up 50 points or your GPA climbs 0.2.',
    color: '#2563EB',
  },
  {
    icon: '🏆',
    title: 'AI Scholarship Finder',
    desc: 'Answer a few questions and get 10 personalized scholarships with direct application links and "why you match" explanations.',
    color: '#7c3aed',
  },
  {
    icon: '⚖️',
    title: 'College Comparison',
    desc: 'Side-by-side comparison of admit rate, net cost, SAT range, earnings, graduation rate, and US News rank — all from live data.',
    color: '#0891b2',
  },
  {
    icon: '💵',
    title: 'Financial Planner',
    desc: '529 savings projections, tuition inflation modeling, loan estimates, and what-if sliders to help parents plan the full 4 years.',
    color: '#16a34a',
  },
  {
    icon: '✍️',
    title: 'Essay Studio',
    desc: 'AI brainstorming and critique for Common App and supplemental essays. Get unstuck, strengthen your voice, and stand out.',
    color: '#d97706',
  },
  {
    icon: '🗺️',
    title: 'Journey Tracker',
    desc: 'A visual roadmap of every milestone from sophomore year through decision day — with a progress ring that shows where you stand.',
    color: '#dc2626',
  },
]

const STATS = [
  { value: '12+', label: 'Planning tools in one place' },
  { value: '$50k+', label: 'Avg scholarships surfaced' },
  { value: '3,000+', label: 'Colleges in our database' },
  { value: '100%', label: 'AI-personalized to you' },
]

const STEPS = [
  { n: '1', title: 'Build your profile', desc: 'Enter your GPA, SAT, intended major, and target schools. Takes 2 minutes.' },
  { n: '2', title: 'Get your game plan', desc: 'AI generates your admission chances, scholarship matches, and a custom strategy.' },
  { n: '3', title: 'Execute & track', desc: 'Follow your roadmap, hit deadlines, and watch your pipeline grow.' },
]

const TESTIMONIALS = [
  {
    name: 'Sophia R.',
    school: 'Admitted to UT Austin',
    quote: "Stairway U showed me I had a 74% chance at UT Austin. That gave me the confidence to apply early. I got in.",
    avatar: '👩‍🎓',
  },
  {
    name: 'Marcus T.',
    school: 'Received $28,000 in scholarships',
    quote: "The scholarship finder found 3 scholarships I never would have found on my own. Two of them were easy-apply — no essay required.",
    avatar: '👨‍🎓',
  },
  {
    name: 'Linda C.',
    school: 'Parent of 2026 applicant',
    quote: "The Financial Planner finally helped me understand what college will actually cost us. The 529 projections were eye-opening.",
    avatar: '👩',
  },
]

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0f172a', background: '#fff' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: scrolled ? '#2563EB' : '#fff' }}>
          🎓 Stairway U
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 600,
            color: scrolled ? '#2563EB' : '#fff',
            textDecoration: 'none', padding: '8px 16px',
          }}>
            Sign In
          </Link>
          <Link href="/signup" style={{
            fontSize: 14, fontWeight: 700,
            background: scrolled ? '#2563EB' : '#fff',
            color: scrolled ? '#fff' : '#2563EB',
            textDecoration: 'none', padding: '9px 20px',
            borderRadius: 10, transition: 'all 0.2s',
          }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 45%, #7c3aed 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -100, width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
          AI-Powered College Planning
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, maxWidth: 800 }}>
          Your Stairway<br />to College
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: 'rgba(255,255,255,0.82)', maxWidth: 600, lineHeight: 1.6, marginBottom: 40 }}>
          Know your real odds. Find your scholarships. Plan the finances. Get in.
          Everything a high schooler and their family needs — in one AI-powered platform.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{
            background: '#fff', color: '#2563EB',
            textDecoration: 'none', borderRadius: 12, padding: '16px 36px',
            fontWeight: 800, fontSize: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
          }}>
            Start for Free →
          </Link>
          <Link href="/login" style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.3)',
            textDecoration: 'none', borderRadius: 12, padding: '16px 36px',
            fontWeight: 700, fontSize: 16, backdropFilter: 'blur(8px)',
          }}>
            Sign In
          </Link>
        </div>

        {/* Hero mockup */}
        <div style={{
          marginTop: 64, width: '100%', maxWidth: 860,
          background: 'rgba(255,255,255,0.1)', borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        }}>
          {/* Mock dashboard header */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            {[
              { label: 'GPA', value: '3.9', color: '#22c55e' },
              { label: 'SAT', value: '1380', color: '#2563EB' },
              { label: 'Admit Chance', value: '74%', color: '#7c3aed' },
              { label: 'Scholarships', value: '$42k', color: '#d97706' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', height: 80, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>🎯</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Admission Snapshot</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>UT Austin · 74% match</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', height: 80, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>🏆</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Scholarships Found</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>10 matches · $42k total</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: '#1e3a8a', padding: '40px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2563EB', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Everything You Need
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>
              One platform. Every step of the journey.
            </h2>
            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
              From sophomore year to decision day — Stairway U has the tools to get you there.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: 20, padding: '32px 28px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '96px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              How It Works
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0f172a' }}>
              Up and running in minutes
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, position: 'relative' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 24, fontWeight: 900, color: '#fff',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                }}>
                  {step.n}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '96px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Student Stories
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0f172a' }}>
              Real students. Real results.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 20, padding: '32px 28px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>{t.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '96px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2563EB', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Pricing
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>
            Simple, honest pricing
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', marginBottom: 56, lineHeight: 1.6 }}>
            Start free. Upgrade when you&apos;re ready for the full arsenal.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Free */}
            <div style={{ background: '#f8fafc', borderRadius: 24, padding: '40px 36px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>FREE</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>$0</div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>Forever free</div>
              {['Journey roadmap', 'Task tracker', 'College search', 'Basic profile'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#334155' }}>{f}</span>
                </div>
              ))}
              <Link href="/signup" style={{
                display: 'block', textAlign: 'center', marginTop: 28,
                background: '#e2e8f0', color: '#334155',
                textDecoration: 'none', borderRadius: 12, padding: '14px',
                fontWeight: 700, fontSize: 15,
              }}>
                Get Started
              </Link>
            </div>
            {/* Pro */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
              borderRadius: 24, padding: '40px 36px', textAlign: 'left',
              boxShadow: '0 16px 48px rgba(37,99,235,0.3)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 16, right: 16, background: '#fbbf24', color: '#78350f', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                MOST POPULAR
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>PRO</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 4 }}>$9.99</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>per month</div>
              {['AI Admission Snapshot', 'Scholarship Finder', 'College Comparison', 'Financial Planner', 'Essay Studio', 'Unlimited everything'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: '#86efac', fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{f}</span>
                </div>
              ))}
              <Link href="/signup" style={{
                display: 'block', textAlign: 'center', marginTop: 28,
                background: '#fff', color: '#2563EB',
                textDecoration: 'none', borderRadius: 12, padding: '14px',
                fontWeight: 800, fontSize: 15,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}>
                Start Pro Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: '96px 5%',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 900, color: '#fff', marginBottom: 20, lineHeight: 1.15 }}>
            Your dream school is waiting.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40, lineHeight: 1.6 }}>
            Join students using Stairway U to get organized, get funded, and get in.
          </p>
          <Link href="/signup" style={{
            display: 'inline-block',
            background: '#fff', color: '#2563EB',
            textDecoration: 'none', borderRadius: 14, padding: '18px 48px',
            fontWeight: 900, fontSize: 18,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            Get Started Free →
          </Link>
          <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            No credit card required
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '48px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 6 }}>🎓 Stairway U</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Your Stairway to College</div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Sign In', href: '/login' },
              { label: 'Sign Up', href: '/signup' },
              { label: 'Pricing', href: '/upgrade' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            © 2025 Stairway U. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
