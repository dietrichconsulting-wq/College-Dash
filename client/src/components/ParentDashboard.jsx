import { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ProfileSummary from './ProfileSummary';
import TaskList from './TaskList';
import Timeline from './Timeline';
import ActivityFeed from './ActivityFeed';
import DeadlineRadar from './DeadlineRadar';
import ScholarshipPipeline from './ScholarshipPipeline';
import CollegeComparison from './CollegeComparison';
import CollegeStrategy from './CollegeStrategy';
import { getSchoolColors, DEFAULT_THEME } from '../utils/schoolColors';
import api from '../utils/api';

export default function ParentDashboard({ parentId, dark, onToggleDark }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the linked student's data
  useEffect(() => {
    api.get(`/parent/student/${parentId}`)
      .then(({ data }) => {
        setStudentData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load student data');
        setLoading(false);
      });
  }, [parentId]);

  // Apply dynamic theme based on student's top school
  const topSchool = studentData?.profile?.schools?.[0]?.name || null;
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

  const profile = studentData?.profile;
  const columns = studentData?.tasks || { 'To Do': [], 'In Progress': [], 'Done': [] };
  const milestones = studentData?.progress || [];

  // Compute completion percent from milestones
  const completionPercent = useMemo(() => {
    const total = 10;
    return Math.round((milestones.length / total) * 100);
  }, [milestones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-text mb-3">Unable to Load</h2>
          <p className="text-text-muted">{error || 'Student data not found.'}</p>
        </div>
      </div>
    );
  }

  // No-op handlers for read-only mode
  const noop = () => {};

  return (
    <div className="sidebar-layout bg-bg">
      <Sidebar activePage={activePage} onNavigate={setActivePage} profile={profile} dark={dark} readOnly />

      <div className="sidebar-layout__content">
        <Header profile={profile} onToggleChat={noop} dark={dark} onToggleDark={onToggleDark} readOnly />

        {/* Parent read-only banner */}
        <div className="mx-4 mt-2 mb-0">
          <div className="bg-navy/10 border border-navy/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-navy flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-text">
              You're viewing <strong>{profile.displayName}'s</strong> dashboard (read-only)
            </span>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {activePage === 'dashboard' && (
            <>
              <ProfileSummary
                profile={profile}
                completionPercent={completionPercent}
                onReorderSchools={noop}
                onEditSchools={noop}
                onUpdateStat={noop}
                dark={dark}
                readOnly
              />
              <CollegeComparison profile={profile} />
              <DeadlineRadar columns={columns} loading={false} />
              <ActivityFeed milestones={milestones} columns={columns} loading={false} />
              <div className="task-section-card mt-10">
                <TaskList
                  columns={columns}
                  loading={false}
                  onMoveTask={noop}
                  onCreateTask={noop}
                  onUpdateTask={noop}
                  onDeleteTask={noop}
                  onTaskCompleted={noop}
                  readOnly
                />
              </div>
            </>
          )}

          {activePage === 'journey' && (
            <Timeline milestones={milestones} loading={false} />
          )}

          {activePage === 'compare' && (
            <CollegeComparison profile={profile} />
          )}

          {activePage === 'scholarships' && (
            <ScholarshipPipeline userId={profile.userId} readOnly />
          )}

          {activePage === 'strategy' && (
            <CollegeStrategy profile={profile} readOnly />
          )}
        </main>
      </div>
    </div>
  );
}
