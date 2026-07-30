import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Configure the WebSocket constructor for the Neon serverless driver.
// Node.js 18+ (including Vercel serverless) has a built-in global WebSocket.
// Using the ws npm package fails in Vercel because it's a native module.
// Without this, the Pool will fail with "WebSocket is not defined".
neonConfig.webSocketConstructor = globalThis.WebSocket;

// NOTE: This driver uses PostgreSQL wire protocol over WebSocket and
// works with the pooled Neon endpoint (hostname containing "-pooler").
// The HTTP SQL driver (`neon()` + drizzle-orm/neon-http) requires the
// non-pooled endpoint and is NOT used here.

type DB = NeonDatabase<typeof schema>;

let dbInstance: DB | null = null;

function getDb(): DB {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured');
    }
    const pool = new Pool({ connectionString: databaseUrl });
    dbInstance = drizzle(pool, { schema });
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
