import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * IMPORTANT: DATABASE_URL must use the NON-POOLED Neon endpoint.
 *
 * The neon() HTTP driver sends queries as HTTP POST to https://<host>/sql.
 * Neon's PgBouncer pooler (hostnames containing "-pooler") only speaks the
 * PostgreSQL wire protocol and does NOT serve HTTP SQL — runtime queries will
 * fail with connection errors.
 *
 * Correct format:
 *   postgresql://user:pass@ep-<name>.<region>.aws.neon.tech/db?sslmode=require
 *
 * NOT the pooled endpoint:
 *   postgresql://user:pass@ep-<name>-pooler.<region>.aws.neon.tech/db?sslmode=require
 *
 * The migration script (src/db/migrate.ts) uses pg.Pool which speaks wire
 * protocol and works with both endpoints, but the app runtime must use
 * the non-pooled URL.
 */

type DB = NeonHttpDatabase<typeof schema>;

let dbInstance: DB | null = null;

function getDb(): DB {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured');
    }
    const sql = neon(databaseUrl);
    dbInstance = drizzle(sql, { schema }) as DB;
  }
  return dbInstance;
}

// Lazy proxy that preserves full Drizzle type information
export const db: DB = new Proxy({} as DB, {
  get(_, prop: string | symbol) {
    return (getDb() as any)[prop];
  },
}) as DB;

export { schema };
