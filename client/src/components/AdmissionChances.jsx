import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSchoolColors, getSchoolShortName } from '../utils/schoolColors';
import api from '../utils/api';

function getChanceLevel(chance) {
  if (chance >= 70) return { label: 'Strong', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)' };
  if (chance >= 50) return { label: 'Good', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)' };
  if (chance >= 30) return { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' };
  return { label: 'Reach', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' };
}

function ChanceRing({ percent, color, size = 64 }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  const empty = circumference - filled;

  return (
    <div className="chance-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: empty }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <motion.span
        className="chance-ring__value"
        style={{ color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      >
        {percent}%
      </motion.span>
    </div>
  );
}

function SchoolChanceCard({ data, index }) {
  const level = getChanceLevel(data.chance);
  const schoolColors = getSchoolColors(data.schoolName);
  const shortName = getSchoolShortName(data.schoolName);
  const accentColor = schoolColors?.primary || level.color;

  return (
    <motion.div
      className="chance-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* School color accent bar */}
      <div className="chance-card__accent" style={{ backgroundColor: accentColor }} />

      <div className="chance-card__body">
        {/* Left: ring */}
        <ChanceRing percent={data.chance} color={level.color} />

        {/* Right: info */}
        <div className="chance-card__info">
          <span className="chance-card__school">{shortName}</span>
          <span className="chance-card__label" style={{ color: level.color, backgroundColor: level.bg }}>
            {level.label}
          </span>

          {/* Stats row */}
          <div className="chance-card__stats">
            {data.admissionRate != null && (
              <span className="chance-card__stat">
                Admit: {Math.round(data.admissionRate * 100)}%
              </span>
            )}
            {data.avgSAT && (
              <span className="chance-card__stat">
                Avg SAT: {data.avgSAT}
              </span>
            )}
          </div>

          {/* AI Tip or Math tip */}
          {data.aiTip ? (
            <div className="chance-card__tip">
              <svg className="chance-card__tip-icon" style={{ color: '#8b5cf6' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>
                <strong>AI Insight:</strong> {data.aiTip}
              </span>
            </div>
          ) : data.improvement ? (
            <div className="chance-card__tip">
              <svg className="chance-card__tip-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>
                SAT {data.improvement.improvedSAT} → <strong>{data.improvement.improvedChance}%</strong>
                <span className="chance-card__tip-delta"> (+{data.improvement.delta})</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdmissionChances({ userId, profile }) {
  const [chances, setChances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Build a stable key from the profile fields that affect chances
  const profileKey = [
    profile?.gpa,
    profile?.sat,
    profile?.proposedMajor,
    ...(profile?.schools || []).map(s => s?.name),
  ].join('|');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);

    api.get(`/colleges/chances/${userId}`)
      .then(({ data }) => { if (!cancelled) setChances(data.chances || []); })
      .catch(() => { if (!cancelled) setChances([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId, profileKey, refreshKey]); // re-fetch when profile changes or manual refresh

  if (!loading && chances.length === 0) return null;

  return (
    <div className="admission-chances">
      <div className="admission-chances__header">
        <h2 className="admission-chances__title">Likelihood of Acceptance</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="admission-chances__badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Predicted
          </span>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            title="Recalculate admission chances"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 500, padding: '3px 8px',
              borderRadius: '6px', border: '1px solid var(--color-border)',
              background: 'transparent', color: 'var(--color-text-muted)',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              style={{ animation: loading ? 'roadmap-spin 0.8s linear infinite' : 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Calculating…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Calculating your chances…
        </div>
      ) : (
        <div className="admission-chances__grid">
          {chances.map((c, i) => (
            <SchoolChanceCard key={c.schoolId} data={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
