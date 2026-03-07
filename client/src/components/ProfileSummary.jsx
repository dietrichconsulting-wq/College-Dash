import { motion, Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSchoolColors, getSchoolShortName } from '../utils/schoolColors';

export default function ProfileSummary({ profile, completionPercent, onReorderSchools, onEditSchools }) {
  const stats = [
    { label: 'GPA', value: profile?.gpa?.toFixed(2) || '--' },
    { label: 'SAT', value: profile?.sat || '--' },
    { label: 'Major', value: profile?.proposedMajor || '--' },
    { label: 'Progress', value: `${completionPercent}%` },
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
      className="flex items-start justify-between gap-6 mb-6 w-full"
    >
      {/* Stats on the left */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-text-muted font-medium uppercase tracking-wide">{s.label}</div>
            <div className="text-xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{s.value}</div>
          </div>
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
              className="text-[10px] text-text-muted hover:text-text transition-colors"
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
            <span className="text-xs font-medium text-text-muted">Add Schools</span>
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
        <span className="text-white text-[11px] font-bold leading-tight text-center select-none px-1">
          {shortName}
        </span>
      </div>
      {index === 0 && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-md"
          style={{ backgroundColor: colors?.accent || '#f5a623' }}
        >
          1
        </div>
      )}
      {/* Tooltip */}
      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {index === 0 ? 'Top choice' : `#${index + 1}`}: {school.name}
      </div>
    </Reorder.Item>
  );
}
