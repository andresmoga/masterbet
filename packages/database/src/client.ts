import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/masterbet';

// Create postgres client
export const sql = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Export schema
export { schema };
