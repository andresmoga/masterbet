import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startScraperCron } from './jobs/scraperCron';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const PORT = parseInt(env.PORT, 10);
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${PORT}`);
    });

    // Start scraper cron job
    startScraperCron();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
