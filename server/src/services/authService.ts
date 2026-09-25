import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db, User } from '../db';
import { config } from '../config';

const BCRYPT_SALT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateAccessToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn as any }
  );
}

export async function createRefreshToken(userId: string): Promise<string> {
  // Generate cryptographically secure opaque token (64 bytes hex)
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);

  // Default 30 days expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.refreshTokens.create(userId, tokenHash, expiresAt);
  return rawToken;
}

export async function rotateRefreshToken(oldRawToken: string): Promise<{ accessToken: string; newRefreshToken: string; user: User } | null> {
  const oldHash = hashToken(oldRawToken);
  const activeRecord = await db.refreshTokens.findActive(oldHash);

  if (!activeRecord) {
    return null;
  }

  // Revoke old token immediately (Rotation)
  await db.refreshTokens.revoke(oldHash);

  const user = await db.users.findById(activeRecord.user_id);
  if (!user) {
    return null;
  }

  // Issue new pair
  const accessToken = generateAccessToken(user);
  const newRefreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    newRefreshToken,
    user
  };
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const hash = hashToken(rawToken);
  await db.refreshTokens.revoke(hash);
}

export function verifyAccessToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string; name: string };
    return decoded;
  } catch {
    // If not signed with internal secret, check if it's a Supabase Auth JWT
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && (decoded.iss?.includes('supabase') || decoded.role === 'authenticated' || decoded.aud === 'authenticated')) {
        const userId = decoded.sub;
        const email = decoded.email || decoded.user_metadata?.email || '';
        const name = decoded.user_metadata?.name || decoded.user_metadata?.full_name || email.split('@')[0] || 'User';
        if (userId) {
          return { userId, email, name };
        }
      }
    } catch {}
    return null;
  }
}
