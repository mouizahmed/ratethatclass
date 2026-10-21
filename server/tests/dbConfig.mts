// Tests wipe and rebuild this database, so refuse anything that isn't clearly a test database
export const testDb = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 55432),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'ratethatclass_test',
};

if (!testDb.database.endsWith('_test')) {
  throw new Error(`Refusing to run tests against "${testDb.database}": the database name must end in _test`);
}
