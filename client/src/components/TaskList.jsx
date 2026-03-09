import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddTaskModal from './AddTaskModal';

// Muted pill palette — subtle bg + tinted text
const CATEGORY_STYLES = {
  Testing: { bg: 'rgba(59, 130, 246, 0.08)', color: '#2563EB' },
  Application: { bg: 'rgba(139, 92, 246, 0.08)', color: '#7C3AED' },
  Financial: { bg: 'rgba(34, 197, 94, 0.08)', color: '#16A34A' },
  Visit: { bg: 'rgba(249, 115, 22, 0.08)', color: '#EA580C' },
  Portfolio: { bg: 'rgba(236, 72, 153, 0.08)', color: '#DB2777' },
  Recommendation: { bg: 'rgba(234, 179, 8, 0.08)', color: '#CA8A04' },
  Other: { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569' },
};
const DEFAULT_PILL = { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
}

export default function TaskList({ columns, onMoveTask, onCreateTask, onUpdateTask, onDeleteTask, onTaskCompleted }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDone, setShowDone] = useState(false);

  const activeTasks = [...(columns['To Do'] || []), ...(columns['In Progress'] || [])];
  const doneTasks = columns['Done'] || [];

  activeTasks.sort((a, b) => {
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  const handleDone = (task) => {
    onMoveTask(task.taskId, 'Done', 0);
    if (onTaskCompleted) onTaskCompleted();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (taskData) => {
    if (editingTask) {
      await onUpdateTask(editingTask.taskId, taskData);
      setEditingTask(null);
    } else {
      await onCreateTask(taskData);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold"
          style={{
            fontSize: 'var(--font-size-section-header)',
            color: 'var(--color-primary)',
          }}
        >
          Your Tasks
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="text-text-muted font-medium"
            style={{ fontSize: 'var(--font-size-small)' }}
          >
            {activeTasks.length} remaining
          </span>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="px-4 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-85"
            style={{
              backgroundColor: 'var(--color-primary)',
              fontSize: 'var(--font-size-small)',
            }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="card-elevated overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}>
        {activeTasks.length === 0 ? (
          <div
            className="p-8 text-center text-text-muted"
            style={{ fontSize: 'var(--font-size-body)' }}
          >
            All tasks complete! Great job!
          </div>
        ) : (
          <AnimatePresence>
            {activeTasks.map((task, i) => (
              <motion.div
                key={task.taskId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-black/5' : ''
                  } hover:bg-gray-50/50 transition-colors group`}
              >
                {/* Done button */}
                <button
                  onClick={() => handleDone(task)}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-success hover:bg-success/10 transition-all"
                  title="Mark as done"
                >
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-success/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                {/* Task info - click to edit */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleEdit(task)}
                  title="Click to edit"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-medium text-text truncate"
                      style={{ fontSize: 'var(--font-size-body)' }}
                    >
                      {task.title}
                    </span>
                    <span
                      className="font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        fontSize: 'var(--font-size-micro)',
                        backgroundColor: (CATEGORY_STYLES[task.category] || DEFAULT_PILL).bg,
                        color: (CATEGORY_STYLES[task.category] || DEFAULT_PILL).color,
                      }}
                    >
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <p
                      className="text-text-muted mt-0.5 truncate"
                      style={{ fontSize: 'var(--font-size-micro)' }}
                    >
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Due date + actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.dueDate ? (
                    <span
                      className={`font-medium ${isOverdue(task.dueDate) ? 'text-danger' : 'text-text-muted'
                        }`}
                      style={{ fontSize: 'var(--font-size-micro)' }}
                    >
                      {isOverdue(task.dueDate) && <span className="mr-1">!</span>}
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span
                      className="text-gray-300"
                      style={{ fontSize: 'var(--font-size-micro)' }}
                    >
                      No date
                    </span>
                  )}

                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-gray-300 hover:text-text-muted transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteTask(task.taskId)}
                    className="text-gray-300 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Done section - collapsible */}
      {doneTasks.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 font-semibold text-text-muted hover:text-text transition-colors mb-3"
            style={{ fontSize: 'var(--font-size-small)' }}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showDone ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Done ({doneTasks.length})
          </button>

          <AnimatePresence>
            {showDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card-elevated overflow-hidden" style={{ borderRadius: 'var(--radius-card)' }}
              >
                {doneTasks.map((task, i) => (
                  <div
                    key={task.taskId}
                    className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-black/5' : ''
                      } opacity-60`}
                  >
                    <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span
                      className="text-text line-through flex-1 truncate"
                      style={{ fontSize: 'var(--font-size-body)' }}
                    >
                      {task.title}
                    </span>
                    <span
                      className="font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        fontSize: 'var(--font-size-micro)',
                        backgroundColor: (CATEGORY_STYLES[task.category] || DEFAULT_PILL).bg,
                        color: (CATEGORY_STYLES[task.category] || DEFAULT_PILL).color,
                      }}
                    >
                      {task.category}
                    </span>
                    {task.completedAt && (
                      <span
                        className="text-text-muted flex-shrink-0"
                        style={{ fontSize: 'var(--font-size-micro)' }}
                      >
                        {formatDate(task.completedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AddTaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        task={editingTask}
      />
    </div>
  );
}
