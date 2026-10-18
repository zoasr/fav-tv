import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

dotenv.config();

// Pooled URL for request-per-query traffic; falls back to the direct URL so a
// single DATABASE_URL still works. Migrations use the direct URL instead —
// drizzle-kit wraps them in a transaction, which pgbouncer weakens.
const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;

// biome-ignore lint/style/noNonNullAssertion: env variable exists
export const db = drizzle(neon(url!));
