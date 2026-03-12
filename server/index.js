import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import profileRoutes from './routes/profile.js';
import taskRoutes from './routes/tasks.js';
import progressRoutes from './routes/progress.js';
import collegeRoutes from './routes/colleges.js';
import authRoutes from './routes/auth.js';
import calendarRoutes from './routes/calendar.js';
import chatRoutes from './routes/chat.js';
import generateRoutes from './routes/generate.js';
import scholarshipRoutes from './routes/scholarships.js';
import portfolioRoutes from './routes/portfolio.js';
import strategyRoutes from './routes/strategy.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/strategy', strategyRoutes);

// Serve static frontend in production
app.use(express.static(resolve(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`College Dashboard server running on http://0.0.0.0:${PORT}`);
});
