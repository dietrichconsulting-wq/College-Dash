import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const STAGES = ['Researching', 'Applying', 'Submitted', 'Won'];

export function useScholarships(userId) {
  const [columns, setColumns] = useState({
    Researching: [],
    Applying: [],
    Submitted: [],
    Won: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchScholarships = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/scholarships/${userId}`);
      setColumns(data);
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const createScholarship = async (scholarship) => {
    const { data } = await api.post('/scholarships', scholarship);
    setColumns(prev => ({
      ...prev,
      [data.stage]: [...prev[data.stage], data],
    }));
    return data;
  };

  const updateScholarship = async (scholarshipId, updates) => {
    const { data } = await api.put(`/scholarships/${scholarshipId}`, updates);
    setColumns(prev => {
      const next = { ...prev };
      // Remove from old column, add to correct column
      for (const stage of STAGES) {
        next[stage] = next[stage].filter(s => s.scholarshipId !== scholarshipId);
      }
      next[data.stage] = [...next[data.stage], data];
      return next;
    });
    return data;
  };

  const moveScholarship = async (scholarshipId, newStage) => {
    // Optimistic update
    setColumns(prev => {
      const next = { ...prev };
      let item = null;
      for (const stage of STAGES) {
        const idx = next[stage].findIndex(s => s.scholarshipId === scholarshipId);
        if (idx !== -1) {
          item = next[stage][idx];
          next[stage] = [...next[stage].slice(0, idx), ...next[stage].slice(idx + 1)];
          break;
        }
      }
      if (item) {
        next[newStage] = [...next[newStage], { ...item, stage: newStage }];
      }
      return next;
    });

    try {
      await api.put(`/scholarships/${scholarshipId}/move`, { stage: newStage });
    } catch (err) {
      console.error('Failed to move scholarship:', err);
      fetchScholarships(); // Revert on error
    }
  };

  const deleteScholarship = async (scholarshipId) => {
    setColumns(prev => {
      const next = { ...prev };
      for (const stage of STAGES) {
        next[stage] = next[stage].filter(s => s.scholarshipId !== scholarshipId);
      }
      return next;
    });

    try {
      await api.delete(`/scholarships/${scholarshipId}`);
    } catch (err) {
      console.error('Failed to delete scholarship:', err);
      fetchScholarships();
    }
  };

  return { columns, loading, createScholarship, updateScholarship, moveScholarship, deleteScholarship };
}
