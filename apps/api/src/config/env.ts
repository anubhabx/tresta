import { z } from 'zod';

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3001'),

  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  SETTINGS_HMAC_SECRET: z.string().min(1, 'SETTINGS_HMAC_SECRET is required'),

  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SIGNING_SECRET is required'),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  ENABLE_REAL_EMAILS: z.enum(['true', 'false']).optional(),
  RESEND_API_KEY: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof baseSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.') || 'env';
      return `- ${path}: ${issue.message}`;
    })
    .join('\n');
}

function ensureConditionalRequirements(env: ValidatedEnv): void {
  const hasRazorpayKeys = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
  const hasRazorpayWebhookSecret = Boolean(env.RAZORPAY_WEBHOOK_SECRET);

  if (!hasRazorpayKeys) {
    console.warn('[env] Razorpay payment keys are not fully configured; payment endpoints may fail.');
  }

  if (!hasRazorpayWebhookSecret) {
    console.warn('[env] RAZORPAY_WEBHOOK_SECRET is missing; Razorpay webhook verification will fail.');
  }

  if (env.ENABLE_REAL_EMAILS === 'true' && !env.RESEND_API_KEY) {
    throw new Error('[env] ENABLE_REAL_EMAILS=true requires RESEND_API_KEY.');
  }
}

export function validateEnv(context: 'api' | 'worker'): ValidatedEnv {
  const parsed = baseSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = formatIssues(parsed.error);
    throw new Error(`[env] Invalid environment for ${context}:\n${details}`);
  }

  ensureConditionalRequirements(parsed.data);

  return parsed.data;
}
