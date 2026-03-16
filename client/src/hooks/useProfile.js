import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useProfile() {
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
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
    if (userId) {
      fetchProfile(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchProfile]);

  const createProfile = async (profileData) => {
    const { data } = await api.post('/profile', profileData);
    localStorage.setItem('userId', data.userId);
    setUserId(data.userId);
    setProfile(data);
    return data;
  };

  const updateProfileData = async (updates) => {
    const { data } = await api.put(`/profile/${userId}`, updates);
    setProfile(data);
    return data;
  };

  return { userId, profile, loading, createProfile, updateProfile: updateProfileData, setProfile };
}
