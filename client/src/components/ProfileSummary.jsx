import { motion, Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSchoolColors, getSchoolShortName } from '../utils/schoolColors';

export default function ProfileSummary({ profile, completionPercent, onReorderSchools, onEditSchools }) {
  const stats = [
    { label: 'GPA', value: profile?.gpa?.toFixed(2) || '--', accent: false },
    { label: 'SAT', value: profile?.sat || '--', accent: false },
    { label: 'Major', value: profile?.proposedMajor || '--', small: true },
    { label: 'Progress', value: `${completionPercent}%`, accent: true },
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
      {/* Stats on the left — vertical metric layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
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
      </div>

      {/* School icons on the right */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        {orderedSchools.length > 0 ? (
          <>
            <Reorder.Group
              axis="x"
              values={orderedSchools}
              onReorder={handleReorder}
              className="flex items-center gap-3"
              as="div"
            >
              {orderedSchools.map((school, i) => (
                <SchoolIcon key={school.name} school={school} index={i} />
              ))}
            </Reorder.Group>
            <button
              onClick={onEditSchools}
              className="text-text-muted hover:text-text transition-colors"
              style={{ fontSize: 'var(--font-size-micro)' }}
            >
              edit schools
            </button>
          </>
        ) : (
          <button
            onClick={onEditSchools}
            className="flex flex-col items-center gap-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span
              className="font-medium text-text-muted"
              style={{ fontSize: 'var(--font-size-micro)' }}
            >
              Add Schools
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SchoolIcon({ school, index }) {
  const colors = getSchoolColors(school.name);
  const shortName = getSchoolShortName(school.name);

  return (
    <Reorder.Item
      value={school}
      as="div"
      className="relative group cursor-grab active:cursor-grabbing"
      whileDrag={{ scale: 1.15, zIndex: 50 }}
    >
      <div
        className="w-16 h-16 rounded-full border-3 shadow-md flex items-center justify-center overflow-hidden"
        style={{
          borderColor: colors?.primary || '#888',
          backgroundColor: colors?.primary || '#666',
        }}
        title={`${index === 0 ? '#1: ' : ''}${school.name}`}
      >
        <span
          className="text-white font-bold leading-tight text-center select-none px-1"
          style={{ fontSize: 'var(--font-size-micro)' }}
        >
          {shortName}
        </span>
      </div>
      {index === 0 && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white font-bold flex items-center justify-center shadow-md"
          style={{
            backgroundColor: colors?.accent || '#f5a623',
            fontSize: '9px',
          }}
        >
          1
        </div>
      )}
      {/* Tooltip */}
      <div
        className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
        style={{ fontSize: 'var(--font-size-micro)' }}
      >
        {index === 0 ? 'Top choice' : `#${index + 1}`}: {school.name}
      </div>
    </Reorder.Item>
  );
}
