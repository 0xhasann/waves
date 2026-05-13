import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),

  APP_BASE_URL: z.string().regex(/^https?:\/\/.+/, 'APP_BASE_URL must be a valid URL (http/https)'),

  GOOGLE_CLIENT_ID: z
    .string()
    .min(30)
    .regex(/\.apps\.googleusercontent\.com$/, 'Invalid Google Client ID format'),

  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(30)
    .regex(/^GOCSPX-/, 'Invalid Google Client Secret format'),

  DATABASE_URL: z.string().regex(/^.+\.db$/, 'DATABASE_URL must be a .db file path'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET should be at least 32 chars for security'),

  ACCESS_TYPE: z.enum(['online', 'offline'], {
    error: () => ({ message: 'ACCESS_TYPE must be either "online" or "offline"' }),
  }),

  NODE_ENV: z.enum(['dev', 'prod']).default('dev'),
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const appEnv = parsed.data;
