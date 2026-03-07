import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  Testing: 'bg-badge-testing',
  Application: 'bg-badge-application',
  Financial: 'bg-badge-financial',
  Visit: 'bg-badge-visit',
  Portfolio: 'bg-badge-portfolio',
  Recommendation: 'bg-badge-recommendation',
  Other: 'bg-badge-other',
};

export default function TaskCard({ task, index, onSyncCalendar, onDelete }) {
  return (
    <Draggable draggableId={task.taskId} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          layout
          whileHover={{ scale: 1.02 }}
          className={`bg-card rounded-lg p-3.5 shadow-sm border border-gray-100 mb-2.5 transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-navy/20' : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-text leading-snug">{task.title}</h4>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.taskId); }}
              className="text-gray-300 hover:text-danger text-xs flex-shrink-0 transition-colors"
              title="Delete task"
            >
              x
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            <span className={`${CATEGORY_COLORS[task.category] || 'bg-badge-other'} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
              {task.category}
            </span>
            {task.dueDate && (
              <span className="text-[10px] text-text-muted">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.calendarEventId && (
              <span className="text-[10px] text-success" title="Synced to Google Calendar">
                cal
              </span>
            )}
          </div>

          {task.dueDate && !task.calendarEventId && task.status !== 'Done' && onSyncCalendar && (
            <button
              onClick={(e) => { e.stopPropagation(); onSyncCalendar(task); }}
              className="mt-2 text-[10px] text-navy hover:text-navy-light underline transition-colors"
            >
              + Add to Calendar
            </button>
          )}
        </motion.div>
      )}
    </Draggable>
  );
}
