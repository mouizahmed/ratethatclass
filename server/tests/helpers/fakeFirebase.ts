import { vi } from 'vitest';

// Stands in for firebase-admin's Auth. A user's token is `token:<uid>`; claims live here like custom claims do in
// Firebase, and setCustomUserClaims replaces them all, as the real one does.

interface FakeUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  anonymous: boolean;
  claims: Record<string, unknown>;
}

const users = new Map<string, FakeUser>();

/** Registers a user and returns the Authorization header that authenticates as them. */
export function fakeUser(uid: string, options: Partial<Omit<FakeUser, 'uid'>> = {}) {
  users.set(uid, { uid, emailVerified: true, anonymous: false, claims: {}, ...options });
  return { Authorization: `Bearer token:${uid}` };
}

export function getFakeUser(uid: string) {
  return users.get(uid);
}

export function resetFakeUsers() {
  users.clear();
}

export const auth = {
  verifyIdToken: vi.fn(async (token: string) => {
    const user = token.startsWith('token:') ? users.get(token.slice('token:'.length)) : undefined;
    if (!user) {
      throw new Error('Invalid token');
    }
    return {
      uid: user.uid,
      user_id: user.uid,
      email: user.email,
      ...(user.anonymous ? { provider_id: 'anonymous' } : {}),
      ...user.claims,
    };
  }),
  getUser: vi.fn(async (uid: string) => {
    const user = users.get(uid);
    if (!user) {
      throw Object.assign(new Error('User not found'), { code: 'auth/user-not-found' });
    }
    return { uid, email: user.email, emailVerified: user.emailVerified, customClaims: { ...user.claims } };
  }),
  setCustomUserClaims: vi.fn(async (uid: string, claims: Record<string, unknown> | null) => {
    const user = users.get(uid);
    if (user) {
      user.claims = { ...(claims ?? {}) };
    }
  }),
  createUser: vi.fn(async ({ email }: { email: string }) => {
    const uid = `uid-${email}`;
    users.set(uid, { uid, email, emailVerified: false, anonymous: false, claims: {} });
    return { uid };
  }),
  createCustomToken: vi.fn(async (uid: string) => `custom:${uid}`),
  deleteUser: vi.fn(async (uid: string) => {
    users.delete(uid);
  }),
  getUserByEmail: vi.fn(),
};

export const app = {};
