import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function ParentOnboardingPage({ authUserId, onComplete }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Create the parent profile (use Supabase auth user ID)
      const { data: profile } = await api.post('/profile', {
        userId: authUserId,
        displayName,
        email,
        accountType: 'parent',
      });

      // 2. Link to the student via code
      const { data: linkResult } = await api.post('/parent/link', {
        parentId: profile.userId,
        linkCode: linkCode.toUpperCase().trim(),
      });

      // 3. Complete onboarding
      onComplete(profile, linkResult.studentName);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-blue-400 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Parent Access</h1>
          <p className="text-text-muted">
            Enter your info and your student's link code to view their dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="e.g. Sarah Johnson"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="parent@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy text-gray-900"
            />
            <p className="text-xs text-text-muted mt-1">We'll send you a weekly progress digest here.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student's Link Code</label>
            <input
              type="text"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              placeholder="e.g. A3B7K9"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy text-gray-900 font-mono text-center text-lg tracking-widest"
            />
            <p className="text-xs text-text-muted mt-1">
              Ask your student to share their 6-character code from their Profile page.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!displayName || !email || linkCode.length < 6 || submitting}
            className="w-full bg-navy text-white py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Connecting...' : 'Connect to Student'}
          </button>
        </form>

        <p className="text-xs text-center text-text-muted mt-6">
          No payment needed — parent access is included with your student's subscription.
        </p>
      </motion.div>
    </div>
  );
}
