import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { getSchoolColors, DEFAULT_THEME } from '../utils/schoolColors';
import api from '../utils/api';

// ── Animated count-up number ──
function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0, delay = 0 }) {
  const spring = useSpring(0, { stiffness: 70, damping: 18 });
  const display = useTransform(spring, v => {
    const rounded = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
    return `${prefix}${rounded}${suffix}`;
  });
  useEffect(() => {
    const t = setTimeout(() => spring.set(value ?? 0), delay);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  if (value == null) return <span>—</span>;
  return <motion.span>{display}</motion.span>;
}

// ── Mini SVG arc gauge for percentages ──
function MiniRing({ value, color, size = 38, delay = 0 }) {
  const r = 14;
  const sw = 3.5;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value ?? 0, 0), 100) / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={sw} />
      <motion.circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1], delay }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
    </svg>
  );
}

const MAX_SCHOOLS = 5;

const METRICS = [
  {
    key: 'yourChance',
    label: 'Your Chance',
    icon: '⭐',
    colorFn: v => v == null ? null : v >= 70 ? '#22C55E' : v >= 40 ? '#F59E0B' : '#EF4444',
    tooltip: 'AI-estimated admission probability (rounded to 5%) based on your GPA & SAT vs the school\'s published admit rate and SAT range. This is an estimate, not a guarantee.',
    highlight: true,
    ring: true,
    suffix: '%',
    aiOnly: true,
  },
  {
    key: 'admitRate',
    label: 'Overall Admit Rate',
    icon: '🎯',
    colorFn: v => v == null ? null : v <= 20 ? '#EF4444' : v <= 40 ? '#F59E0B' : '#22C55E',
    tooltip: "School's published overall admission rate — not personalized to you. Source: U.S. Dept. of Education, College Scorecard 2024",
    ring: true,
    suffix: '%',
  },
  {
    key: 'avgSAT',
    label: 'Avg SAT',
    icon: '📝',
    colorFn: () => null,
    tooltip: 'Average composite SAT score. Source: U.S. Dept. of Education, College Scorecard 2024',
    counter: true,
  },
  {
    key: 'netCost',
    label: 'Est. Net Cost/yr',
    icon: '💰',
    colorFn: v => v == null ? null : v <= 20000 ? '#22C55E' : v <= 35000 ? '#F59E0B' : '#EF4444',
    tooltip: 'Estimated annual cost after typical financial aid. Source: U.S. Dept. of Education, College Scorecard 2024',
    counterK: true,      // animate in thousands: $27k
  },
  {
    key: 'tuitionOutOfState',
    label: 'OOS Tuition',
    icon: '🏷️',
    colorFn: () => null,
    tooltip: 'Official out-of-state tuition. Source: U.S. Dept. of Education, College Scorecard 2024',
    counterK: true,
  },
  {
    key: 'enrollment',
    label: 'Enrollment',
    icon: '🎓',
    colorFn: () => null,
    tooltip: 'Total undergraduate enrollment. Source: U.S. Dept. of Education, College Scorecard 2024',
    counterK: true,
    enrollmentLabel: true,  // append size label
  },
  {
    key: 'location',
    label: 'Location',
    icon: '📍',
    colorFn: () => null,
    static: true,
    format: (_, school) => (school.city && school.state) ? `${school.city}, ${school.state}` : '—',
  },
  {
    key: 'usNewsRankDisplay',
    label: 'US News Rank',
    icon: '🗞️',
    colorFn: v => {
      if (!v) return null;
      const n = parseInt(String(v).replace(/\D/g, ''), 10);
      if (isNaN(n)) return null;
      return n <= 25 ? '#22C55E' : n <= 75 ? '#F59E0B' : null;
    },
    tooltip: 'US News National University ranking (~2024)',
    static: true,
    format: v => v || '—',
    realData: true,
  },
  {
    key: 'gradRate',
    label: 'Grad Rate (4yr)',
    icon: '📊',
    colorFn: v => v == null ? null : v >= 80 ? '#22C55E' : v >= 65 ? '#F59E0B' : '#EF4444',
    tooltip: '4-year graduation rate. Source: U.S. Dept. of Education, College Scorecard 2024',
    ring: true,
    suffix: '%',
    realData: true,
  },
  {
    key: 'retentionRate',
    label: 'Retention Rate',
    icon: '🔄',
    colorFn: v => v == null ? null : v >= 90 ? '#22C55E' : v >= 80 ? '#F59E0B' : '#EF4444',
    tooltip: 'First-year full-time retention rate. Source: U.S. Dept. of Education, College Scorecard 2024',
    ring: true,
    suffix: '%',
    realData: true,
  },
  {
    key: 'medianEarnings10yr',
    label: 'Median Earnings (10yr)',
    icon: '💼',
    colorFn: v => v == null ? null : v >= 60000 ? '#22C55E' : v >= 40000 ? '#F59E0B' : null,
    tooltip: 'Median earnings 10 years after enrollment. Source: U.S. Dept. of Education, College Scorecard 2024',
    counterK: true,
    realData: true,
  },
  {
    key: 'sat25sat75',
    label: 'SAT Range',
    icon: '📐',
    colorFn: () => null,
    tooltip: 'SAT 25th–75th percentile range of admitted students. Source: U.S. Dept. of Education, College Scorecard 2024',
    static: true,
    format: (_, school) => (school.sat25 && school.sat75) ? `${school.sat25}–${school.sat75}` : (school.avgSAT ? `~${school.avgSAT}` : '—'),
    realData: true,
  },
  {
    key: 'control',
    label: 'Type',
    icon: '🏛️',
    colorFn: () => null,
    tooltip: 'Public or private institution. Source: IPEDS, U.S. Dept. of Education',
    static: true,
    format: v => v || '—',
    realData: true,
  },
];

