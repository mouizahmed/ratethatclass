import { afterAll, vi } from 'vitest';

// Every test runs against the fake Firebase Auth in helpers/fakeFirebase.ts
vi.mock('../src/firebase/firebase', () => import('./helpers/fakeFirebase'));

afterAll(async () => {
  const { pool } = await import('../src/db/db');
  await pool.end();
});
