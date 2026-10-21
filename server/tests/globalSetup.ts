import { readFileSync } from 'fs';
import path from 'path';
import pg from 'pg';
import { testDb } from './dbConfig.mts';

// Builds a fresh schema from init-db.sql once per test run
export async function setup() {
  const admin = new pg.Client({ ...testDb, database: 'postgres' });
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDb.database]);
  if (!exists.rowCount) {
    await admin.query(`CREATE DATABASE "${testDb.database}"`);
  }
  await admin.end();

  const client = new pg.Client(testDb);
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await client.query(readFileSync(path.resolve(process.cwd(), '../init-db/init-db.sql'), 'utf8'));
  await client.end();
}
