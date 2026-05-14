// src/config/env.ts
import { config } from 'dotenv';
import { z } from 'zod';

// Load .env into process.env before we read it
config();

/**
 * Single source of truth for all environment configuration.
 * Parsed and validated ONCE at boot. If anything is invalid,
 * the process exits immediately rather than failing later at runtime.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // coerce: env vars are always strings; this turns "3000" into 3000
  PORT: z.coerce.number().int().positive().default(3000),

  HOST: z.string().min(1).default('0.0.0.0'),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail loud, fail early — never boot with bad config
  console.error('❌ Invalid environment variables:\n');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;