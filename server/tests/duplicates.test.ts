import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app';
import { count, insertUser, pool, resetDb, reviewPayload, seedCourse } from './helpers/db';
import { fakeUser } from './helpers/fakeFirebase';

// The same submission sometimes reaches the server twice at once. Requests finish in milliseconds, so sending them
// with Promise.all alone rarely overlaps them; these tests hold a table lock that blocks inserts (but not reads) until
// every request is waiting on its insert, which forces the race every time.

let courseId: string;
let universityId: string;
// Fresh user ids per test, so the per-user rate limit (10 posts an hour) never carries over between tests
let run = 0;
const user = (name: string) => `${name}-${run}`;

beforeEach(async () => {
  run++;
  await resetDb();
  ({ courseId, universityId } = await seedCourse());
});

async function whileInsertsBlocked<T>(table: string, send: () => PromiseLike<T>[]) {
  const blocker = await pool.connect();
  try {
    await blocker.query('BEGIN');
    await blocker.query(`LOCK TABLE ${table} IN SHARE ROW EXCLUSIVE MODE`);
    const pending = Promise.all(send());
    await new Promise((resolve) => setTimeout(resolve, 500));
    await blocker.query('COMMIT');
    return await pending;
  } finally {
    blocker.release();
  }
}

const postReview = (uid: string, overrides: Record<string, unknown> = {}) =>
  request(app)
    .post('/review')
    .set(fakeUser(uid, { anonymous: true }))
    .send({ data: { course_id: courseId, ...reviewPayload(overrides) } });

const postCourse = (uid: string, course: Record<string, string>, overrides: Record<string, unknown> = {}) =>
  request(app)
    .post('/course')
    .set(fakeUser(uid, { anonymous: true }))
    .send({ data: { course: { university_id: universityId, ...course }, review: reviewPayload(overrides) } });

describe('POST /review', () => {
  it('stores one review when the same submission arrives three times at once', async () => {
    // A returning user, as in production: a brand-new user's row insert happens to serialize the requests on its own
    await insertUser(user('user-1'));
    const responses = await whileInsertsBlocked('reviews', () => [postReview(user('user-1')), postReview(user('user-1')), postReview(user('user-1'))]);
    expect(responses.map((res) => res.status)).toEqual([200, 200, 200]);
    expect(new Set(responses.map((res) => res.body.data.review_id)).size).toBe(1);
    expect(await count('reviews')).toBe(1);
    expect(await count('professors')).toBe(1);
  });

  it('still accepts a second review with different content', async () => {
    await postReview(user('user-1'));
    await postReview(user('user-1'), { course_comments: 'Changed my mind' });
    expect(await count('reviews')).toBe(2);
  });

  it('still accepts the same content from a different user', async () => {
    await postReview(user('user-1'));
    await postReview(user('user-2'));
    expect(await count('reviews')).toBe(2);
  });
});

describe('POST /course', () => {
  const newCourse = { course_tag: 'MATH 101', course_name: 'Calculus', department_name: 'Mathematics' };

  it('creates one course and one review when the same submission arrives three times at once', async () => {
    await insertUser(user('user-1'));
    const responses = await whileInsertsBlocked('courses', () => [
      postCourse(user('user-1'), newCourse),
      postCourse(user('user-1'), newCourse),
      postCourse(user('user-1'), newCourse),
    ]);
    expect(responses.map((res) => res.status)).toEqual([200, 200, 200]);
    expect(new Set(responses.map((res) => res.body.data.course.course_id)).size).toBe(1);
    expect(await count("courses WHERE course_tag = 'MATH 101'")).toBe(1);
    expect(await count('reviews')).toBe(1);
  });

  it('attaches a review to an existing course instead of creating a second copy', async () => {
    await postCourse(user('user-1'), newCourse);
    const res = await postCourse(user('user-2'), { ...newCourse, course_tag: 'math 101', department_name: 'Other' }, { course_comments: 'Second opinion' });
    expect(res.status).toBe(200);
    expect(await count("courses WHERE LOWER(course_tag) = 'math 101'")).toBe(1);
    expect(await count("departments WHERE department_name = 'Other'")).toBe(0);
    expect(await count('reviews')).toBe(2);
  });

  it('returns the existing review when a course that already exists is re-submitted identically', async () => {
    const first = await postReview(user('user-1'));
    const res = await postCourse(user('user-1'), { course_tag: 'CSC108', course_name: 'Intro to Programming', department_name: 'Computer Science' });
    expect(res.status).toBe(200);
    expect(res.body.data.course.course_id).toBe(courseId);
    expect(res.body.data.review.review_id).toBe(first.body.data.review_id);
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM reviews');
    expect(rows[0].n).toBe(1);
  });
});
