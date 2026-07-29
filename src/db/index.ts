import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

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
