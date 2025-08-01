import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For development, we'll use a conditional check
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not set. Database operations will fail.');
}

const sql = connectionString ? postgres(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : null;
