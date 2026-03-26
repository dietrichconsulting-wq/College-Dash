import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

// Muted pill palette — desaturated pastels for dark, saturated for light
const _dark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const CATEGORY_LIGHT = {
  Testing:        { bg: 'rgba(59, 130, 246, 0.08)',  color: '#2563EB' },
  Application:    { bg: 'rgba(139, 92, 246, 0.08)',  color: '#7C3AED' },
  Financial:      { bg: 'rgba(34, 197, 94, 0.08)',   color: '#16A34A' },
  Visit:          { bg: 'rgba(249, 115, 22, 0.08)',  color: '#EA580C' },
  Portfolio:      { bg: 'rgba(236, 72, 153, 0.08)',  color: '#DB2777' },
  Recommendation: { bg: 'rgba(234, 179, 8, 0.08)',   color: '#CA8A04' },
  Other:          { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569' },
};
const CATEGORY_DARK = {
  Testing:        { bg: 'rgba(125, 211, 252, 0.10)', color: '#7DD3FC' },
  Application:    { bg: 'rgba(196, 181, 253, 0.10)', color: '#C4B5FD' },
  Financial:      { bg: 'rgba(134, 239, 172, 0.10)', color: '#86EFAC' },
  Visit:          { bg: 'rgba(253, 186, 116, 0.10)', color: '#FDBA74' },
  Portfolio:      { bg: 'rgba(249, 168, 212, 0.10)', color: '#F9A8D4' },
  Recommendation: { bg: 'rgba(253, 230, 138, 0.10)', color: '#FDE68A' },
  Other:          { bg: 'rgba(168, 162, 158, 0.10)', color: '#A8A29E' },
};
const getCategoryStyles = () => _dark() ? CATEGORY_DARK : CATEGORY_LIGHT;
const DEFAULT_PILL = _dark()
  ? { bg: 'rgba(168, 162, 158, 0.10)', color: '#A8A29E' }
  : { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569' };

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
          className={`card-elevated p-3.5 mb-2.5 ${snapshot.isDragging ? 'ring-2 ring-navy/20' : ''
            }`}
          style={{ boxShadow: snapshot.isDragging ? 'var(--shadow-card-hover)' : 'var(--shadow-card)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <h4
              className="font-medium text-text leading-snug"
              style={{ fontSize: 'var(--font-size-body)' }}
            >
              {task.title}
            </h4>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.taskId); }}
              className="text-gray-300 hover:text-danger text-xs flex-shrink-0 transition-colors"
              title="Delete task"
            >
              x
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            <span
              className="font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                fontSize: 'var(--font-size-micro)',
                backgroundColor: (getCategoryStyles()[task.category] || DEFAULT_PILL).bg,
                color: (getCategoryStyles()[task.category] || DEFAULT_PILL).color,
              }}
            >
              {task.category}
            </span>
            {task.dueDate && (
              <span
                className="text-text-muted"
                style={{ fontSize: 'var(--font-size-micro)' }}
              >
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.calendarEventId && (
              <span
                className="text-success"
                style={{ fontSize: 'var(--font-size-micro)' }}
                title="Synced to Google Calendar"
              >
                cal
              </span>
            )}
          </div>

          {task.dueDate && !task.calendarEventId && task.status !== 'Done' && onSyncCalendar && (
            <button
              onClick={(e) => { e.stopPropagation(); onSyncCalendar(task); }}
              className="mt-2 text-navy hover:text-navy-light underline transition-colors"
              style={{ fontSize: 'var(--font-size-micro)' }}
            >
              + Add to Calendar
            </button>
          )}
        </motion.div>
      )}
    </Draggable>
  );
}
