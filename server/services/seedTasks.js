import { v4 as uuidv4 } from 'uuid';
import { createTask } from './notion.js';

// Austin ISD timeline: assumes student starts dashboard in spring of junior year
// SAT dates: typically Oct, Dec, Mar, May, Jun
// Texas-specific: FAFSA opens Oct 1, Apply Texas alongside Common App
// Early Decision: Nov 1, Regular Decision: Jan 1
const DEFAULT_TASKS = [
  // Testing - two SAT sittings
  { title: 'Register for SAT #1 (spring junior year)',       category: 'Testing',        dueDate: '2026-03-15' },
  { title: 'Begin SAT prep course',                          category: 'Testing',        dueDate: '2026-03-22' },
  { title: 'Take SAT practice tests (2-3 full tests)',       category: 'Testing',        dueDate: '2026-04-30' },
  { title: 'Take SAT #1 (May sitting)',                      category: 'Testing',        dueDate: '2026-05-02' },
  { title: 'Register for SAT #2 (fall senior year)',         category: 'Testing',        dueDate: '2026-08-15' },
  { title: 'Take SAT #2 (October sitting)',                  category: 'Testing',        dueDate: '2026-10-03' },

  // Research & planning
  { title: 'Research target schools',                        category: 'Application',    dueDate: '2026-03-20' },
  { title: 'Visit Austin college fair (spring)',             category: 'Visit',          dueDate: '2026-04-10' },
  { title: 'Schedule campus visit #1',                       category: 'Visit',          dueDate: '2026-06-15' },
  { title: 'Schedule campus visit #2',                       category: 'Visit',          dueDate: '2026-07-15' },

  // Applications
  { title: 'Request official transcripts from AISD',        category: 'Application',    dueDate: '2026-09-01' },
  { title: 'Start Common App + Apply Texas accounts',       category: 'Application',    dueDate: '2026-08-01' },
  { title: 'Write personal essay draft',                    category: 'Application',    dueDate: '2026-08-15' },
  { title: 'Revise personal essay (final)',                 category: 'Application',    dueDate: '2026-09-15' },
  { title: 'Complete Early Decision/Action applications',   category: 'Application',    dueDate: '2026-11-01' },
  { title: 'Complete School 1 application',                 category: 'Application',    dueDate: '2026-12-15' },
  { title: 'Complete School 2 application',                 category: 'Application',    dueDate: '2026-12-15' },
  { title: 'Complete School 3 application',                 category: 'Application',    dueDate: '2026-12-20' },
  { title: 'Complete School 4 application',                 category: 'Application',    dueDate: '2026-12-20' },
  { title: 'Submit all Regular Decision applications',      category: 'Application',    dueDate: '2027-01-01' },

  // Recommendations
  { title: 'Request letter of recommendation #1',           category: 'Recommendation', dueDate: '2026-09-05' },
  { title: 'Request letter of recommendation #2',           category: 'Recommendation', dueDate: '2026-09-05' },
  { title: 'Follow up on recommendation letters',           category: 'Recommendation', dueDate: '2026-10-15' },

  // Portfolio
  { title: 'Build portfolio / project showcase',            category: 'Portfolio',      dueDate: '2026-09-30' },
  { title: 'Photograph / document portfolio pieces',        category: 'Portfolio',      dueDate: '2026-10-15' },

  // Financial
  { title: 'Search for scholarships (Texas-specific too)',  category: 'Financial',      dueDate: '2026-08-01' },
  { title: 'Submit FAFSA (opens Oct 1)',                    category: 'Financial',      dueDate: '2026-10-15' },
  { title: 'Apply for scholarship #1',                      category: 'Financial',      dueDate: '2026-11-01' },
  { title: 'Apply for scholarship #2',                      category: 'Financial',      dueDate: '2026-12-01' },
];

export async function seedTasksForUser(userId) {
  const tasks = [];

  for (let i = 0; i < DEFAULT_TASKS.length; i++) {
    const t = DEFAULT_TASKS[i];
    const task = {
      taskId: uuidv4(),
      userId,
      title: t.title,
      description: '',
      status: 'To Do',
      category: t.category,
      dueDate: t.dueDate,
      sortOrder: i,
    };
    tasks.push(createTask(task));
  }

  return Promise.all(tasks);
}

export { DEFAULT_TASKS };
