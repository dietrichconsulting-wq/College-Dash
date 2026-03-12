import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScholarships } from '../hooks/useScholarships';
import { SkeletonCard } from './Skeleton';

function ScholarshipPipelineSkeleton() {
  return (
    <div className="scholarship-pipeline">
      <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 6, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ width: '60%', height: 14, borderRadius: 6 }} />
            {Array.from({ length: 2 + (col % 2) }).map((__, i) => (
              <SkeletonCard key={i} lines={3} height={90} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const STAGES = [
  { key: 'Researching', label: 'Researching', icon: '🔍', color: '#8B5CF6' },
  { key: 'Applying',    label: 'Applying',    icon: '✏️', color: '#3B82F6' },
  { key: 'Submitted',   label: 'Submitted',   icon: '📨', color: '#F59E0B' },
  { key: 'Won',         label: 'Won',          icon: '🏆', color: '#22C55E' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFFICULTY_COLORS = {
  Easy:   { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)' },
  Medium: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  Hard:   { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' },
};

function formatAmount(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// ── Add / Edit Modal ──

function ScholarshipFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {
    name: '', amount: '', deadline: '', essayRequired: false,
    difficulty: 'Medium', url: '', notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      amount: form.amount ? Number(form.amount) : null,
      deadline: form.deadline || null,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="scholarship-modal-overlay" onClick={onClose}>
      <motion.div
        className="scholarship-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="scholarship-modal__title">
          {initial ? 'Edit Scholarship' : 'Add Scholarship'}
        </h3>

        <form onSubmit={handleSubmit} className="scholarship-modal__form">
          <label className="scholarship-modal__label">
            Name *
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Coca-Cola Scholars"
              className="scholarship-modal__input"
              autoFocus
            />
          </label>

          <div className="scholarship-modal__row">
            <label className="scholarship-modal__label">
              Award Amount
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="5000"
                className="scholarship-modal__input"
              />
            </label>
            <label className="scholarship-modal__label">
              Deadline
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="scholarship-modal__input"
              />
            </label>
          </div>

          <div className="scholarship-modal__row">
            <label className="scholarship-modal__label">
              Difficulty
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="scholarship-modal__input"
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="scholarship-modal__label scholarship-modal__checkbox-label">
              <input
                type="checkbox"
                checked={form.essayRequired}
                onChange={(e) => setForm({ ...form, essayRequired: e.target.checked })}
              />
              Essay Required
            </label>
          </div>

          <label className="scholarship-modal__label">
            URL
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="scholarship-modal__input"
            />
          </label>

          <label className="scholarship-modal__label">
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any notes..."
              className="scholarship-modal__input scholarship-modal__textarea"
              rows={2}
            />
          </label>

          <div className="scholarship-modal__actions">
            <button type="button" onClick={onClose} className="scholarship-modal__btn scholarship-modal__btn--cancel">
              Cancel
            </button>
            <button type="submit" className="scholarship-modal__btn scholarship-modal__btn--save">
              {initial ? 'Save Changes' : 'Add Scholarship'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Scholarship Card ──

function ScholarshipCard({ scholarship, stageIndex, onMove, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const diff = DIFFICULTY_COLORS[scholarship.difficulty] || DIFFICULTY_COLORS.Medium;
  const days = daysUntil(scholarship.deadline);
  const isUrgent = days !== null && days <= 7 && days >= 0;
  const isOverdue = days !== null && days < 0;

  return (
    <motion.div
      className="scholarship-card"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Header row */}
      <div className="scholarship-card__header">
        <span className="scholarship-card__name" title={scholarship.name}>
          {scholarship.name}
        </span>
        <div className="scholarship-card__menu-wrap">
          <button
            className="scholarship-card__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Actions"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div className="scholarship-card__menu" onClick={() => setMenuOpen(false)}>
              <button onClick={() => onEdit(scholarship)}>Edit</button>
              {STAGES.filter((_, i) => i !== stageIndex).map(s => (
                <button key={s.key} onClick={() => onMove(scholarship.scholarshipId, s.key)}>
                  Move to {s.label}
                </button>
              ))}
              <button className="scholarship-card__menu-delete" onClick={() => onDelete(scholarship.scholarshipId)}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Amount badge */}
      {scholarship.amount && (
        <div className="scholarship-card__amount">
          {formatAmount(scholarship.amount)}
        </div>
      )}

      {/* Meta row */}
      <div className="scholarship-card__meta">
        {scholarship.deadline && (
          <span className={`scholarship-card__deadline ${isOverdue ? 'scholarship-card__deadline--overdue' : isUrgent ? 'scholarship-card__deadline--urgent' : ''}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatDeadline(scholarship.deadline)}
            {isOverdue && <span className="scholarship-card__days-badge">Overdue</span>}
            {isUrgent && !isOverdue && <span className="scholarship-card__days-badge">{days}d</span>}
          </span>
        )}
        {scholarship.essayRequired && (
          <span className="scholarship-card__essay">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Essay
          </span>
        )}
        <span className="scholarship-card__difficulty" style={{ color: diff.color, backgroundColor: diff.bg }}>
          {scholarship.difficulty}
        </span>
      </div>

      {/* URL link */}
      {scholarship.url && (
        <a
          href={scholarship.url}
          target="_blank"
          rel="noopener noreferrer"
          className="scholarship-card__link"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Apply
        </a>
      )}
    </motion.div>
  );
}

// ── Pipeline Column ──

function PipelineColumn({ stage, items, stageIndex, onAdd, onMove, onEdit, onDelete }) {
  const totalAmount = items.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="pipeline-column">
      <div className="pipeline-column__header">
        <div className="pipeline-column__title-row">
          <span className="pipeline-column__icon">{stage.icon}</span>
          <span className="pipeline-column__label">{stage.label}</span>
          <span className="pipeline-column__count" style={{ backgroundColor: stage.color + '18', color: stage.color }}>
            {items.length}
          </span>
        </div>
        {totalAmount > 0 && (
          <span className="pipeline-column__total">
            {formatAmount(totalAmount)}
          </span>
        )}
      </div>

      <div className="pipeline-column__accent" style={{ backgroundColor: stage.color }} />

      <div className="pipeline-column__cards">
        <AnimatePresence mode="popLayout">
          {items.map(s => (
            <ScholarshipCard
              key={s.scholarshipId}
              scholarship={s}
              stageIndex={stageIndex}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="pipeline-column__empty">
            No scholarships yet
          </div>
        )}
      </div>

      <button className="pipeline-column__add" onClick={onAdd}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add
      </button>
    </div>
  );
}

// ── Main Component ──

export default function ScholarshipPipeline({ userId }) {
  const { columns, loading, createScholarship, updateScholarship, moveScholarship, deleteScholarship } = useScholarships(userId);
  const [formOpen, setFormOpen] = useState(false);
  const [addStage, setAddStage] = useState('Researching');
  const [editTarget, setEditTarget] = useState(null);

  const totalCount = Object.values(columns).reduce((sum, arr) => sum + arr.length, 0);
  const totalWon = columns.Won.reduce((sum, s) => sum + (s.amount || 0), 0);

  const handleAdd = (stage) => {
    setAddStage(stage);
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (scholarship) => {
    setEditTarget(scholarship);
    setFormOpen(true);
  };

  const handleSave = async (formData) => {
    if (editTarget) {
      await updateScholarship(editTarget.scholarshipId, formData);
    } else {
      await createScholarship({ ...formData, stage: addStage });
    }
  };

  if (loading) return <ScholarshipPipelineSkeleton />;

  return (
    <div className="scholarship-pipeline">
      <div className="scholarship-pipeline__header">
        <div className="scholarship-pipeline__title-row">
          <h2 className="scholarship-pipeline__title">Scholarship Pipeline</h2>
          {totalCount > 0 && (
            <span className="scholarship-pipeline__badge">{totalCount} tracked</span>
          )}
        </div>
        {totalWon > 0 && (
          <div className="scholarship-pipeline__won-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Won: {formatAmount(totalWon)}
          </div>
        )}
      </div>

      <div className="scholarship-pipeline__grid">
        {STAGES.map((stage, i) => (
          <PipelineColumn
            key={stage.key}
            stage={stage}
            items={columns[stage.key] || []}
            stageIndex={i}
            onAdd={() => handleAdd(stage.key)}
            onMove={moveScholarship}
            onEdit={handleEdit}
            onDelete={deleteScholarship}
          />
        ))}
      </div>

      <AnimatePresence>
        {formOpen && (
          <ScholarshipFormModal
            open={formOpen}
            onClose={() => { setFormOpen(false); setEditTarget(null); }}
            onSave={handleSave}
            initial={editTarget ? {
              name: editTarget.name,
              amount: editTarget.amount || '',
              deadline: editTarget.deadline || '',
              essayRequired: editTarget.essayRequired,
              difficulty: editTarget.difficulty,
              url: editTarget.url || '',
              notes: editTarget.notes || '',
            } : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
