import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './Header';
import ProfileSummary from './ProfileSummary';
import TaskList from './TaskList';
import Timeline from './Timeline';
import AIChatPanel from './AIChatPanel';
import EditSchoolsModal from './EditSchoolsModal';
import CommandBar from './CommandBar';
import ActivityFeed from './ActivityFeed';
import AIRoadmapModal from './AIRoadmapModal';
import DeadlineRadar from './DeadlineRadar';
import AdmissionChances from './AdmissionChances';
import ScholarshipPipeline from './ScholarshipPipeline';
import { useTasks } from '../hooks/useTasks';
import { useProgress } from '../hooks/useProgress';
import { useConfetti } from '../hooks/useConfetti';
import { useAIChat } from '../hooks/useAIChat';
import { getSchoolColors, DEFAULT_THEME } from '../utils/schoolColors';
import api from '../utils/api';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function DashboardPage({ userId, profile, updateProfile, dark, onToggleDark }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [schoolsModalOpen, setSchoolsModalOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [schoolOrder, setSchoolOrder] = useState(null);
  const [cmdBarOpen, setCmdBarOpen] = useState(false);
  const [addTaskTrigger, setAddTaskTrigger] = useState(0);
  const taskSectionRef = useRef(null);
  const { columns, moveTask, createTask, updateTask, deleteTask, acceptRoadmapTasks } = useTasks(userId);
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
    document.documentElement.style.setProperty('--color-gold', colors.secondary === '#FFFFFF' ? '#F59E0B' : colors.secondary);

    return () => {
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-accent');
      document.documentElement.style.removeProperty('--color-navy');
      document.documentElement.style.removeProperty('--color-navy-light');
      document.documentElement.style.removeProperty('--color-gold');
    };
  }, [topSchool]);

  // ── ⌘K / Ctrl+K global hotkey ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleUpdateStat = async (field, rawValue) => {
    const keyMap = { gpa: 'gpa', sat: 'sat', major: 'proposedMajor' };
    const value = field === 'gpa' ? parseFloat(rawValue)
      : field === 'sat' ? parseInt(rawValue, 10)
      : rawValue;
    await updateProfile({ [keyMap[field]]: value });
  };

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

  // ── Command bar callbacks ──
  const handleCmdAddTask = useCallback(() => {
    setAddTaskTrigger((n) => n + 1);
  }, []);

  const handleCmdToggleChat = useCallback(() => {
    setChatOpen(true);
  }, []);

  const handleCmdEditSchools = useCallback(() => {
    setSchoolsModalOpen(true);
  }, []);

  const handleCmdScrollToTasks = useCallback(() => {
    taskSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Header profile={effectiveProfile} onToggleChat={() => setChatOpen(!chatOpen)} dark={dark} onToggleDark={onToggleDark} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Row 1: Stats + School Icons */}
        <ProfileSummary
          profile={effectiveProfile}
          completionPercent={completionPercent}
          onReorderSchools={handleReorderSchools}
          onEditSchools={() => setSchoolsModalOpen(true)}
          onUpdateStat={handleUpdateStat}
          dark={dark}
        />

        {/* Row 2: Admission Chances */}
        <AdmissionChances userId={userId} profile={effectiveProfile} />

        {/* Row 3: Journey Timeline */}
        <Timeline milestones={milestones} />

        {/* Row 4: Deadline Radar */}
        <DeadlineRadar columns={columns} />

        {/* Row 4: Activity Feed */}
        <ActivityFeed milestones={milestones} columns={columns} />

        {/* Row 5: Scholarship Pipeline */}
        <ScholarshipPipeline userId={userId} />

        {/* Row 6: Task List */}
        <div className="mt-10" ref={taskSectionRef}>
          <TaskList
            columns={columns}
            onMoveTask={handleMoveTask}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onTaskCompleted={celebrate}
            openAddTaskTrigger={addTaskTrigger}
            onOpenRoadmap={() => setRoadmapOpen(true)}
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

      <AIRoadmapModal
        open={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        userId={userId}
        onTasksAccepted={acceptRoadmapTasks}
      />

      <EditSchoolsModal
        open={schoolsModalOpen}
        onClose={() => setSchoolsModalOpen(false)}
        schools={effectiveProfile?.schools || []}
        onSave={saveSchools}
      />

      <CommandBar
        open={cmdBarOpen}
        onClose={() => setCmdBarOpen(false)}
        schools={effectiveSchools}
        onAddTask={handleCmdAddTask}
        onToggleChat={handleCmdToggleChat}
        onEditSchools={handleCmdEditSchools}
        onScrollToTasks={handleCmdScrollToTasks}
      />

      {/* Floating ⌘K hint badge */}
      <button
        className="cmd-hint-badge"
        onClick={() => setCmdBarOpen(true)}
        title="Command palette (Ctrl+K)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <kbd>⌘K</kbd>
      </button>
    </div>
  );
}
