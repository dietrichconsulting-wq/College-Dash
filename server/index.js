import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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
import requireAuth from './middleware/requireAuth.js';
import requireSubscription from './middleware/requireSubscription.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS: only allow our own origins ────────────────────
const allowedOrigins = [
  'https://stairwayu.com',
  'https://www.stairwayu.com',
  process.env.NODE_ENV !== 'production' && 'http://localhost:5173',
  process.env.NODE_ENV !== 'production' && 'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Rate limiting ───────────────────────────────────────
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,                   // 50 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,                  // authenticated users get higher limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Stripe webhook needs raw body for signature verification — must come before express.json()
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Public routes (no auth required — rate-limited)
app.use('/api/profile', publicLimiter, profileRoutes);
app.use('/api/subscription', publicLimiter, subscriptionRoutes);
app.use('/api/parent', publicLimiter, parentRoutes);
app.use('/api/cron', cronRoutes); // protected by CRON_SECRET, not rate-limited

// Protected routes (JWT auth + subscription check + rate-limited)
app.use('/api/tasks', authLimiter, requireAuth, requireSubscription, taskRoutes);
app.use('/api/progress', authLimiter, requireAuth, requireSubscription, progressRoutes);
app.use('/api/colleges', authLimiter, requireAuth, requireSubscription, collegeRoutes);
app.use('/api/auth', authLimiter, requireAuth, requireSubscription, authRoutes);
app.use('/api/calendar', authLimiter, requireAuth, requireSubscription, calendarRoutes);
app.use('/api/chat', authLimiter, requireAuth, requireSubscription, chatRoutes);
app.use('/api/generate', authLimiter, requireAuth, requireSubscription, generateRoutes);
app.use('/api/scholarships', authLimiter, requireAuth, requireSubscription, scholarshipRoutes);
app.use('/api/portfolio', authLimiter, requireAuth, requireSubscription, portfolioRoutes);
app.use('/api/strategy', authLimiter, requireAuth, requireSubscription, strategyRoutes);
app.use('/api/discovery', authLimiter, requireAuth, requireSubscription, discoveryRoutes);

// Serve static frontend in production
app.use(express.static(resolve(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`College Dashboard server running on http://0.0.0.0:${PORT}`);
});
