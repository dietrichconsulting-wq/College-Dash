import { useState } from 'react';
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

const PREFERENCE_OPTIONS = [
  { key: 'publicOnly',         label: 'Public university' },
  { key: 'researchUniversity', label: 'Research university' },
  { key: 'liberalArts',        label: 'Liberal arts college' },
  { key: 'largeCampus',        label: 'Large campus (10k+ students)' },
  { key: 'smallCampus',        label: 'Small campus (<5k students)' },
  { key: 'hbcu',               label: 'HBCU' },
];

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

function DiscoveryCard({ school, index, onAdd, canAdd, alreadyAdded }) {
  const cfg = getTierConfig()[school.tier] || TIER_CONFIG.target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.1 }}
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', lineHeight: 1.3 }}>
              {school.name}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 20,
              background: cfg.color,
              color: '#fff',
              flexShrink: 0,
            }}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
          {(school.city || school.state) && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {[school.city, school.state].filter(Boolean).join(', ')}
              {school.control && <span style={{ marginLeft: 6, opacity: 0.7 }}>· {school.control}</span>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {school.programStrength && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
            }}>
              {school.programStrength}
            </span>
          )}
          {alreadyAdded ? (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 8,
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22C55E',
              whiteSpace: 'nowrap',
            }}>
              ✓ Added
            </span>
          ) : (
            <button
              onClick={() => onAdd(school)}
              disabled={!canAdd}
              title={canAdd ? 'Add to your dashboard schools' : 'Dashboard is full (4 schools max)'}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: 8,
                border: canAdd
                  ? '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)'
                  : '1px solid var(--color-border)',
                background: canAdd
                  ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                  : 'transparent',
                color: canAdd ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: canAdd ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              + Add to Dashboard
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
        {school.yourChance != null && (
          <Stat label="Your Chance" value={`${school.yourChance}%`} color={cfg.color} title="Estimated from real admission data — not a guarantee" />
        )}
        {school.admitRate != null && (
          <Stat label="Admit Rate" value={`${school.admitRate}%`} real={school._dataSources?.scorecard} title="Source: U.S. Dept. of Education, College Scorecard 2024" />
        )}
        {school.netCost != null && (
          <Stat label="Net Cost/yr" value={`$${(school.netCost / 1000).toFixed(0)}k`} real={school._dataSources?.scorecard} title="Average net price after aid — Source: College Scorecard 2024" />
        )}
        {school.gradRate != null && (
          <Stat label="Grad Rate" value={`${school.gradRate}%`} real title="Source: U.S. Dept. of Education, College Scorecard 2024" />
        )}
        {school.usNewsRankDisplay && (
          <Stat label="US News" value={school.usNewsRankDisplay} real title="~2024 published rankings" />
        )}
        {school.medianEarnings10yr != null && (
          <Stat label="Earnings 10yr" value={`$${(school.medianEarnings10yr / 1000).toFixed(0)}k`} real title="Source: U.S. Dept. of Education, College Scorecard 2024" />
        )}
      </div>

      {(school.sat25 && school.sat75) && (
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
          <span style={{ fontWeight: 600 }}>SAT range:</span> {school.sat25}–{school.sat75}
          <span className="strat-real-badge">live</span>
        </div>
      )}

      {school.whyFit && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 2, lineHeight: 1.4 }}>
          "{school.whyFit}"
        </div>
      )}
    </motion.div>
  );
}

