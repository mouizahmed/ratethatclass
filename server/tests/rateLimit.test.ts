import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { insertReview, resetDb, seedCourse } from './helpers/db';
import { fakeUser } from './helpers/fakeFirebase';

// Limits are counted in memory per test file, so each test uses its own users and IPs

let courseId: string;

beforeAll(async () => {
  await resetDb();
  ({ courseId } = await seedCourse());
});

const postReview = (headers: Record<string, string>, n: number) =>
  request(app)
    .post('/review')
    .set(headers)
    .send({ data: { course_id: courseId, professor_name: 'Jane Doe', grade: 'A', delivery_method: 'In-Person', workload: 'Moderate',
      textbook_use: 'No', evaluation_methods: ['Assignment Heavy'], overall_score: 4, easy_score: 3, interest_score: 5,
      useful_score: 4, term_taken: 'Fall', year_taken: 2024, course_comments: `Review number ${n}` } });

describe('per-user limits', () => {
  it('allows 10 new reviews an hour, then returns 429', async () => {
    const headers = fakeUser('prolific', { anonymous: true });
    for (let n = 1; n <= 10; n++) {
      expect((await postReview(headers, n)).status).toBe(200);
    }
    const blocked = await postReview(headers, 11);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ success: false, message: 'Too many requests, please try again later.', data: {}, meta: {} });
  });

  it('limits each user separately', async () => {
    const headers = fakeUser('someone-else', { anonymous: true });
    expect((await postReview(headers, 1)).status).toBe(200);
  });

  it('allows 30 votes a minute, then returns 429', async () => {
    const reviewId = await insertReview(courseId, 'author');
    const headers = fakeUser('voter', { anonymous: true });
    const vote = () => request(app).post('/review/vote').set(headers).send({ data: { review_id: reviewId, vote_type: 'up' } });
    for (let n = 1; n <= 30; n++) {
      expect((await vote()).status).not.toBe(429);
    }
    expect((await vote()).status).toBe(429);
  });
});

describe('per-IP limits', () => {
  const register = (ip: string, n: number) =>
    request(app)
      .post('/user/register')
      .set('X-Forwarded-For', ip)
      .send({ data: { email: `user${n}-${ip}@gmail.com`, password: 'password123' } });

  it('allows 10 registrations an hour from one IP, then returns 429', async () => {
    for (let n = 1; n <= 10; n++) {
      expect((await register('203.0.113.1', n)).status).toBe(200);
    }
    expect((await register('203.0.113.1', 11)).status).toBe(429);
    expect((await register('203.0.113.2', 1)).status).toBe(200);
  });
});

describe('reads', () => {
  it('are never rate limited', async () => {
    for (let n = 0; n < 50; n++) {
      expect((await request(app).get('/university')).status).toBe(200);
    }
  });
});
