import { Droppable } from '@hello-pangea/dnd';
import { AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

const COLUMN_STYLES = {
  'To Do': { header: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  'In Progress': { header: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  'Done': { header: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
};

export default function KanbanColumn({ columnId, tasks, onSyncCalendar, onDeleteTask }) {
  const style = COLUMN_STYLES[columnId] || COLUMN_STYLES['To Do'];

  return (
    <div className="flex flex-col bg-column rounded-xl min-h-[300px] w-full">
      <div className={`${style.header} px-4 py-3 rounded-t-xl flex items-center gap-2`}>
        <span className={`${style.dot} w-2.5 h-2.5 rounded-full`} />
        <h3 className="font-semibold text-sm">{columnId}</h3>
        <span className="ml-auto text-xs font-medium opacity-70">{tasks.length}</span>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2.5 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
            }`}
          >
            <AnimatePresence>
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  index={index}
                  onSyncCalendar={onSyncCalendar}
                  onDelete={onDeleteTask}
                />
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
