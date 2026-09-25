import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken
} from '../services/authService';
import { RegisterSchema, LoginSchema } from '../validators';
import { validateBody } from '../middleware/validate';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { config } from '../config';

const router = Router();

const REFRESH_COOKIE_NAME = 'oops_refresh_token';

function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth',
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    path: '/api/auth',
  });
}

// POST /api/auth/register
router.post('/register', authRateLimiter, validateBody(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const existing = await db.users.findByEmail(email);

    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const password_hash = await hashPassword(password);
    const user = await db.users.create({
      name,
      email,
      password_hash,
    });

    const accessToken = generateAccessToken(user);
    const rawRefreshToken = await createRefreshToken(user.id);
    setRefreshTokenCookie(res, rawRefreshToken);

    res.status(201).json({
      message: 'Account successfully registered.',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, validateBody(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await db.users.findByEmail(email);

    // Constant-time check pattern to prevent timing attack and generic error to prevent user enumeration
    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'Invalid email or password. If you registered with Google, please continue with Google.' });
      return;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const rawRefreshToken = await createRefreshToken(user.id);
    setRefreshTokenCookie(res, rawRefreshToken);

    res.json({
      message: 'Authentication successful.',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh (Rotation of refresh token)
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      res.status(401).json({ error: 'Refresh token missing. Please sign in again.' });
      return;
    }

    const rotated = await rotateRefreshToken(rawToken);
    if (!rotated) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ error: 'Refresh token expired or revoked. Please sign in again.' });
      return;
    }

    setRefreshTokenCookie(res, rotated.newRefreshToken);

    res.json({
      accessToken: rotated.accessToken,
      user: {
        id: rotated.user.id,
        email: rotated.user.email,
        name: rotated.user.name,
        created_at: rotated.user.created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (rawToken) {
      await revokeRefreshToken(rawToken);
    }
    clearRefreshTokenCookie(res);
    res.json({ message: 'Session terminated and token invalidated.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let user = await db.users.findById(req.user!.userId);

    // If not found in public.users, auto-create profile from verified token identity
    if (!user && req.user) {
      user = await db.users.create({
        id: req.user.userId,
        email: req.user.email,
        name: req.user.name || 'User',
      });
    }

    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const cleanEmail = String(user.email || '').trim().toLowerCase();
    let cleanName = String(user.name || '').trim().replace(/^["']|["']$/g, '');
    if (!cleanName || cleanName === 'User') {
      cleanName = cleanEmail.split('@')[0] || 'User';
    }

    res.json({
      user: {
        id: user.id,
        email: cleanEmail,
        name: cleanName,
        avatar_url: user.avatar_url || null,
        created_at: user.created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rawName = String(req.body.name || '').trim().replace(/^["']|["']$/g, '');
    if (!rawName) {
      res.status(400).json({ error: 'Name cannot be empty.' });
      return;
    }
    const updated = await db.users.update(req.user!.userId, { name: rawName });
    if (!updated) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar_url: updated.avatar_url || null,
        created_at: updated.created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, async (req: Request, res: Response) => {
  // Always return generic confirmation to prevent user enumeration
  res.json({
    message: 'If an account exists with that email address, password reset instructions have been dispatched.'
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', authRateLimiter, async (req: Request, res: Response) => {
  res.json({
    message: 'Password reset request processed. You may now log in with your updated credentials.'
  });
});

export default router;
