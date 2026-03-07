import { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import ProfileSummary from './ProfileSummary';
import TaskList from './TaskList';
import Timeline from './Timeline';
import AIChatPanel from './AIChatPanel';
import EditSchoolsModal from './EditSchoolsModal';
import { useTasks } from '../hooks/useTasks';
import { useProgress } from '../hooks/useProgress';
import { useConfetti } from '../hooks/useConfetti';
import { useAIChat } from '../hooks/useAIChat';
import { getSchoolColors, DEFAULT_THEME } from '../utils/schoolColors';
import api from '../utils/api';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function DashboardPage({ userId, profile, onUpdateProfile }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [schoolsModalOpen, setSchoolsModalOpen] = useState(false);
  const [schoolOrder, setSchoolOrder] = useState(null);
  const { columns, moveTask, createTask, updateTask, deleteTask } = useTasks(userId);
  const { milestones, completionPercent } = useProgress(userId);
  const { messages, loading: chatLoading, sendMessage } = useAIChat(userId);

  // Derive the effective top school from reordered schools or profile
  const effectiveSchools = schoolOrder || profile?.schools?.filter(s => s?.name && s.name.trim() !== '') || [];
  const topSchool = effectiveSchools[0]?.name || null;
  const school1Slug = topSchool ? slugify(topSchool) : null;
  const { celebrate } = useConfetti(school1Slug);

  // Build effective profile with reordered schools
  const effectiveProfile = useMemo(() => {
    if (!profile) return profile;
    if (!schoolOrder) return profile;
    return { ...profile, schools: schoolOrder };
  }, [profile, schoolOrder]);

  // Apply dynamic theme based on top school
  useEffect(() => {
    const colors = getSchoolColors(topSchool) || DEFAULT_THEME;

    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    document.documentElement.style.setProperty('--color-accent', colors.accent);
    document.documentElement.style.setProperty('--color-navy', colors.primary);
    document.documentElement.style.setProperty('--color-navy-light', colors.accent);
    document.documentElement.style.setProperty('--color-gold', colors.secondary === '#FFFFFF' ? '#f5a623' : colors.secondary);

    return () => {
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-accent');
      document.documentElement.style.removeProperty('--color-navy');
      document.documentElement.style.removeProperty('--color-navy-light');
      document.documentElement.style.removeProperty('--color-gold');
    };
  }, [topSchool]);

  const saveSchools = (schools) => {
    const padded = [...schools];
    while (padded.length < 4) padded.push({ name: '', id: '' });
    setSchoolOrder(schools.filter(s => s?.name && s.name.trim() !== ''));
    api.put(`/profile/${userId}`, { schools: padded }).catch(err => {
      console.error('Failed to save schools:', err);
    });
  };

  const handleReorderSchools = (newOrder) => {
    setSchoolOrder(newOrder);
    const padded = [...newOrder];
    while (padded.length < 4) padded.push({ name: '', id: '' });
    api.put(`/profile/${userId}`, { schools: padded }).catch(err => {
      console.error('Failed to save school order:', err);
    });
  };

  const handleMoveTask = (taskId, newStatus, sortOrder) => {
    return moveTask(taskId, newStatus, sortOrder);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header profile={effectiveProfile} onToggleChat={() => setChatOpen(!chatOpen)} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Row 1: Stats + School Icons */}
        <ProfileSummary
          profile={effectiveProfile}
          completionPercent={completionPercent}
          onReorderSchools={handleReorderSchools}
          onEditSchools={() => setSchoolsModalOpen(true)}
        />

        {/* Row 2: Journey Timeline */}
        <Timeline milestones={milestones} />

        {/* Row 3: Task List */}
        <div className="mt-6">
          <TaskList
            columns={columns}
            onMoveTask={handleMoveTask}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onTaskCompleted={celebrate}
          />
        </div>
      </main>

      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        loading={chatLoading}
        onSend={sendMessage}
      />

      <EditSchoolsModal
        open={schoolsModalOpen}
        onClose={() => setSchoolsModalOpen(false)}
        schools={effectiveProfile?.schools || []}
        onSave={saveSchools}
      />
    </div>
  );
}
