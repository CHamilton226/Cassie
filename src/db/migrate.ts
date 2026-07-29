import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_tier TEXT NOT NULL DEFAULT 'free',
        subscription_status TEXT NOT NULL DEFAULT 'active',
        ai_generations_used INTEGER NOT NULL DEFAULT 0,
        ai_generation_limit INTEGER NOT NULL DEFAULT 10
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS practices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        practice_name TEXT NOT NULL,
        practice_type TEXT NOT NULL,
        city TEXT,
        state TEXT,
        services TEXT,
        target_customers TEXT,
        website_url TEXT,
        phone TEXT,
        hours TEXT,
        booking_url TEXT,
        brand_voice TEXT,
        communication_style TEXT,
        business_goals TEXT,
        growth_score INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS website_leads (
        id SERIAL PRIMARY KEY,
        practice_id INTEGER NOT NULL REFERENCES practices(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        budget_range TEXT,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS marketing_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        practice_id INTEGER NOT NULL REFERENCES practices(id),
        goal TEXT NOT NULL,
        target_service TEXT,
        plan_data TEXT NOT NULL,
        days_completed INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS growth_score_leads (
        id SERIAL PRIMARY KEY,
        practice_name TEXT NOT NULL,
        website_url TEXT NOT NULL,
        practice_type TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        email TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_practices_user_id ON practices(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_website_leads_user_id ON website_leads(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_website_leads_practice_id ON website_leads(practice_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_marketing_plans_user_id ON marketing_plans(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_marketing_plans_practice_id ON marketing_plans(practice_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_growth_score_leads_email ON growth_score_leads(email);`);

    console.log('Migrations complete!');
    console.log('Tables created: users, practices, audit_log, password_reset_tokens, website_leads, marketing_plans, growth_score_leads');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
