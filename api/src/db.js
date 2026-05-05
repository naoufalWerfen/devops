const { Pool } = require('pg');
const fs = require('fs');

function readSecret(path) {
  try {
    return fs.readFileSync(path, 'utf8').trim();
  } catch {
    return null;
  }
}

const password =
  readSecret(process.env.DB_PASSWORD_FILE) ||
  process.env.DB_PASSWORD ||
  'devops';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'devops_dashboard',
  user: process.env.DB_USER || 'devops',
  password,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en pool de PostgreSQL', err);
});

module.exports = { pool };
