import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const CATEGORY_ICONS = {
  Testing: '📝',
  Application: '📋',
  Financial: '💰',
  Visit: '🏫',
  Portfolio: '🎨',
  Recommendation: '✉️',
  Other: '📌',
};

const _dark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const CATEGORY_COLORS_LIGHT = {
  Testing:        { bg: 'rgba(59, 130, 246, 0.08)',  color: '#2563EB', border: 'rgba(59, 130, 246, 0.2)' },
  Application:    { bg: 'rgba(139, 92, 246, 0.08)',  color: '#7C3AED', border: 'rgba(139, 92, 246, 0.2)' },
  Financial:      { bg: 'rgba(34, 197, 94, 0.08)',   color: '#16A34A', border: 'rgba(34, 197, 94, 0.2)' },
  Visit:          { bg: 'rgba(249, 115, 22, 0.08)',  color: '#EA580C', border: 'rgba(249, 115, 22, 0.2)' },
  Portfolio:      { bg: 'rgba(236, 72, 153, 0.08)',  color: '#DB2777', border: 'rgba(236, 72, 153, 0.2)' },
  Recommendation: { bg: 'rgba(234, 179, 8, 0.08)',   color: '#CA8A04', border: 'rgba(234, 179, 8, 0.2)' },
  Other:          { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: 'rgba(100, 116, 139, 0.2)' },
};
const CATEGORY_COLORS_DARK = {
  Testing:        { bg: 'rgba(125, 211, 252, 0.10)', color: '#7DD3FC', border: 'rgba(125, 211, 252, 0.18)' },
  Application:    { bg: 'rgba(196, 181, 253, 0.10)', color: '#C4B5FD', border: 'rgba(196, 181, 253, 0.18)' },
  Financial:      { bg: 'rgba(134, 239, 172, 0.10)', color: '#86EFAC', border: 'rgba(134, 239, 172, 0.18)' },
  Visit:          { bg: 'rgba(253, 186, 116, 0.10)', color: '#FDBA74', border: 'rgba(253, 186, 116, 0.18)' },
  Portfolio:      { bg: 'rgba(249, 168, 212, 0.10)', color: '#F9A8D4', border: 'rgba(249, 168, 212, 0.18)' },
  Recommendation: { bg: 'rgba(253, 230, 138, 0.10)', color: '#FDE68A', border: 'rgba(253, 230, 138, 0.18)' },
  Other:          { bg: 'rgba(168, 162, 158, 0.10)', color: '#A8A29E', border: 'rgba(168, 162, 158, 0.18)' },
};
const getCategoryColors = () => _dark() ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function TaskCard({ task, index, selected, onToggle }) {
  const colors = getCategoryColors();
  const cat = colors[task.category] || colors.Other;
  const icon = CATEGORY_ICONS[task.category] || '📌';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 400, damping: 30 }}
      className={`roadmap-task ${selected ? 'roadmap-task--selected' : ''}`}
      onClick={onToggle}
      style={{ '--cat-color': cat.color, '--cat-bg': cat.bg, '--cat-border': cat.border }}
    >
      {/* Selection checkbox */}
      <div className={`roadmap-task__check ${selected ? 'roadmap-task__check--on' : ''}`}>
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="#fff" strokeWidth={3.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </div>

      {/* Content */}
      <div className="roadmap-task__body">
        <div className="roadmap-task__top">
          <span className="roadmap-task__icon">{icon}</span>
          <span className="roadmap-task__title">{task.title}</span>
        </div>
        {task.description && (
          <p className="roadmap-task__desc">{task.description}</p>
        )}
        <div className="roadmap-task__meta">
          <span
            className="roadmap-task__pill"
            style={{ backgroundColor: cat.bg, color: cat.color }}
          >
            {task.category}
          </span>
          {task.dueDate && (
            <span className="roadmap-task__date">{formatDate(task.dueDate)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AIRoadmapModal({ open, onClose, userId, onTasksAccepted }) {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [phase, setPhase] = useState('idle'); // idle | loading | ready | accepting | done | error
  const [error, setError] = useState(null);

  // Reset state when opening
  useEffect(() => {
    if (open && phase === 'idle') {
      generateRoadmap();
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      // Delay reset so exit animation plays
      const t = setTimeout(() => {
        setTasks([]);
        setSelected(new Set());
        setPhase('idle');
        setError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function generateRoadmap() {
    setPhase('loading');
    setError(null);
    try {
      const { data } = await api.post('/generate/roadmap', {});
      setTasks(data.tasks);
      // Select all by default
      setSelected(new Set(data.tasks.map((_, i) => i)));
      setPhase('ready');
    } catch (err) {
      console.error('Roadmap generation failed:', err);
      setError(err.response?.data?.error || 'Failed to generate roadmap. Please try again.');
      setPhase('error');
    }
  }

  function toggleTask(index) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === tasks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tasks.map((_, i) => i)));
    }
  }

  async function handleAccept() {
    const selectedTasks = tasks.filter((_, i) => selected.has(i));
    if (selectedTasks.length === 0) return;

    setPhase('accepting');
    try {
      await onTasksAccepted(selectedTasks);
      setPhase('done');
      // Auto-close after success animation
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error('Failed to accept tasks:', err);
      setError('Failed to add tasks. Please try again.');
      setPhase('ready');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="roadmap-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="roadmap-panel"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="roadmap-header">
              <div className="roadmap-header__text">
                <div className="roadmap-header__badge">AI-Powered</div>
                <h2 className="roadmap-header__title">Your Next 90 Days</h2>
                <p className="roadmap-header__sub">
                  A personalized roadmap based on your profile, schools, and goals.
                </p>
              </div>
              <button className="roadmap-close" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="roadmap-body">
              {/* Loading state */}
              {phase === 'loading' && (
                <div className="roadmap-loading">
                  <div className="roadmap-loading__spinner" />
                  <p className="roadmap-loading__text">Analyzing your profile...</p>
                  <p className="roadmap-loading__sub">
                    Building a personalized plan tailored to your schools, major, and test scores
                  </p>
                </div>
              )}

              {/* Error state */}
              {phase === 'error' && (
                <div className="roadmap-error">
                  <span className="roadmap-error__icon">⚠️</span>
                  <p>{error}</p>
                  <button className="roadmap-error__retry" onClick={generateRoadmap}>
                    Try Again
                  </button>
                </div>
              )}

              {/* Success state */}
              {phase === 'done' && (
                <motion.div
                  className="roadmap-success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className="roadmap-success__icon">🎉</span>
                  <p className="roadmap-success__text">
                    {selected.size} tasks added to your dashboard!
                  </p>
                </motion.div>
              )}

              {/* Tasks list */}
              {(phase === 'ready' || phase === 'accepting') && (
                <>
                  <div className="roadmap-toolbar">
                    <button className="roadmap-toolbar__toggle" onClick={toggleAll}>
                      {selected.size === tasks.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="roadmap-toolbar__count">
                      {selected.size} of {tasks.length} selected
                    </span>
                  </div>

                  <div className="roadmap-tasks">
                    {tasks.map((task, i) => (
                      <TaskCard
                        key={i}
                        task={task}
                        index={i}
                        selected={selected.has(i)}
                        onToggle={() => toggleTask(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {(phase === 'ready' || phase === 'accepting') && (
              <div className="roadmap-footer">
                <button className="roadmap-footer__regenerate" onClick={generateRoadmap}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
                <button
                  className="roadmap-footer__accept"
                  onClick={handleAccept}
                  disabled={selected.size === 0 || phase === 'accepting'}
                >
                  {phase === 'accepting' ? (
                    <>
                      <div className="roadmap-footer__btn-spinner" />
                      Adding...
                    </>
                  ) : (
                    <>
                      Add {selected.size} Task{selected.size !== 1 ? 's' : ''} to Dashboard
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
