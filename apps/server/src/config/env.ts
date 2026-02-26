import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  SCRAPER_HEADLESS: z.string().default('true'),
  SCRAPER_TIMEOUT: z.string().default('30000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
