import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const MILESTONES = [
  { key: 'profile_complete',          label: 'Profile Complete',       subtitle: 'GPA, SAT, schools selected' },
  { key: 'sat_prep_started',          label: 'SAT Prep Started',       subtitle: 'Studying begins' },
  { key: 'sat_taken',                 label: 'SAT Taken',              subtitle: 'Test day done' },
  { key: 'applications_started',      label: 'Applications Started',   subtitle: 'Common App opened' },
  { key: 'recommendations_requested', label: 'Recs Requested',         subtitle: 'Teachers contacted' },
  { key: 'essays_drafted',            label: 'Essays Drafted',         subtitle: 'Personal statement written' },
  { key: 'applications_submitted',    label: 'Applications Submitted', subtitle: 'All apps sent' },
  { key: 'scholarships_applied',      label: 'Scholarships Applied',   subtitle: 'FAFSA + scholarships sent' },
  { key: 'decisions_received',        label: 'Decisions Received',     subtitle: 'Acceptance letters arrived' },
  { key: 'committed',                 label: 'Committed!',             subtitle: 'Enrolled at your school' },
];

export function useProgress(userId) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/progress/${userId}`);
      setProgress(data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const reachedKeys = new Set(progress.map(p => p.milestoneKey));

  const milestones = MILESTONES.map(m => ({
    ...m,
    reached: reachedKeys.has(m.key),
    reachedAt: progress.find(p => p.milestoneKey === m.key)?.reachedAt || null,
  }));

  const completionPercent = Math.round((reachedKeys.size / MILESTONES.length) * 100);

  const addMilestone = async (milestoneKey, notes) => {
    if (reachedKeys.has(milestoneKey)) return;
    await api.post('/progress', { milestoneKey, notes });
    await fetchProgress();
  };

  return { milestones, completionPercent, loading, addMilestone, refetch: fetchProgress };
}

export { MILESTONES };
