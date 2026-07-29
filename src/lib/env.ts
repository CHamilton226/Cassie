// Environment variables with development fallbacks
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production-abc123',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const;
