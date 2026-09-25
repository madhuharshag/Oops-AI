import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { initDatabase, db } from './db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import labRoutes from './routes/labRoutes';
import attackRoutes from './routes/attackRoutes';
import policyRoutes from './routes/policyRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

// Security Headers (Helmet.js)
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible Swagger UI and client assets
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS Configuration with Credentials Support
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and specified client origin
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === config.clientUrl) {
      callback(null, true);
    } else {
      callback(null, true); // For hackathon demo flexibility
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Oops! AI Security Engine',
    database: db.isPostgres() ? 'supabase-postgresql' : 'in-memory-fallback',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// General API Rate Limiting
app.use('/api', apiRateLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/attacks', attackRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
async function startServer() {
  await initDatabase();

  const server = app.listen(config.port, () => {
    console.log(`[Oops! AI Server] Running on http://localhost:${config.port}`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().catch(err => {
    console.error('[Oops! AI Server] Fatal startup failure:', err);
    process.exit(1);
  });
}

export { app, startServer };
