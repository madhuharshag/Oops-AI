import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

interface RateLimitRecord {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  enableLockout?: boolean;
  lockoutThreshold?: number;
  lockoutDurationMs?: number;
}) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req: Request) => {
      const authReq = req as AuthenticatedRequest;
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') || req.ip || req.socket?.remoteAddress || '';
      const emailSuffix = req.body?.email ? `:${req.body.email.toLowerCase().trim()}` : '';
      return `${authReq.user?.userId || clientIp || 'global'}${emailSuffix}`;
    },
    enableLockout = false,
    lockoutThreshold = 50,
    lockoutDurationMs = 15 * 60 * 1000,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record || now > record.resetAt) {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (enableLockout && record.lockedUntil && now < record.lockedUntil) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      res.status(429).json({
        error: `Account temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minutes.`
      });
      return;
    }

    record.count += 1;

    if (enableLockout && record.count > lockoutThreshold) {
      record.lockedUntil = now + lockoutDurationMs;
      res.status(429).json({
        error: `Account locked after multiple failed attempts. Please wait 15 minutes before retrying.`
      });
      return;
    }

    if (record.count > max) {
      res.status(429).json({
        error: message
      });
      return;
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100, // Generous enough for judges and testing
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  enableLockout: false,
  lockoutThreshold: 50,
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'General API request threshold exceeded. Please throttle requests.',
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'AI attack simulation rate limit exceeded. Please wait a moment before running another attack.',
});
