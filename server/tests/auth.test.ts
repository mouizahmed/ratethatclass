import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { validateAdmin, validateOwner, validateToken } from '../src/middleware/Auth';
import { AuthenticatedRequest } from '../src/types';
import { fakeUser, resetFakeUsers } from './helpers/fakeFirebase';

// A minimal app that echoes the authenticated uid, so each middleware is tested on its own
const app = express();
const echo = (req: express.Request, res: express.Response) => {
  res.json({ uid: (req as AuthenticatedRequest).user.uid });
};
app.get('/user', validateToken, echo);
app.get('/admin', validateAdmin, echo);
app.get('/owner', validateOwner, echo);

beforeEach(() => resetFakeUsers());

describe('validateToken', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/user');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('User not logged in');
  });

  it('rejects an invalid token', async () => {
    const res = await request(app).get('/user').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects an email user who has not verified their email', async () => {
    const headers = fakeUser('unverified', { emailVerified: false });
    const res = await request(app).get('/user').set(headers);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email not verified');
  });

  it('lets anonymous users through without email verification', async () => {
    const headers = fakeUser('anon', { anonymous: true, emailVerified: false });
    const res = await request(app).get('/user').set(headers);
    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('anon');
  });

  it('lets a verified user through', async () => {
    const res = await request(app).get('/user').set(fakeUser('student'));
    expect(res.status).toBe(200);
    expect(res.body.uid).toBe('student');
  });

  it('rejects a banned user and includes the reason', async () => {
    const headers = fakeUser('banned', { claims: { banned: true, ban_reason: 'spam' } });
    const res = await request(app).get('/user').set(headers);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Account banned: spam');
  });

  it.each([['admin'], ['owner']])('stops an %s from acting as a regular user', async (role) => {
    const res = await request(app).get('/user').set(fakeUser(role, { claims: { [role]: true } }));
    expect(res.status).toBe(403);
  });
});

describe('validateAdmin and validateOwner', () => {
  it('blocks regular users from admin and owner routes', async () => {
    const headers = fakeUser('student');
    expect((await request(app).get('/admin').set(headers)).status).toBe(403);
    expect((await request(app).get('/owner').set(headers)).status).toBe(403);
  });

  it('lets an admin into admin routes but not owner routes', async () => {
    const headers = fakeUser('admin', { claims: { admin: true } });
    expect((await request(app).get('/admin').set(headers)).status).toBe(200);
    expect((await request(app).get('/owner').set(headers)).status).toBe(403);
  });

  it('lets an owner into both', async () => {
    const headers = fakeUser('owner', { claims: { owner: true } });
    expect((await request(app).get('/admin').set(headers)).status).toBe(200);
    expect((await request(app).get('/owner').set(headers)).status).toBe(200);
  });

  it('rejects admin routes without a token', async () => {
    expect((await request(app).get('/admin')).status).toBe(401);
  });
});
