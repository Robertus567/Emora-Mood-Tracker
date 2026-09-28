import { neon } from "@neondatabase/serverless";

// DATABASE_URL comes from Neon (see README.md for setup steps).
// Example: postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

let schemaReady = null;

// Creates the mood_entries table on first use. Safe to call on every
// request — CREATE TABLE IF NOT EXISTS is a no-op once it exists, and the
// promise is cached per server instance so it only actually runs once.
export function ensureSchema() {
  if (!sql) {
    throw new Error(
      "DATABASE_URL belum diatur. Tambahkan di .env.local (lokal) atau Environment Variables (Vercel)."
    );
  }
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id BIGSERIAL PRIMARY KEY,
        emotion VARCHAR(20) NOT NULL,
        confidence REAL NOT NULL,
        scores JSONB NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
