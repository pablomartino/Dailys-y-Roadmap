const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a parameterized query against the pool
 */
function query(text, params) {
  return pool.query(text, params);
}

/**
 * Initialize the database schema by running init.sql
 */
async function initDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('✓ Database schema initialized');
  } catch (err) {
    console.error('✗ Failed to initialize database:', err.message);
    throw err;
  }
}

module.exports = { query, initDB, pool };
