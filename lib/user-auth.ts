import { and, eq, gt } from 'drizzle-orm';
import { getDb } from '@/db';
import { users, userSessions } from '@/db/schema';

const COOKIE_NAME = 'apptuario_session';
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const PBKDF2_ITERATIONS = 210_000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  courtName: string | null;
  courtId: string | null;
  courtCircuit: number | null;
  courtType: string | null;
};

export async function hashPassword(password: string, salt = randomToken(16)) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: fromBase64Url(salt),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );
  return { hash: toBase64Url(new Uint8Array(bits)), salt };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expected: string,
) {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqual(hash, expected);
}

export async function createSession(userId: string, request: Request) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  await getDb().insert(userSessions).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    expiresAt,
  });
  return sessionCookie(token, request, SESSION_SECONDS);
}

export async function getSessionUser(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const records = await getDb()
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      courtName: users.courtName,
      courtId: users.courtId,
      courtCircuit: users.courtCircuit,
      courtType: users.courtType,
    })
    .from(userSessions)
    .innerJoin(users, eq(userSessions.userId, users.id))
    .where(
      and(
        eq(userSessions.tokenHash, tokenHash),
        gt(userSessions.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);
  const user = records[0];
  if (!user?.username) return null;
  return user as AuthenticatedUser;
}

export async function deleteSession(request: Request) {
  const token = readCookie(request, COOKIE_NAME);
  if (token) {
    await getDb()
      .delete(userSessions)
      .where(eq(userSessions.tokenHash, await sha256(token)));
  }
  return sessionCookie('', request, 0);
}

export function validatePassword(password: string) {
  return (
    password.length >= 12 &&
    password.length <= 128 &&
    /[a-záéíóúñ]/.test(password) &&
    /[A-ZÁÉÍÓÚÑ]/.test(password) &&
    /\d/.test(password)
  );
}

export function allowAuthAttempt(
  request: Request,
  scope: string,
  maximum: number,
) {
  const now = Date.now();
  const address =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local';
  const key = `${scope}:${address}`;
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 5 * 60_000 });
    return true;
  }
  if (current.count >= maximum) return false;
  current.count += 1;
  return true;
}

function sessionCookie(token: string, request: Request, maxAge: number) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get('cookie') ?? '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

function randomToken(bytes: number) {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return toBase64Url(new Uint8Array(digest));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
