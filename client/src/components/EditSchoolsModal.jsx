import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CollegeSearch from './CollegeSearch';

export default function EditSchoolsModal({ open, onClose, schools, onSave }) {
  const [form, setForm] = useState([
    { name: '', id: '' },
    { name: '', id: '' },
    { name: '', id: '' },
    { name: '', id: '' },
  ]);

  useEffect(() => {
    if (open && schools) {
      const padded = [...schools];
      while (padded.length < 4) padded.push({ name: '', id: '' });
      setForm(padded.slice(0, 4));
    }
  }, [open, schools]);

  const handleSchoolChange = (index, school) => {
    const next = [...form];
    next[index] = school;
    setForm(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
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
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              Your Target Schools
            </h2>
            <p className="text-xs text-text-muted mb-4">
              School #1 is your top choice. Its colors will theme the dashboard.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              {form.map((school, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    {i === 0 ? 'Top Choice' : `School ${i + 1}`}
                  </label>
                  <CollegeSearch
                    value={school}
                    onChange={handleSchoolChange}
                    index={i}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-3">
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
