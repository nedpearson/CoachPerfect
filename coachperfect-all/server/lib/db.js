// ═══════════════════════════════════════════════════
// COACH PERFECT — POSTGRESQL CONNECTION POOL
// ═══════════════════════════════════════════════════
//
// Uses the `pg` package (node-postgres).
// All queries go through this shared pool.
//
// Usage:
//   const { query, getClient } = require('./db');
//
//   // Simple query
//   const { rows } = await query('SELECT * FROM clients WHERE coach_id = $1', [coachId]);
//
//   // Transaction
//   const client = await getClient();
//   try {
//     await client.query('BEGIN');
//     await client.query('INSERT INTO wins ...', [...]);
//     await client.query('COMMIT');
//   } catch (e) {
//     await client.query('ROLLBACK');
//     throw e;
//   } finally {
//     client.release();
//   }

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'coachperfect',
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || '',
  max:      10,                  // max connections in pool
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// Test connection on startup
pool.query('SELECT 1').then(() => {
  console.log(`  → DB: Connected to PostgreSQL (${process.env.PG_DATABASE || 'coachperfect'})`);
}).catch((err) => {
  console.error(`  → DB: Connection failed — ${err.message}`);
  console.error('     Check PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD in .env');
});

/**
 * Run a single query.
 * @param {string} text  — SQL with $1, $2 ... placeholders
 * @param {any[]}  [params] — parameter values
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const ms = Date.now() - start;
    if (ms > 500) console.warn(`[DB] Slow query (${ms}ms): ${text.substring(0, 80)}`);
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err.message, '\n  SQL:', text.substring(0, 200));
    throw err;
  }
}

/**
 * Acquire a client from the pool for transactions.
 * Caller is responsible for client.release().
 */
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
