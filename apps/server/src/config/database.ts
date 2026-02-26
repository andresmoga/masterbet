import { db, sql } from '@masterbet/database';
import { logger } from '../utils/logger';

export { db };

export async function connectDatabase() {
  try {
    // Test the connection
    await sql`SELECT 1`;
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await sql.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}
