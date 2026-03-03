import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

import oddsRoutes from './routes/odds.routes';

// Import routes (will be created later)
// import authRoutes from './routes/auth.routes';
// import matchesRoutes from './routes/matches.routes';
// import betsRoutes from './routes/bets.routes';
// import aiRoutes from './routes/ai.routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API routes
  app.use('/api/odds', oddsRoutes);
  // app.use('/api/auth', authRoutes);
  // app.use('/api/matches', matchesRoutes);
  // app.use('/api/bets', betsRoutes);
  // app.use('/api/ai', aiRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
