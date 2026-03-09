import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Icons ──
const icons = {
    milestone: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    task_done: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    task_created: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    ),
    profile: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
};

// ── Relative time helper ──
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Build unified activity list from milestones + tasks ──
function buildActivityItems(milestones, doneTasks, allTasks) {
    const items = [];

    // Milestones that have been reached
    milestones
        .filter((m) => m.reached && m.reachedAt)
        .forEach((m) => {
            items.push({
                id: `ms-${m.key}`,
                type: 'milestone',
                icon: icons.milestone,
                title: m.label,
                subtitle: m.subtitle,
                timestamp: m.reachedAt,
                color: '#22C55E',
            });
        });

    // Completed tasks
    doneTasks.forEach((task) => {
        items.push({
            id: `done-${task.taskId}`,
            type: 'task_done',
            icon: icons.task_done,
            title: `Completed: ${task.title}`,
            subtitle: task.category || 'Task',
            timestamp: task.updatedAt || task.createdAt,
            color: '#3B82F6',
        });
    });

    // Recently created tasks (last 5)
    const recentCreated = [...allTasks]
        .filter((t) => t.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    recentCreated.forEach((task) => {
        items.push({
            id: `create-${task.taskId}`,
            type: 'task_created',
            icon: icons.task_created,
            title: `Added: ${task.title}`,
            subtitle: task.category || 'Task',
            timestamp: task.createdAt,
            color: '#8B5CF6',
        });
    });

    // Sort all by timestamp descending
    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return items;
}

// ── Category badge color ──
const typeLabels = {
    milestone: 'Milestone',
    task_done: 'Completed',
    task_created: 'New Task',
};

export default function ActivityFeed({ milestones = [], columns = {} }) {
    const doneTasks = columns['Done'] || [];
    const allTasks = [
        ...(columns['To Do'] || []),
        ...(columns['In Progress'] || []),
        ...doneTasks,
    ];

    const items = useMemo(
        () => buildActivityItems(milestones, doneTasks, allTasks),
        [milestones, doneTasks, allTasks]
    );

    // Show max 8 items
    const visibleItems = items.slice(0, 8);

    return (
        <motion.div
            className="activity-feed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
        >
            <div className="activity-feed__header">
                <h3 className="activity-feed__title">Recent Activity</h3>
                {items.length > 0 && (
                    <span className="activity-feed__count">{items.length} events</span>
                )}
            </div>

            {visibleItems.length === 0 ? (
                <div className="activity-feed__empty">
                    <span className="activity-feed__empty-icon">📋</span>
                    <p>No activity yet. Complete tasks and milestones to see your progress here.</p>
                </div>
            ) : (
                <div className="activity-feed__list">
                    <AnimatePresence>
                        {visibleItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                className="activity-item"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                {/* Timeline connector */}
                                <div className="activity-item__timeline">
                                    <div
                                        className="activity-item__dot"
                                        style={{ background: item.color }}
                                    />
                                    {i < visibleItems.length - 1 && (
                                        <div className="activity-item__line" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="activity-item__content">
                                    <div className="activity-item__row">
                                        <span
                                            className="activity-item__icon"
                                            style={{ color: item.color }}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="activity-item__title">{item.title}</span>
                                        <span className="activity-item__time">{timeAgo(item.timestamp)}</span>
                                    </div>
                                    <div className="activity-item__meta">
                                        <span
                                            className="activity-item__badge"
                                            style={{
                                                background: `${item.color}10`,
                                                color: item.color,
                                                borderColor: `${item.color}20`,
                                            }}
                                        >
                                            {typeLabels[item.type]}
                                        </span>
                                        {item.subtitle && (
                                            <span className="activity-item__subtitle">{item.subtitle}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
