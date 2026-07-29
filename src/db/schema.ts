import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionTier: text('subscription_tier', { 
    enum: ['free', 'starter', 'pro', 'practice', 'agency'] 
  }).notNull().default('free'),
  subscriptionStatus: text('subscription_status').notNull().default('active'),
  aiGenerationsUsed: integer('ai_generations_used').notNull().default(0),
  aiGenerationLimit: integer('ai_generation_limit').notNull().default(10),
});

export const practices = sqliteTable('practices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  practiceName: text('practice_name').notNull(),
  practiceType: text('practice_type').notNull(),
  city: text('city'),
  state: text('state'),
  services: text('services'),
  targetCustomers: text('target_customers'),
  websiteUrl: text('website_url'),
  phone: text('phone'),
  hours: text('hours'),
  bookingUrl: text('booking_url'),
  brandVoice: text('brand_voice'),
  communicationStyle: text('communication_style'),
  businessGoals: text('business_goals'),
  growthScore: integer('growth_score').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const marketingPlans = sqliteTable('marketing_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  practiceId: integer('practice_id').notNull().references(() => practices.id),
  goal: text('goal').notNull(),
  targetService: text('target_service'),
  planData: text('plan_data').notNull(),
  daysCompleted: integer('days_completed').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const growthScoreLeads = sqliteTable('growth_score_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  practiceName: text('practice_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  practiceType: text('practice_type').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  email: text('email').notNull(),
  score: integer('score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const websiteLeads = sqliteTable('website_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  practiceId: integer('practice_id').notNull().references(() => practices.id),
  userId: integer('user_id').notNull().references(() => users.id),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  budgetRange: text('budget_range'),
  message: text('message'),
  status: text('status', { enum: ['new', 'contacted', 'in_progress', 'completed'] }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
