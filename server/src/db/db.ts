import pg from 'pg';
const { Pool } = pg;
import * as dotenv from 'dotenv';
const config = dotenv.config().parsed;

const pool = new Pool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  database: config.DB_NAME,
});

export { pool };
