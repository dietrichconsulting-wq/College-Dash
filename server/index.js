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
import discoveryRoutes from './routes/discovery.js';
import subscriptionRoutes from './routes/subscription.js';
import parentRoutes from './routes/parent.js';
import cronRoutes from './routes/cron.js';
import errorHandler from './middleware/errorHandler.js';
import requireSubscription from './middleware/requireSubscription.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Stripe webhook needs raw body for signature verification — must come before express.json()
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Public routes (no subscription check)
app.use('/api/profile', profileRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/cron', cronRoutes);

// Protected routes (subscription required)
app.use('/api/tasks', requireSubscription, taskRoutes);
app.use('/api/progress', requireSubscription, progressRoutes);
app.use('/api/colleges', requireSubscription, collegeRoutes);
app.use('/api/auth', requireSubscription, authRoutes);
app.use('/api/calendar', requireSubscription, calendarRoutes);
app.use('/api/chat', requireSubscription, chatRoutes);
app.use('/api/generate', requireSubscription, generateRoutes);
app.use('/api/scholarships', requireSubscription, scholarshipRoutes);
app.use('/api/portfolio', requireSubscription, portfolioRoutes);
app.use('/api/strategy', requireSubscription, strategyRoutes);
app.use('/api/discovery', requireSubscription, discoveryRoutes);

// Serve static frontend in production
app.use(express.static(resolve(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`College Dashboard server running on http://0.0.0.0:${PORT}`);
});
