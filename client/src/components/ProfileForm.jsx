import { useState } from 'react';
import { motion } from 'framer-motion';
import CollegeSearch from './CollegeSearch';

export default function ProfileForm({ onSubmit }) {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    gpa: '',
    sat: '',
    proposedMajor: '',
    schools: [
      { name: '', id: '' },
      { name: '', id: '' },
      { name: '', id: '' },
      { name: '', id: '' },
    ],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSchoolChange = (index, school) => {
    const schools = [...form.schools];
    schools[index] = school;
    setForm({ ...form, schools });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        sat: form.sat ? parseInt(form.sat) : null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <div>
        <label className="block text-sm font-semibold mb-1.5 text-navy">Your Name</label>
        <input
          type="text"
          value={form.displayName}
          onChange={e => setForm({ ...form, displayName: e.target.value })}
          placeholder="Enter your name"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-navy">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-navy">GPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={form.gpa}
            onChange={e => setForm({ ...form, gpa: e.target.value })}
            placeholder="e.g. 3.85"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 text-navy">SAT Score</label>
          <input
            type="number"
            min="400"
            max="1600"
            value={form.sat}
            onChange={e => setForm({ ...form, sat: e.target.value })}
            placeholder="e.g. 1350"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5 text-navy">Proposed Major</label>
        <input
          type="text"
          value={form.proposedMajor}
          onChange={e => setForm({ ...form, proposedMajor: e.target.value })}
          placeholder="e.g. Computer Science"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-navy">Target Schools (4)</label>
        <p className="text-xs text-text-muted mb-3">School #1 is your top choice - its fight song plays when you complete tasks!</p>
        <div className="space-y-3">
          {form.schools.map((school, i) => (
            <CollegeSearch
              key={i}
              index={i}
              value={school}
              onChange={handleSchoolChange}
            />
          ))}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={submitting || !form.displayName}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Setting up your dashboard...' : "Let's Go!"}
      </motion.button>
    </motion.form>
  );
}
