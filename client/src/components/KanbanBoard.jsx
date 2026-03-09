import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import AddTaskModal from './AddTaskModal';

const COLUMN_ORDER = ['To Do', 'In Progress', 'Done'];

export default function KanbanBoard({ columns, onMoveTask, onCreateTask, onDeleteTask, onSyncCalendar, onTaskCompleted }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleDragEnd = (result) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const wasCompleted = source.droppableId !== 'Done' && newStatus === 'Done';

    onMoveTask(draggableId, newStatus, destination.index);

    if (wasCompleted && onTaskCompleted) {
      onTaskCompleted();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold text-navy"
          style={{ fontSize: 'var(--font-size-section-header)' }}
        >
          Your Tasks
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-navy text-white font-medium rounded-lg hover:bg-navy-light transition-colors"
          style={{ fontSize: 'var(--font-size-small)' }}
        >
          + Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMN_ORDER.map(col => (
            <KanbanColumn
              key={col}
              columnId={col}
              tasks={columns[col] || []}
              onSyncCalendar={onSyncCalendar}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={onCreateTask}
      />
    </div>
  );
}
