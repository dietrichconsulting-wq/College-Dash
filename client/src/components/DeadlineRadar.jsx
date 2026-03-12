import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonLine, SkeletonCircle } from './Skeleton';

function DeadlineRadarSkeleton() {
  return (
    <div className="deadline-radar" style={{ marginTop: '2.5rem' }}>
      <div className="skeleton" style={{ width: 130, height: 20, borderRadius: 6, marginBottom: 16 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 8, borderRadius: 10, background: 'var(--color-column)' }}>
          <SkeletonCircle size={32} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkeletonLine width="60%" height={12} />
            <SkeletonLine width="35%" height={9} />
          </div>
          <SkeletonLine width={50} height={20} />
        </div>
      ))}
    </div>
  );
}

// How full the urgency bar appears: overdue/urgent = nearly full, later = small
function urgencyFill(daysLeft) {
  if (daysLeft < 0)  return 1.0;
  if (daysLeft <= 3) return 0.92;
  if (daysLeft <= 7) return 0.78;
  if (daysLeft <= 14) return 0.58;
  if (daysLeft <= 30) return 0.35;
  return 0.14;
}

const CATEGORY_ICONS = {
  Testing: '📝',
  Application: '📋',
  Financial: '💰',
  Visit: '🏫',
  Portfolio: '🎨',
  Recommendation: '✉️',
  Other: '📌',
};

function getUrgency(daysLeft) {
  if (daysLeft < 0) return { level: 'overdue', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', label: 'Overdue' };
  if (daysLeft <= 3) return { level: 'urgent', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.06)', label: 'Urgent' };
  if (daysLeft <= 7) return { level: 'high', color: '#F97316', bg: 'rgba(249, 115, 22, 0.06)', label: 'This week' };
  if (daysLeft <= 14) return { level: 'warning', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.06)', label: '2 weeks' };
  if (daysLeft <= 30) return { level: 'upcoming', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.04)', label: 'This month' };
  return { level: 'later', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.04)', label: 'On track' };
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatRelative(daysLeft) {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return `${daysLeft}d left`;
}

export default function DeadlineRadar({ columns, loading }) {
  if (loading) return <DeadlineRadarSkeleton />;
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const active = [
      ...(columns['To Do'] || []),
      ...(columns['In Progress'] || []),
    ];

    return active
      .filter(t => t.dueDate)
      .map(t => {
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        return { ...t, daysLeft, urgency: getUrgency(daysLeft) };
      })
      .filter(t => t.daysLeft <= 60) // Next 60 days + overdue
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 8); // Show top 8
  }, [columns]);

  if (upcomingTasks.length === 0) return null;

  // Summary counts
  const overdueCount = upcomingTasks.filter(t => t.daysLeft < 0).length;
  const urgentCount = upcomingTasks.filter(t => t.daysLeft >= 0 && t.daysLeft <= 7).length;

  return (
    <div className="deadline-radar">
      <div className="deadline-radar__header">
        <div className="deadline-radar__title-row">
          <h2 className="deadline-radar__title">Deadline Radar</h2>
          <span className="deadline-radar__window">Next 60 days</span>
        </div>
        {(overdueCount > 0 || urgentCount > 0) && (
          <div className="deadline-radar__alerts">
            {overdueCount > 0 && (
              <span className="deadline-radar__alert deadline-radar__alert--red">
                {overdueCount} overdue
              </span>
            )}
            {urgentCount > 0 && (
              <span className="deadline-radar__alert deadline-radar__alert--orange">
                {urgentCount} this week
              </span>
            )}
          </div>
        )}
      </div>

      <div className="deadline-radar__timeline">
        <AnimatePresence>
          {upcomingTasks.map((task, i) => (
            <motion.div
              key={task.taskId}
              className="deadline-radar__item"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Timeline connector */}
              <div className="deadline-radar__connector">
                <div
                  className="deadline-radar__dot"
                  style={{ backgroundColor: task.urgency.color }}
                />
                {i < upcomingTasks.length - 1 && (
                  <div className="deadline-radar__line" />
                )}
              </div>

              {/* Content */}
              <div
                className="deadline-radar__card"
                style={{
                  borderLeftColor: task.urgency.color,
                  backgroundColor: task.urgency.bg,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div className="deadline-radar__card-top">
                  <span className="deadline-radar__date" style={{ color: task.urgency.color }}>
                    {formatDateShort(task.dueDate)}
                  </span>
                  <span className="deadline-radar__relative" style={{ color: task.urgency.color }}>
                    {formatRelative(task.daysLeft)}
                  </span>
                </div>
                <div className="deadline-radar__card-body">
                  <span className="deadline-radar__icon">
                    {CATEGORY_ICONS[task.category] || '📌'}
                  </span>
                  <span className="deadline-radar__task-title">{task.title}</span>
                </div>
                {/* Animated urgency fill bar at bottom */}
                <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
                  <motion.div
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: task.urgency.color,
                      transformOrigin: 'left',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: urgencyFill(task.daysLeft) }}
                    transition={{ delay: i * 0.06 + 0.4, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
