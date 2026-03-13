'use client'

import { useProfile } from '@/hooks/useProfile'
import { useTasks } from '@/hooks/useTasks'
import { useScholarships } from '@/hooks/useScholarships'
import { ProfileStats } from './ProfileStats'
import { AdmissionSnapshot } from './AdmissionSnapshot'
import { TaskList } from './TaskList'
import { DeadlineRadar } from './DeadlineRadar'
import { ScholarshipPipeline } from './ScholarshipPipeline'

interface DashboardClientProps {
  userId: string
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const { data: profile, isLoading: profileLoading } = useProfile(userId)
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(userId)
  const { data: scholarships = [], isLoading: scholarshipsLoading } = useScholarships(userId)

  const doneTasks = tasks.filter(t => t.status === 'Done').length
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          {profileLoading ? '…' : `Welcome back, ${profile?.display_name?.split(' ')[0] || 'Student'} 👋`}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Your college application command center
        </p>
      </div>

      {/* Profile Stats */}
      <ProfileStats profile={profile} loading={profileLoading} progress={progress} tasks={tasks} userId={userId} />

      {/* Admission Snapshot */}
      <AdmissionSnapshot profile={profile} loading={profileLoading} />

      {/* Two-column layout for radar + scholarships */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <DeadlineRadar tasks={tasks} loading={tasksLoading} />
        <ScholarshipPipeline scholarships={scholarships} loading={scholarshipsLoading} userId={userId} />
      </div>

      {/* Task list */}
      <div style={{ marginTop: 20 }}>
        <TaskList tasks={tasks} loading={tasksLoading} userId={userId} />
      </div>
    </div>
  )
}
