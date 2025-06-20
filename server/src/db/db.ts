import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(String(process.env.DB_PORT)),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  database: process.env.DB_NAME,
});

export { pool };