export default function SchoolDiscovery({ profile, onSaveSchools }) {
  const [form, setForm] = useState({
    gpa:     profile?.gpa            || '',
    sat:     profile?.sat            || '',
    act:     profile?.act            || '',
    major:   profile?.proposedMajor  || '',
    budget:  '',
    climate: '',
  });
  const [preferences, setPreferences] = useState({
    publicOnly: false,
    researchUniversity: false,
    liberalArts: false,
    largeCampus: false,
    smallCampus: false,
    hbcu: false,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [addedSchools, setAddedSchools] = useState(new Set());

  const currentSchools = profile?.schools?.filter(s => s?.name?.trim()) || [];

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handlePrefToggle = (key) => setPreferences(p => ({ ...p, [key]: !p[key] }));

  const handleFind = async () => {
    if (!form.gpa || !form.major) {
      setError('GPA and intended major are required.');
      return;
    }
    setError(null);
    setLoading(true);
    setResults(null);
    setAddedSchools(new Set());
    try {
      const { data } = await api.post('/discovery/find', { ...form, preferences });
      setResults(data.schools || []);
    } catch (err) {
      setError('Something went wrong finding schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDashboard = (school) => {
    const current = profile?.schools?.filter(s => s?.name?.trim()) || [];
    if (current.length >= 4) return;
    const updated = [
      ...current,
      { name: school.name, scorecardId: school._dataSources?.scorecardId ?? null },
    ];
    onSaveSchools(updated);
    setAddedSchools(prev => new Set([...prev, school.name]));
  };

  const reachSchools  = results?.filter(s => s.tier === 'reach')  || [];
  const targetSchools = results?.filter(s => s.tier === 'target') || [];
  const safetySchools = results?.filter(s => s.tier === 'safety') || [];

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
          Find Schools For Me
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Tell us what you're looking for — we'll find schools that match your goals, budget, and location preferences.
        </p>
      </div>

      {/* Input form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Field label="GPA *" type="number" step="0.01" min="0" max="4.0" placeholder="3.7"
          value={form.gpa} onChange={v => handleChange('gpa', v)} />
        <Field label="SAT Score" type="number" min="400" max="1600" placeholder="1350"
          value={form.sat} onChange={v => handleChange('sat', v)} />
        <Field label="ACT Score" type="number" min="1" max="36" placeholder="29"
          value={form.act} onChange={v => handleChange('act', v)} />
        <Field label="Intended Major *" placeholder="Computer Science"
          value={form.major} onChange={v => handleChange('major', v)}
          style={{ gridColumn: 'span 2' }} />
        <Field label="Annual Budget ($)" type="number" min="0" placeholder="60000"
          hint="All-in cost including room & board"
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

      {/* Preferences chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Preferences <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PREFERENCE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handlePrefToggle(opt.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: preferences[opt.key]
                  ? '1.5px solid var(--color-primary)'
                  : '1.5px solid var(--color-border)',
                background: preferences[opt.key]
                  ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                  : 'transparent',
                color: preferences[opt.key] ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {preferences[opt.key] ? '✓ ' : ''}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      <button
        onClick={handleFind}
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
            Searching…
          </>
        ) : (
          <>🔍 Find My Schools</>
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 32 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                {results.length} Schools Found
              </h3>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Dashboard: {currentSchools.length + addedSchools.size}/4 schools
                {currentSchools.length + addedSchools.size >= 4 && ' · Dashboard full'}
              </span>
            </div>

            {results.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No matching schools found. Try loosening your budget or preferences.
              </p>
            )}

            {[['reach', reachSchools], ['target', targetSchools], ['safety', safetySchools]].map(([tier, schools]) => {
              if (!schools.length) return null;
              const cfg = getTierConfig()[tier];
              return (
                <div key={tier} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: cfg.color, margin: 0 }}>{cfg.label}</h3>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{schools.length} schools</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {schools.map((s, i) => {
                      const dashFull = currentSchools.length + addedSchools.size >= 4;
                      return (
                        <DiscoveryCard
                          key={s.name}
                          school={s}
                          index={i}
                          onAdd={handleAddToDashboard}
                          canAdd={!dashFull && !addedSchools.has(s.name)}
                          alreadyAdded={addedSchools.has(s.name)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <p style={{
              fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5,
              marginTop: 16, padding: '10px 0', borderTop: '1px solid var(--color-border)',
            }}>
              Stats marked <span className="strat-real-badge" style={{ display: 'inline', verticalAlign: 'middle' }}>live</span> are from the U.S. Dept. of Education, College Scorecard 2024. "Your Chance" is estimated from real admission data and is <strong>not a guarantee of admission</strong>. School recommendations are AI-generated. Always verify on each school's official site.
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
