import { Request, Response } from 'express';
import rateLimit, { Options } from 'express-rate-limit';
import { AuthenticatedRequest } from '../types';

// Only write routes are limited. Reads are mostly server-side rendered by Next.js, so they all arrive from a few
// Vercel IPs and a per-IP limit there would throttle the whole site.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function limiter(windowMs: number, limit: number, options: Partial<Options> = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        data: {},
        meta: {},
      });
    },
    ...options,
  });
}

// Keyed by the verified Firebase uid, so these must run after the auth middleware
const byUser: Partial<Options> = { keyGenerator: (req) => (req as AuthenticatedRequest).user.uid };

/** Backstop for all write routes before auth runs. Loose, since a campus network can share one IP. */
export const ipWriteLimiter = limiter(15 * MINUTE, 300);

/** New reviews and new courses (each comes with a review) share one budget per user. */
export const contentLimiter = limiter(HOUR, 10, byUser);

export const voteLimiter = limiter(MINUTE, 30, byUser);

export const reportLimiter = limiter(HOUR, 10, byUser);

/** Unauthenticated routes, so these can only key on IP. */
export const registerLimiter = limiter(HOUR, 10);
export const universityRequestLimiter = limiter(HOUR, 30);
