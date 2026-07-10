import * as crypto from 'crypto';

export function isHashedPassword(value: any): boolean {
  return typeof value === 'string' && value.startsWith('scrypt$');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto
    .scryptSync(String(password || ''), salt, 64, { N: 16384, r: 8, p: 1 })
    .toString('hex');
  return `scrypt$16384$8$1$${salt}$${derived}`;
}

export function verifyPassword(
  password: string,
  storedPassword: string,
): boolean {
  const plain = String(password || '');
  const stored = String(storedPassword || '');
  if (!isHashedPassword(stored)) {
    return plain === stored;
  }

  const [prefix, nStr, rStr, pStr, salt, hashHex] = stored.split('$');
  if (prefix !== 'scrypt' || !salt || !hashHex) {
    return false;
  }

  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(plain, salt, expected.length, {
    N: Number(nStr),
    r: Number(rStr),
    p: Number(pStr),
  });
  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}
