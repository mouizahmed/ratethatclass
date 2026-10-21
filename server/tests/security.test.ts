import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app';
import { insertReview, insertUser, pool, resetDb, seedCourse } from './helpers/db';
import { auth, fakeUser, getFakeUser, resetFakeUsers } from './helpers/fakeFirebase';

let courseId: string;

beforeEach(async () => {
  resetFakeUsers();
  await resetDb();
  ({ courseId } = await seedCourse());
});

describe('GET /report (reviewer emails must stay private)', () => {
  beforeEach(async () => {
    await insertUser('reviewer', 'student', 'reviewer@utoronto.ca');
    const reviewId = await insertReview(courseId, 'reviewer');
    await insertUser('reporter');
    await pool.query("INSERT INTO reports (user_id, entity_type, entity_id, report_reason) VALUES ('reporter', 'review', $1, 'spam')", [
      reviewId,
    ]);
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/report?entity_type=review');
    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain('reviewer@utoronto.ca');
  });

  it('rejects regular users', async () => {
    const res = await request(app).get('/report?entity_type=review').set(fakeUser('student'));
    expect(res.status).toBe(403);
  });

  it('returns reports to admins', async () => {
    const res = await request(app).get('/report?entity_type=review').set(fakeUser('admin', { claims: { admin: true } }));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].entity_details.reviewer_email).toBe('reviewer@utoronto.ca');
  });
});

describe('sort_by (SQL injection)', () => {
  it.each([['/review'], ['/review/by-course-id/:courseId']])('ignores a malicious sort_by on %s', async (route) => {
    await insertReview(courseId, 'reviewer');
    const started = Date.now();
    const res = await request(app).get(
      `${route.replace(':courseId', courseId)}?page=1&limit=10&sort_by=${encodeURIComponent('(SELECT pg_sleep(2))')}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(Date.now() - started).toBeLessThan(1500);
  });

  it('still sorts by an allowed column', async () => {
    await insertReview(courseId, 'many-votes', 9);
    await insertReview(courseId, 'few-votes', 1);
    const res = await request(app).get(`/review/by-course-id/${courseId}?page=1&limit=10&sort_by=votes&sort_order=asc`);
    expect(res.body.data.map((review: { votes: number }) => review.votes)).toEqual([1, 9]);
  });
});

describe('reviewer anonymity', () => {
  it('never returns a reviewer user_id from public review endpoints', async () => {
    await insertReview(courseId, 'secret-uid');
    for (const route of [`/review/by-course-id/${courseId}?page=1&limit=10`, '/review']) {
      const res = await request(app).get(route);
      expect(res.status).toBe(200);
      expect(res.body.data[0]).not.toHaveProperty('user_id');
      expect(JSON.stringify(res.body)).not.toContain('secret-uid');
    }
  });

  it("doesn't leak authors through a user's upvoted reviews", async () => {
    const reviewId = await insertReview(courseId, 'secret-uid');
    await insertUser('voter');
    await pool.query("INSERT INTO user_votes (user_id, review_id, vote) VALUES ('voter', $1, 'up')", [reviewId]);
    const res = await request(app).get('/user/upvoted-reviews').set(fakeUser('voter'));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(JSON.stringify(res.body)).not.toContain('secret-uid');
  });

  it('/review/owned returns only the caller’s own reviews', async () => {
    const mine = await insertReview(courseId, 'me');
    const theirs = await insertReview(courseId, 'someone-else');
    const res = await request(app).get(`/review/owned?review_ids=${mine},${theirs}`).set(fakeUser('me', { anonymous: true }));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([mine]);
  });
});

describe('removed and hardened routes', () => {
  it('no longer allows creating a department without logging in', async () => {
    const res = await request(app).post('/department').send({ department_name: 'Junk', university_id: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('student badge from the email domain', () => {
  it.each([
    ['me@utoronto.ca', 'student'],
    ['me@mail.utoronto.ca', 'student'],
    ['ME@UTORONTO.CA', 'student'],
    ['me@notutoronto.ca', 'user'],
    ['me@utoronto.ca.evil.com', 'user'],
    ['me@gmail.com', 'user'],
  ])('registers %s as a %s', async (email, accountType) => {
    const res = await request(app).post('/user/register').send({ data: { email, password: 'password123' } });
    expect(res.status).toBe(200);
    const { rows } = await pool.query('SELECT account_type FROM users WHERE email = $1', [email]);
    expect(rows[0].account_type).toBe(accountType);
    expect(auth.setCustomUserClaims).toHaveBeenLastCalledWith(`uid-${email}`, { account_type: accountType });
  });
});

describe('banning keeps the account type', () => {
  it('keeps a student badge through a ban and an unban', async () => {
    await insertUser('student-1', 'student', 'student@utoronto.ca');
    await insertUser('admin-1', 'admin', 'admin@example.com');
    fakeUser('student-1', { claims: { account_type: 'student' } });
    const admin = fakeUser('admin-1', { claims: { admin: true } });

    const ban = await request(app).post('/admin/users/student-1/ban').set(admin).send({ data: { ban_reason: 'spam' } });
    expect(ban.status).toBe(200);
    expect(getFakeUser('student-1')?.claims).toEqual({ account_type: 'student', banned: true, ban_reason: 'spam' });

    const unban = await request(app).patch('/admin/users/student-1/unban').set(admin);
    expect(unban.status).toBe(200);
    expect(getFakeUser('student-1')?.claims).toEqual({ account_type: 'student', banned: false, ban_reason: null });
  });
});
