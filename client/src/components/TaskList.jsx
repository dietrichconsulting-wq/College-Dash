import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddTaskModal from './AddTaskModal';

const CATEGORY_COLORS = {
  Testing: 'bg-badge-testing',
  Application: 'bg-badge-application',
  Financial: 'bg-badge-financial',
  Visit: 'bg-badge-visit',
  Portfolio: 'bg-badge-portfolio',
  Recommendation: 'bg-badge-recommendation',
  Other: 'bg-badge-other',
};

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>Your Tasks</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {activeTasks.length} remaining
          </span>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTasks.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
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
                className={`flex items-center gap-4 px-4 py-3 ${
                  i > 0 ? 'border-t border-gray-100' : ''
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
                    <span className="text-sm font-medium text-text truncate">{task.title}</span>
                    <span className={`${CATEGORY_COLORS[task.category] || 'bg-badge-other'} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0`}>
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{task.description}</p>
                  )}
                </div>

                {/* Due date + actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.dueDate ? (
                    <span className={`text-xs font-medium ${
                      isOverdue(task.dueDate) ? 'text-danger' : 'text-text-muted'
                    }`}>
                      {isOverdue(task.dueDate) && <span className="mr-1">!</span>}
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">No date</span>
                  )}

                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-gray-300 hover:text-text-muted text-xs transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteTask(task.taskId)}
                    className="text-gray-300 hover:text-danger text-xs transition-colors opacity-0 group-hover:opacity-100"
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
        <div className="mt-4">
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text transition-colors mb-2"
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
                className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {doneTasks.map((task, i) => (
                  <div
                    key={task.taskId}
                    className={`flex items-center gap-4 px-4 py-3 ${
                      i > 0 ? 'border-t border-gray-100' : ''
                    } opacity-60`}
                  >
                    <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-text line-through flex-1 truncate">{task.title}</span>
                    <span className={`${CATEGORY_COLORS[task.category] || 'bg-badge-other'} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
                      {task.category}
                    </span>
                    {task.completedAt && (
                      <span className="text-[10px] text-text-muted flex-shrink-0">
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
