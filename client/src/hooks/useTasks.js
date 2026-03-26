import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useTasks(userId) {
  const [columns, setColumns] = useState({ 'To Do': [], 'In Progress': [], 'Done': [] });
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/tasks/${userId}`);
      setColumns(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const moveTask = async (taskId, newStatus, sortOrder) => {
    // Optimistic update
    const oldColumns = { ...columns };
    const allTasks = [...columns['To Do'], ...columns['In Progress'], ...columns['Done']];
    const task = allTasks.find(t => t.taskId === taskId);
    if (!task) return null;

    const oldStatus = task.status;
    const updatedTask = { ...task, status: newStatus, sortOrder };

    setColumns(prev => {
      const next = { ...prev };
      next[oldStatus] = prev[oldStatus].filter(t => t.taskId !== taskId);
      next[newStatus] = [...prev[newStatus]];
      next[newStatus].splice(sortOrder, 0, updatedTask);
      return next;
    });

    try {
      const { data } = await api.patch(`/tasks/${taskId}/move`, { status: newStatus, sortOrder });
      return data;
    } catch {
      setColumns(oldColumns);
      return null;
    }
  };

  const createTask = async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    await fetchTasks();
    return data;
  };

  const updateTask = async (taskId, updates) => {
    await api.put(`/tasks/${taskId}`, updates);
    await fetchTasks();
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    await fetchTasks();
  };

  const acceptRoadmapTasks = async (tasks) => {
    const { data } = await api.post('/generate/roadmap/accept', { tasks });
    await fetchTasks();
    return data;
  };

  return { columns, loading, moveTask, createTask, updateTask, deleteTask, acceptRoadmapTasks, refetch: fetchTasks };
}
