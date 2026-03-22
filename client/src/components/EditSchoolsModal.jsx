import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CollegeSearch from './CollegeSearch';

const MAX_SCHOOLS = 12;

export default function EditSchoolsModal({ open, onClose, schools, onSave }) {
  const [form, setForm] = useState([{ name: '', id: '' }]);

  useEffect(() => {
    if (open && schools) {
      const existing = schools.filter(s => s?.name && s.name.trim() !== '');
      setForm(existing.length > 0 ? existing : [{ name: '', id: '' }]);
    }
  }, [open, schools]);

  const handleSchoolChange = (index, school) => {
    const next = [...form];
    next[index] = school;
    setForm(next);
  };

  const addSlot = () => {
    if (form.length < MAX_SCHOOLS) {
      setForm([...form, { name: '', id: '' }]);
    }
  };

  const removeSlot = (index) => {
    if (form.length > 1) {
      setForm(form.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form.filter(s => s?.name && s.name.trim() !== ''));
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
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[85vh] flex flex-col"
          >
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              Your Target Schools
            </h2>
            <p className="text-xs text-text-muted mb-4">
              School #1 is your top choice. Its colors will theme the dashboard. Add up to {MAX_SCHOOLS} schools.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {form.map((school, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        {i === 0 ? 'Top Choice' : `School ${i + 1}`}
                      </label>
                      <CollegeSearch
                        value={school}
                        onChange={handleSchoolChange}
                        index={i}
                      />
                    </div>
                    {form.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="mb-0.5 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove school"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {form.length < MAX_SCHOOLS && (
                  <button
                    type="button"
                    onClick={addSlot}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Add School ({form.length}/{MAX_SCHOOLS})
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-85"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Save Schools
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
