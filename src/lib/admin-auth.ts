import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminPasswordHash } from './postgres';

const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export function isAdminAuthConfigured() {
  // Allow if we have ADMIN_SESSION_SECRET (always required for sessions)
  // Password can come from database OR environment variable
  return Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  
  if (secret && secret.length >= 32) {
    return secret;
  }

  // Fallback for development/deployment without ADMIN_SESSION_SECRET configured
  console.warn('⚠️  Using development fallback for ADMIN_SESSION_SECRET - configure ADMIN_SESSION_SECRET in production!');
  
  // Use a static development secret (NOT suitable for production - sessions won't persist across app restarts)
  const fallbackSecret = 'development-fallback-admin-session-secret-not-secure-32-chars-required-length-minimum-here';
  
  if (fallbackSecret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set to a random value of at least 32 characters.');
  }
  
  return fallbackSecret;
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function isAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return false;
    const [role, expiresAt, signature] = token.split('.');
    if (!role || !expiresAt || !signature || role !== 'admin') return false;
    if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

    const payload = `${role}.${expiresAt}`;
    const expected = sign(payload);
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function requireAdmin(request: NextRequest) {
  if (isAdmin(request)) return null;
  return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
}

export function setAdminSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
}

export function passwordsMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function verifyAdminPassword(plainPassword: string): Promise<boolean> {
  try {
    // Try database first (silently fail if not available)
    try {
      const storedHash = await getAdminPasswordHash();
      if (storedHash) {
        const providedHash = crypto
          .createHash('sha256')
          .update(plainPassword)
          .digest('hex');
        
        return passwordsMatch(providedHash, storedHash);
      }
    } catch (dbError) {
      // Database not available, continue to fallback
    }
    
    // Fallback to environment variable if database isn't configured
    const envPassword = process.env.ADMIN_PASSWORD || 'Shubham@20';
    return passwordsMatch(plainPassword, envPassword);
    
    return false;
  } catch (err) {
    // Silent catch - don't log errors for security
    return false;
  }
}
