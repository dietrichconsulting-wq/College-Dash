import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Testing', 'Application', 'Financial', 'Visit', 'Portfolio', 'Recommendation', 'Other'];

export default function AddTaskModal({ open, onClose, onSave, task }) {
  const isEditing = !!task;
  const [form, setForm] = useState({ title: '', description: '', category: 'Other', dueDate: '' });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'Other',
        dueDate: task.dueDate || '',
      });
    } else {
      setForm({ title: '', description: '', category: 'Other', dueDate: '' });
    }
  }, [task, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dueDate: form.dueDate || null,
    });
    setForm({ title: '', description: '', category: 'Other', dueDate: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="card-elevated p-6 w-full max-w-md"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
          >
            <h2
              className="font-bold mb-5"
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--font-size-section-header)',
              }}
            >
              {isEditing ? 'Edit Task' : 'Add New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block font-medium mb-1"
                  style={{ fontSize: 'var(--font-size-small)' }}
                >Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label
                  className="block font-medium mb-1"
                  style={{ fontSize: 'var(--font-size-small)' }}
                >Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block font-medium mb-1"
                    style={{ fontSize: 'var(--font-size-small)' }}
                  >Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  style={{ fontSize: 'var(--font-size-small)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white rounded-lg font-medium transition-colors hover:opacity-85"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    fontSize: 'var(--font-size-small)',
                  }}
                >
                  {isEditing ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
