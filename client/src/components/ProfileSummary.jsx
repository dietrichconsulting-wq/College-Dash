import { motion, Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSchoolColors, getSchoolShortName } from '../utils/schoolColors';

// ── Radial Progress Ring ──
function ProgressRing({ percent = 0 }) {
  const size = 88;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  const empty = circumference - filled;

  // Color gradient based on progress
  const getColor = (pct) => {
    if (pct >= 80) return 'var(--color-success)';
    if (pct >= 50) return '#3B82F6';
    if (pct >= 25) return '#F59E0B';
    return 'var(--color-primary)';
  };

  const color = getColor(percent);

  return (
    <div className="progress-ring">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="progress-ring__svg"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Animated filled arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: empty }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>
      {/* Center text */}
      <div className="progress-ring__label">
        <motion.span
          className="progress-ring__value"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
        >
          {percent}%
        </motion.span>
        <span className="progress-ring__caption">complete</span>
      </div>
    </div>
  );
}

export default function ProfileSummary({ profile, completionPercent, onReorderSchools, onEditSchools }) {
  const stats = [
    { label: 'GPA', value: profile?.gpa?.toFixed(2) || '--', accent: false },
    { label: 'SAT', value: profile?.sat || '--', accent: false },
    { label: 'Major', value: profile?.proposedMajor || '--', small: true },
  ];

  const schools = (profile?.schools || []).filter(s => s?.name && s.name.trim() !== '');
  const [orderedSchools, setOrderedSchools] = useState(schools);

  useEffect(() => {
    const filtered = (profile?.schools || []).filter(s => s?.name && s.name.trim() !== '');
    setOrderedSchools(filtered);
  }, [profile?.schools]);

  const handleReorder = (newOrder) => {
    setOrderedSchools(newOrder);
    if (onReorderSchools) {
      onReorderSchools(newOrder);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-start justify-between gap-6 mb-8 w-full"
    >
      {/* Stats + Progress ring on the left */}
      <div className="profile-stats-row">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="card-elevated px-5 py-5 flex flex-col gap-1"
          >
            <span
              className="uppercase tracking-wider font-medium"
              style={{
                fontSize: 'var(--font-size-micro)',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              {s.label}
            </span>
            <span
              className="font-bold leading-none"
              style={{
                fontSize: s.small ? 'var(--font-size-section-header)' : 'var(--font-size-card-metric)',
                color: s.accent ? 'var(--color-success)' : 'var(--color-primary)',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              {s.value}
            </span>
          </motion.div>
        ))}

        {/* Progress Ring Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + stats.length * 0.06 }}
          className="card-elevated progress-ring-card"
        >
          <span className="progress-ring-card__label">PROGRESS</span>
          <ProgressRing percent={completionPercent} />
        </motion.div>
      </div>

      {/* School chips */}
      <div className="school-chips-section">
        {orderedSchools.length > 0 ? (
          <>
            <span className="school-chips-section__label">YOUR SCHOOLS</span>
            <Reorder.Group
              axis="x"
              values={orderedSchools}
              onReorder={handleReorder}
              className="school-chips-row"
              as="div"
            >
              {orderedSchools.map((school, i) => (
                <SchoolChip key={school.name} school={school} index={i} isTop={i === 0} />
              ))}
            </Reorder.Group>
            <button
              onClick={onEditSchools}
              className="school-chips-section__edit"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              edit schools
            </button>
          </>
        ) : (
          <button
            onClick={onEditSchools}
            className="school-chips-section__add"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Schools
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SchoolChip({ school, index, isTop }) {
  const colors = getSchoolColors(school.name);
  const shortName = getSchoolShortName(school.name);
  const primaryColor = colors?.primary || '#2563EB';

  return (
    <Reorder.Item
      value={school}
      as="div"
      className="school-chip-wrapper"
      whileDrag={{ scale: 1.08, zIndex: 50 }}
    >
      <motion.div
        className={`school-chip ${isTop ? 'school-chip--active' : ''}`}
        style={
          isTop
            ? {
              background: primaryColor,
              color: '#fff',
              borderColor: primaryColor,
              boxShadow: `0 2px 10px ${primaryColor}30`,
            }
            : {
              background: `${primaryColor}0A`,
              color: primaryColor,
              borderColor: `${primaryColor}25`,
            }
        }
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        title={`${isTop ? '#1 – ' : `#${index + 1} – `}${school.name} (drag to reorder)`}
      >
        {isTop && <span className="school-chip__badge">★</span>}
        <span className="school-chip__name">{shortName}</span>
      </motion.div>
    </Reorder.Item>
  );
}