function AddSchoolInput({ onAdd, onClose }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onAdd(value.trim());
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onSubmit={handleSubmit}
      className="comp-add-form"
    >
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="e.g. University of Michigan"
        className="comp-add-input"
        onKeyDown={e => e.key === 'Escape' && onClose()}
      />
      <button type="submit" className="comp-add-btn" disabled={!value.trim()}>Add</button>
      <button type="button" className="comp-add-cancel" onClick={onClose}>✕</button>
    </motion.form>
  );
}

export default function CollegeComparison({ profile }) {
  const [schools, setSchools] = useState([]);
  const [compData, setCompData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [majorLabel, setMajorLabel] = useState('');
  const [homeState, setHomeState] = useState(() => localStorage.getItem('homeState') || '');

  // Initialize with profile schools
  useEffect(() => {
    const profileSchools = (profile?.schools || [])
      .filter(s => s?.name && s.name.trim())
      .map(s => s.name)
      .slice(0, MAX_SCHOOLS);
    if (profileSchools.length > 0) setSchools(profileSchools);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track major for column label
  useEffect(() => {
    setMajorLabel(profile?.proposedMajor || '');
  }, [profile?.proposedMajor]);

  const fetchData = async (schoolList) => {
    if (!schoolList || schoolList.length === 0) { setCompData([]); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/colleges/compare', {
        schools: schoolList,
        major: profile?.proposedMajor,
        gpa: profile?.gpa,
        sat: profile?.sat,
        act: profile?.act,
        homeState: homeState || null,
      });
      setCompData(data);
    } catch (err) {
      console.error('Compare error:', err);
      setCompData(schoolList.map(name => ({ name })));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when schools or homeState changes
  useEffect(() => {
    if (schools.length === 0) { setCompData([]); return; }
    fetchData(schools);
  }, [schools, homeState]); // eslint-disable-line react-hooks/exhaustive-deps

  const addSchool = (name) => {
    if (!name || schools.some(s => s.toLowerCase() === name.toLowerCase()) || schools.length >= MAX_SCHOOLS) return;
    setSchools(prev => [...prev, name]);
    setAddOpen(false);
  };

  const removeSchool = (name) => {
    setSchools(prev => prev.filter(s => s !== name));
    setCompData(prev => prev.filter(d => d.name !== name));
  };

  const refreshData = () => fetchData(schools);

  const schoolDataMap = {};
  compData.forEach(d => { schoolDataMap[d.name] = d; });

  const metricsToShow = METRICS.map(m => {
    if (m.key === 'netCost') return { ...m, label: homeState ? `Est. Net Cost/yr (${homeState} resident)` : 'Est. Net Cost/yr', tooltip: homeState ? `Estimated cost after aid for a ${homeState} resident` : 'Estimated annual cost after typical aid' };
    if (m.key === 'tuitionOutOfState') return { ...m, label: homeState ? 'OOS Tuition (non-resident)' : 'OOS Tuition' };
    return m;
  });

  return (
    <div className="college-comparison">
      {/* Header */}
      <div className="college-comparison__header">
        <div className="college-comparison__title-row">
          <div style={{ flex: '1 1 0' }}>
            <h2 className="college-comparison__title">College Comparison</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0', fontWeight: 400 }}>
              Compare your schools side by side on cost, acceptance rate, and fit.
            </p>
          </div>
          <div className="comp-rationale-card">
            <h4 className="comp-rationale-title">How We Calculate</h4>
            <ul className="comp-rationale-list">
              <li><strong>Admit Rate, SAT, Tuition, Net Cost, Grad Rate, Retention, Earnings</strong> — Source: U.S. Dept. of Education, College Scorecard 2024</li>
              <li><strong>Location &amp; Type</strong> — Source: IPEDS, U.S. Dept. of Education</li>
              <li><strong>US News Rank</strong> — ~2024 published rankings (approximate)</li>
              <li><strong>Your Chance</strong> — AI estimate (rounded to 5%) using your GPA &amp; SAT vs published admit rate &amp; SAT range. <em>This is an estimate, not a guarantee of admission.</em></li>
            </ul>
          </div>
          <div className="college-comparison__actions">
            {!loading && schools.length > 0 && (
              <button className="comp-refresh-btn" onClick={refreshData} title="Refresh data">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 0113.93-3.36M20 15a8 8 0 01-13.93 3.36" />
                </svg>
                Refresh
              </button>
            )}
            {schools.length < MAX_SCHOOLS && (
              <button className="comp-add-trigger" onClick={() => setAddOpen(v => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add School
              </button>
            )}
          </div>
        </div>
        <div className="college-comparison__subtitle-row">
          <p className="college-comparison__subtitle">
            Real data: College Scorecard · IPEDS · US News · AI fills gaps
            {majorLabel && <span className="college-comparison__major-tag">{majorLabel}</span>}
          </p>
          <label className="comp-state-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home state:
            <select
              className="comp-state-select"
              value={homeState}
              onChange={e => {
                setHomeState(e.target.value);
                localStorage.setItem('homeState', e.target.value);
              }}
            >
              <option value="">Unknown</option>
              {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <AnimatePresence>
          {addOpen && (
            <AddSchoolInput
              onAdd={addSchool}
              onClose={() => setAddOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      {schools.length === 0 ? (
        <div className="college-comparison__empty">
          <p>No schools added yet. Add schools from your profile to compare them.</p>
        </div>
      ) : (
        <div className="college-comparison__scroll">
          <table className="comp-table">
            <thead>
              <tr>
                <th className="comp-th comp-th--metric">Metric</th>
                {schools.map(name => {
                  const colors = getSchoolColors(name) || DEFAULT_THEME;
                  return (
                    <th key={name} className="comp-th comp-th--school">
                      <div className="comp-school-header" style={{ borderTopColor: colors.primary }}>
                        <span className="comp-school-name" style={{ color: colors.primary }}>
                          {name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {schoolDataMap[name]?._dataSources?.scorecard && (
                            <span className="comp-data-badge comp-data-badge--real" title="Real data from College Scorecard">
                              ✓ Scorecard
                            </span>
                          )}
                          <button
                            className="comp-school-remove"
                            onClick={() => removeSchool(name)}
                            title={`Remove ${name}`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
                {schools.length < MAX_SCHOOLS && (
                  <th className="comp-th comp-th--add">
                    <button className="comp-th-add-btn" onClick={() => setAddOpen(true)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {metricsToShow.map((metric, i) => (
                <tr
                  key={metric.key}
                  className={`comp-tr ${metric.highlight ? 'comp-tr--highlight' : i % 2 === 0 ? 'comp-tr--even' : ''}`}
                >
                  <td className={`comp-td comp-td--metric ${metric.highlight ? 'comp-td--metric-highlight' : ''}`}>
                    <span className="comp-metric-icon">{metric.icon}</span>
                    <span className="comp-metric-label" title={metric.tooltip}>{metric.label}</span>
                    {metric.realData && (
                      <span className="comp-metric-source-badge" title="Real data from APIs">live</span>
                    )}
                    {metric.aiOnly && (
                      <span className="comp-metric-source-badge comp-metric-source-badge--ai" title="AI-estimated">AI</span>
                    )}
                  </td>
                  {schools.map((name, si) => {
                    const d = schoolDataMap[name];
                    const raw = d?.[metric.key];
                    const color = d ? metric.colorFn(raw, d) : null;
                    const cellDelay = si * 0.08;
                    return (
                      <td key={name} className={`comp-td comp-td--value ${metric.highlight ? 'comp-td--value-highlight' : ''}`}>
                        {loading && !d ? (
                          <span className="comp-skeleton" />
                        ) : metric.ring && raw != null ? (
                          <span className="comp-ring-cell">
                            <MiniRing value={raw} color={color || 'var(--color-primary)'} delay={cellDelay} />
                            <span style={{ color: color || undefined, fontWeight: metric.highlight ? 700 : 600, fontSize: metric.highlight ? '1.1rem' : undefined }}>
                              <AnimatedNumber value={raw} suffix={metric.suffix || ''} delay={cellDelay * 1000} />
                            </span>
                          </span>
                        ) : metric.counter && raw != null ? (
                          <span style={{ color: color || undefined, fontWeight: 500 }}>
                            <AnimatedNumber value={raw} delay={cellDelay * 1000} />
                          </span>
                        ) : metric.counterK && raw != null ? (
                          <span style={{ color: color || undefined, fontWeight: 500 }}>
                            <AnimatedNumber
                              value={Math.round(raw / 1000)}
                              prefix="$"
                              suffix={metric.enrollmentLabel
                                ? `k${raw >= 30000 ? ' (Large)' : raw >= 10000 ? ' (Medium)' : ' (Small)'}`
                                : 'k'}
                              delay={cellDelay * 1000}
                            />
                          </span>
                        ) : metric.static ? (
                          <span className="comp-value" style={color ? { color } : undefined}>
                            {d ? (metric.format ? metric.format(raw, d) : (raw ?? '—')) : '—'}
                          </span>
                        ) : (
                          <span className="comp-value">—</span>
                        )}
                      </td>
                    );
                  })}
                  {schools.length < MAX_SCHOOLS && <td className="comp-td comp-td--add" />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="college-comparison__loading">
          <div className="comp-dots">
            {[0, 1, 2].map(i => (
              <span key={i} className="comp-dot" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <span>Fetching comparison data…</span>
        </div>
      )}

      <p className="college-comparison__disclaimer">
        Data source: U.S. Dept. of Education, College Scorecard 2024. Location &amp; Type: IPEDS. US News Rank: ~2024 published rankings. "Your Chance" is an AI-generated estimate (rounded to nearest 5%) and is <strong>not a guarantee of admission</strong>. Always verify on each school's official site.
      </p>
    </div>
  );
}
