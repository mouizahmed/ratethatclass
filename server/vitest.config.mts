import { defineConfig } from 'vitest/config';
import { testDb } from './tests/dbConfig.mts';

export default defineConfig({
  test: {
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setup.ts'],
    // Test files share one database, so run them one at a time
    fileParallelism: false,
    env: {
      DB_HOST: testDb.host,
      DB_PORT: String(testDb.port),
      DB_USER: testDb.user,
      DB_PASS: testDb.password,
      DB_NAME: testDb.database,
    },
  },
});
