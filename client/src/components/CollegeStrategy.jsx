import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const CLIMATE_OPTIONS = [
  '', 'Mountains', 'Beach / Coastal', 'Sunny / Southwest',
  'Midwest', 'Pacific Northwest', 'Northeast', 'Southeast', 'No Preference',
];

const _dark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const getTierConfig = () => _dark() ? {
  reach:  { label: 'Reach',  emoji: '🚀', color: '#FCA5A5', bg: 'rgba(252,165,165,0.08)', border: 'rgba(252,165,165,0.18)' },
  target: { label: 'Target', emoji: '🎯', color: '#FDE68A', bg: 'rgba(253,230,138,0.08)', border: 'rgba(253,230,138,0.18)' },
  safety: { label: 'Safety', emoji: '✅', color: '#86EFAC', bg: 'rgba(134,239,172,0.08)', border: 'rgba(134,239,172,0.18)' },
} : {
  reach:  { label: 'Reach',  emoji: '🚀', color: '#EF4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)'  },
  target: { label: 'Target', emoji: '🎯', color: '#F59E0B', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)' },
  safety: { label: 'Safety', emoji: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)'  },
};
function SchoolCard({ school, tier, index }) {
  const cfg = getTierConfig()[tier];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 + 0.1 }}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', lineHeight: 1.2 }}>
            {school.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {school.city}, {school.state}
          </div>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 20,
          background: cfg.color,
          color: '#fff',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {school.programStrength}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
        <Stat label="Your Chance" value={`${school.yourChance ?? '—'}%`} color={cfg.color} title="AI estimate — not a guarantee" />
        <Stat label="Admit Rate" value={school.admitRate != null ? `${school.admitRate}%` : '—'} real={school._dataSources?.scorecard} title="Source: U.S. Dept. of Education, College Scorecard 2024" />
        <Stat label="Net Cost/yr" value={school.netCost != null ? `$${(school.netCost / 1000).toFixed(0)}k` : '—'} real={school._dataSources?.scorecard} title="Source: U.S. Dept. of Education, College Scorecard 2024" />
        {school.gradRate != null && <Stat label="Grad Rate" value={`${school.gradRate}%`} real title="Source: U.S. Dept. of Education, College Scorecard 2024" />}
        {school.usNewsRankDisplay && <Stat label="US News" value={school.usNewsRankDisplay} real title="~2024 published rankings" />}
        {school.medianEarnings10yr != null && <Stat label="Earnings 10yr" value={`$${(school.medianEarnings10yr / 1000).toFixed(0)}k`} real title="Source: U.S. Dept. of Education, College Scorecard 2024" />}
      </div>

      {(school.sat25 && school.sat75) && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          <span style={{ fontWeight: 600 }}>SAT range:</span> {school.sat25}–{school.sat75}
          <span className="strat-real-badge">live</span>
        </div>
      )}

      {school.whyFit && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.4 }}>
          "{school.whyFit}"
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value, color, real, title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }} title={title}>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 3 }}>
        {value}
        {real && <span className="strat-real-badge">live</span>}
      </span>
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>{label}</span>
    </div>
  );
}

function TierSection({ tier, schools }) {
  const cfg = getTierConfig()[tier];
  if (!schools?.length) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: cfg.color, margin: 0 }}>{cfg.label}</h3>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{schools.length} schools</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {schools.map((s, i) => (
          <SchoolCard key={s.name} school={s} tier={tier} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function CollegeStrategy({ profile, userId, readOnly }) {
  const [form, setForm] = useState({
    gpa:     profile?.gpa     || '',
    sat:     profile?.sat     || '',
    act:     profile?.act     || '',
    major:   profile?.proposedMajor || '',
    budget:  '',
    climate: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(
    (profile?.strategyResult) ? profile.strategyResult : null
  );
  const [error, setError] = useState(null);
  const inflightRef = useRef(false);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleGenerate = async (forceRefresh = false) => {
    if (!form.gpa || (!form.sat && !form.act) || !form.major) {
      setError('GPA, a test score (SAT or ACT), and major are required.');
      return;
    }
    // Prevent duplicate clicks while a request is in flight
    if (inflightRef.current) return;
    inflightRef.current = true;
    setError(null);
    setLoading(true);
    try {
      const schools = (profile?.schools || []).filter(s => s?.name?.trim()).map(s => s.name);
      const { data } = await api.post('/strategy/generate', {
        ...form, schools, forceRefresh,
      });
      setResult(data);
    } catch (err) {
      setError('Something went wrong generating your strategy. Please try again.');
    } finally {
      setLoading(false);
      inflightRef.current = false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card-elevated strategy-container"
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 'var(--font-size-section-header)', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
          College Strategy Generator
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Get an AI-powered game plan tailored to your profile and goals.
        </p>
      </div>

      {/* Input form (hidden in read-only parent view) */}
      {!readOnly && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <Field label="GPA" type="number" step="0.01" min="0" max="4.0" placeholder="3.9"
              value={form.gpa} onChange={v => handleChange('gpa', v)} />
            <Field label="SAT Score" type="number" min="400" max="1600" placeholder="1400"
              value={form.sat} onChange={v => handleChange('sat', v)} />
            <Field label="ACT Score" type="number" min="1" max="36" placeholder="28"
              value={form.act} onChange={v => handleChange('act', v)} />
            <Field label="Intended Major" placeholder="Environmental Design"
              value={form.major} onChange={v => handleChange('major', v)} style={{ gridColumn: 'span 2' }} />
            <Field label="Annual Budget ($)" type="number" min="0" placeholder="30000"
              hint="Max out-of-pocket after aid"
              value={form.budget} onChange={v => handleChange('budget', v)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Climate <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <select
                value={form.climate}
                onChange={e => handleChange('climate', e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-column)',
                  color: 'var(--color-text)',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                {CLIMATE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt || 'Any climate'}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              style={{
                background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '11px 28px',
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span className="strategy-spinner" />
                  Generating…
                </>
              ) : result ? (
                <>🔄 Regenerate Strategy</>
              ) : (
                <>✨ Generate Strategy</>
              )}
            </button>
            {result && !loading && (
              <button
                onClick={() => handleGenerate(true)}
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '9px 16px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
                title="Ignore cache and generate a fresh strategy"
              >
                Force Refresh
              </button>
            )}
          </div>
        </>
      )}

      {readOnly && !result && (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No strategy has been generated yet.
        </p>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 32 }}
          >
            {result.rationale && (
              <div style={{
                background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                color: 'var(--color-text)',
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                <strong style={{ color: 'var(--color-primary)' }}>Strategy: </strong>
                {result.rationale}
              </div>
            )}

            <TierSection tier="reach"  schools={result.reach}  />
            <TierSection tier="target" schools={result.target} />
            <TierSection tier="safety" schools={result.safety} />

            <p style={{
              fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5,
              marginTop: 16, padding: '10px 0', borderTop: '1px solid var(--color-border)',
            }}>
              Stats marked <span className="strat-real-badge" style={{ display: 'inline', verticalAlign: 'middle' }}>live</span> are from the U.S. Dept. of Education, College Scorecard 2024. "Your Chance" is an AI-generated estimate and is <strong>not a guarantee of admission</strong>. School recommendations are AI-generated. Always verify on each school's official site.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Field({ label, hint, style, onChange, ...inputProps }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        {...inputProps}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '9px 12px',
          borderRadius: 8,
          border: '1.5px solid var(--color-border)',
          background: 'var(--color-column)',
          color: 'var(--color-text)',
          fontSize: 13,
          outline: 'none',
        }}
      />
      {hint && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{hint}</span>}
    </div>
  );
}
