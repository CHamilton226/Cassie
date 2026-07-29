import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  subscriptionStatus: text('subscription_status').notNull().default('active'),
  aiGenerationsUsed: integer('ai_generations_used').notNull().default(0),
  aiGenerationLimit: integer('ai_generation_limit').notNull().default(10),
});

export const practices = pgTable('practices', {
  id: serial('id').primaryKey(),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const marketingPlans = pgTable('marketing_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  practiceId: integer('practice_id').notNull().references(() => practices.id),
  goal: text('goal').notNull(),
  targetService: text('target_service'),
  planData: text('plan_data').notNull(),
  daysCompleted: integer('days_completed').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const growthScoreLeads = pgTable('growth_score_leads', {
  id: serial('id').primaryKey(),
  practiceName: text('practice_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  practiceType: text('practice_type').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  email: text('email').notNull(),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const websiteLeads = pgTable('website_leads', {
  id: serial('id').primaryKey(),
  practiceId: integer('practice_id').notNull().references(() => practices.id),
  userId: integer('user_id').notNull().references(() => users.id),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  budgetRange: text('budget_range'),
  message: text('message'),
  status: text('status').notNull().default('new'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
