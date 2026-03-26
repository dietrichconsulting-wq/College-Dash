import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddTaskModal from './AddTaskModal';
import { SkeletonLine } from './Skeleton';

function TaskListSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 90, height: 20, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 120, height: 32, borderRadius: 8 }} />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginBottom: 6, borderRadius: 10, background: 'var(--color-column)' }}>
          <div className="skeleton" style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkeletonLine width={`${55 + (i % 3) * 15}%`} height={13} />
            <SkeletonLine width="28%" height={9} />
          </div>
          <SkeletonLine width={60} height={22} />
        </div>
      ))}
    </div>
  );
}

// ── Category palette — desaturated pastels for dark mode ──
const _dark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const CATEGORY_LIGHT = {
  Testing:        { bg: 'rgba(59, 130, 246, 0.08)',  color: '#2563EB' },
  Application:    { bg: 'rgba(139, 92, 246, 0.08)',  color: '#7C3AED' },
  Financial:      { bg: 'rgba(34, 197, 94, 0.08)',   color: '#16A34A' },
  Visit:          { bg: 'rgba(249, 115, 22, 0.08)',  color: '#EA580C' },
  Portfolio:      { bg: 'rgba(236, 72, 153, 0.08)',  color: '#DB2777' },
  Recommendation: { bg: 'rgba(234, 179, 8, 0.08)',   color: '#CA8A04' },
  Other:          { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569' },
};
const CATEGORY_DARK = {
  Testing:        { bg: 'rgba(125, 211, 252, 0.10)', color: '#7DD3FC' },
  Application:    { bg: 'rgba(196, 181, 253, 0.10)', color: '#C4B5FD' },
  Financial:      { bg: 'rgba(134, 239, 172, 0.10)', color: '#86EFAC' },
  Visit:          { bg: 'rgba(253, 186, 116, 0.10)', color: '#FDBA74' },
  Portfolio:      { bg: 'rgba(249, 168, 212, 0.10)', color: '#F9A8D4' },
  Recommendation: { bg: 'rgba(253, 230, 138, 0.10)', color: '#FDE68A' },
  Other:          { bg: 'rgba(168, 162, 158, 0.10)', color: '#A8A29E' },
};
const getCategoryStyles = () => _dark() ? CATEGORY_DARK : CATEGORY_LIGHT;
const DEFAULT_PILL = { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569' };

// ── Priority helpers — derived from due date urgency ──
function getPriority(task) {
  if (!task.dueDate) return 'none';
  const now = new Date();
  const due = new Date(task.dueDate);
  const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 3) return 'urgent';
  if (daysLeft <= 7) return 'high';
  if (daysLeft <= 14) return 'medium';
  return 'low';
}

const PRIORITY_META = {
  overdue: { color: '#EF4444', label: 'Overdue', icon: '🔴' },
  urgent: { color: '#F97316', label: 'Urgent', icon: '🟠' },
  high: { color: '#F59E0B', label: 'High', icon: '🟡' },
  medium: { color: '#3B82F6', label: 'Medium', icon: '🔵' },
  low: { color: '#22C55E', label: 'Low', icon: '🟢' },
  none: { color: '#94A3B8', label: 'No date', icon: '⚪' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const due = new Date(dateStr);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= 7) return `${diff}d left`;
  return `${diff}d left`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return (
    new Date(dateStr) < new Date() &&
    new Date(dateStr).toDateString() !== new Date().toDateString()
  );
}

// ── Snooze helper: bump due date by N days ──
function snoozeDate(dateStr, days = 3) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ── Individual Task Row ──
function TaskRow({ task, index, onDone, onEdit, onDelete, onSnooze, readOnly }) {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const priority = getPriority(task);
  const pm = PRIORITY_META[priority];
  const pill = getCategoryStyles()[task.category] || DEFAULT_PILL;

  const handleComplete = useCallback(() => {
    setCompleting(true);
    setTimeout(() => onDone(task), 500);
  }, [onDone, task]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: completing ? 0 : 1,
        y: 0,
        scale: completing ? 0.97 : 1,
      }}
      exit={{ opacity: 0, x: 40, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35, delay: index * 0.015 }}
      className="task-row group"
      style={{ '--priority-color': pm.color }}
    >
      {/* Priority stripe */}
      <div className="task-row__stripe" />

      {/* Main content area */}
      <div className="task-row__body">
        {/* Top line: checkbox + title + meta */}
        <div className="task-row__header">
          {/* Checkbox */}
          {!readOnly && <button
            onClick={handleComplete}
            className="task-row__check"
            title="Mark as done"
            aria-label="Mark task as done"
          >
            <motion.svg
              className="task-row__check-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </button>}

          {/* Title + Category pill — click to expand */}
          <div
            className="task-row__info"
            onClick={() => setExpanded(!expanded)}
            title="Click to expand details"
          >
            <span className="task-row__title">{task.title}</span>
            <span
              className="task-row__pill"
              style={{ backgroundColor: pill.bg, color: pill.color }}
            >
              {task.category}
            </span>
          </div>

          {/* Right side: due + priority + expand chevron */}
          <div className="task-row__meta">
            {task.dueDate ? (
              <span
                className={`task-row__due ${isOverdue(task.dueDate) ? 'task-row__due--overdue' : ''}`}
              >
                {isOverdue(task.dueDate) && (
                  <svg className="task-row__due-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {formatDate(task.dueDate)}
              </span>
            ) : (
              <span className="task-row__due task-row__due--none">No date</span>
            )}

            {/* Expand/collapse chevron */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="task-row__expand-btn"
              title={expanded ? 'Collapse details' : 'Expand details'}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              <motion.svg
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="task-row__expand-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </motion.svg>
            </button>
          </div>
        </div>

        {/* Quick actions bar — appears on hover */}
        {!readOnly && (
          <div className="task-row__actions">
            <button onClick={() => onEdit(task)} className="task-row__action-btn">
              <svg className="task-row__action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <span className="task-row__action-divider" />
            <button onClick={() => onSnooze(task)} className="task-row__action-btn">
              <svg className="task-row__action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Snooze
            </button>
            <span className="task-row__action-divider" />
            <button onClick={handleComplete} className="task-row__action-btn task-row__action-btn--complete">
              <svg className="task-row__action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
          </div>
        )}

        {/* Expandable detail section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="task-row__details"
            >
              <div className="task-row__details-inner">
                {/* Detail grid */}
                <div className="task-row__detail-grid">
                  <div className="task-row__detail-item">
                    <span className="task-row__detail-label">Priority</span>
                    <span className="task-row__detail-value" style={{ color: pm.color }}>
                      {pm.icon} {pm.label}
                    </span>
                  </div>
                  <div className="task-row__detail-item">
                    <span className="task-row__detail-label">Category</span>
                    <span className="task-row__detail-value" style={{ color: pill.color }}>
                      {task.category}
                    </span>
                  </div>
                  <div className="task-row__detail-item">
                    <span className="task-row__detail-label">Status</span>
                    <span className="task-row__detail-value">{task.status}</span>
                  </div>
                  {task.dueDate && (
                    <div className="task-row__detail-item">
                      <span className="task-row__detail-label">Time left</span>
                      <span
                        className="task-row__detail-value"
                        style={{ color: isOverdue(task.dueDate) ? '#EF4444' : undefined }}
                      >
                        {formatRelative(task.dueDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {task.description && (
                  <p className="task-row__description">{task.description}</p>
                )}

                {/* Inline actions */}
                {!readOnly && (
                  <div className="task-row__detail-actions">
                    <button onClick={() => onEdit(task)} className="task-row__detail-btn">
                      ✏️ Edit
                    </button>
                    <button onClick={() => onSnooze(task)} className="task-row__detail-btn">
                      ⏰ Snooze 3 days
                    </button>
                    <button
                      onClick={() => onDelete(task.taskId)}
                      className="task-row__detail-btn task-row__detail-btn--danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main TaskList ──
export default function TaskList({
  columns,
  loading = false,
  onMoveTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskCompleted,
  openAddTaskTrigger,
  onOpenRoadmap,
  readOnly,
}) {
  if (loading) return <TaskListSkeleton />;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDone, setShowDone] = useState(false);

  // Open add-task modal when triggered from command bar
  useEffect(() => {
    if (openAddTaskTrigger) {
      setEditingTask(null);
      setModalOpen(true);
    }
  }, [openAddTaskTrigger]);

  const activeTasks = [...(columns['To Do'] || []), ...(columns['In Progress'] || [])];
  const doneTasks = columns['Done'] || [];

  // Sort by urgency: overdue → soonest due → no date last
  activeTasks.sort((a, b) => {
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  const handleDone = (task) => {
    onMoveTask(task.taskId, 'Done', 0);
    if (onTaskCompleted) onTaskCompleted();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSnooze = async (task) => {
    const newDate = snoozeDate(task.dueDate, 3);
    await onUpdateTask(task.taskId, { ...task, dueDate: newDate });
  };

  const handleSave = async (taskData) => {
    if (editingTask) {
      await onUpdateTask(editingTask.taskId, taskData);
      setEditingTask(null);
    } else {
      await onCreateTask(taskData);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="task-list__header">
        <div>
          <h2 className="task-list__title">Your Tasks</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0', fontWeight: 400 }}>
            Track every step of your college application — check them off as you go.
          </p>
        </div>
        <div className="task-list__header-right">
          <span className="task-list__count">{activeTasks.length} remaining</span>
          {!readOnly && onOpenRoadmap && (
            <button className="roadmap-cta" onClick={onOpenRoadmap}>
              <span className="roadmap-cta__sparkle">✨</span>
              AI Roadmap
            </button>
          )}
          {!readOnly && (
            <button
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
              className="task-list__add-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Active Tasks */}
      <div className="task-list__container">
        {activeTasks.length === 0 ? (
          <div className="task-list__empty">
            <span className="task-list__empty-icon">🎉</span>
            <p>All tasks complete! Great job!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeTasks.map((task, i) => (
              <TaskRow
                key={task.taskId}
                task={task}
                index={i}
                onDone={handleDone}
                onEdit={handleEdit}
                onDelete={onDeleteTask}
                onSnooze={handleSnooze}
                readOnly={readOnly}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Done section */}
      {doneTasks.length > 0 && (
        <div className="task-list__done-section">
          <button
            onClick={() => setShowDone(!showDone)}
            className="task-list__done-toggle"
          >
            <motion.svg
              animate={{ rotate: showDone ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="task-list__done-chevron"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </motion.svg>
            Done ({doneTasks.length})
          </button>

          <AnimatePresence>
            {showDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="task-list__done-container"
              >
                {doneTasks.map((task, i) => {
                  const pill = getCategoryStyles()[task.category] || DEFAULT_PILL;
                  return (
                    <div key={task.taskId} className={`task-done-row ${i > 0 ? 'task-done-row--bordered' : ''}`}>
                      <div className="task-done-row__check">
                        <svg className="task-done-row__check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="task-done-row__title">{task.title}</span>
                      <span
                        className="task-row__pill"
                        style={{ backgroundColor: pill.bg, color: pill.color }}
                      >
                        {task.category}
                      </span>
                      {task.completedAt && (
                        <span className="task-done-row__date">{formatDate(task.completedAt)}</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AddTaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        task={editingTask}
      />
    </div>
  );
}
