import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Profile hook. Accepts the Supabase auth userId so we never
 * read/write userId to localStorage — the JWT is the source of truth.
 */
export function useProfile(authUserId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/profile/${id}`);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUserId) {
      fetchProfile(authUserId);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [authUserId, fetchProfile]);

  const createProfile = async (profileData) => {
    const { data } = await api.post('/profile', { ...profileData, userId: authUserId });
    setProfile(data);
    return data;
  };

  const updateProfileData = async (updates) => {
    const { data } = await api.put(`/profile/${authUserId}`, updates);
    setProfile(data);
    return data;
  };

  return { userId: authUserId, profile, loading, createProfile, updateProfile: updateProfileData, setProfile };
}
