import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const TOTP_ISSUER = 'Kyrn';
const TOTP_PERIOD = 30;
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = 'sha1';

function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const index = alphabet.indexOf(cleaned[i]);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

export function generateTOTPUri(email: string, secret: string): string {
  const encodedIssuer = encodeURIComponent(TOTP_ISSUER);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const buffer = crypto.randomBytes(4);
    const code = buffer.toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || '';
    codes.push(code);
  }
  return codes;
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = await import('bcryptjs');
  const hashedCodes = await Promise.all(
    codes.map(async (code) => {
      const cleanCode = code.replace(/-/g, '').toUpperCase();
      return bcrypt.hash(cleanCode, 10);
    })
  );
  return hashedCodes;
}

export function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const decodedSecret = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / TOTP_PERIOD);

  for (let i = -window; i <= window; i++) {
    const expectedToken = generateTOTPTokenForTime(decodedSecret, time + i);
    if (expectedToken === token) {
      return true;
    }
  }

  return false;
}

function generateTOTPTokenForTime(secret: Buffer, time: number): string {
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time), 0);

  const hmac = crypto.createHmac(TOTP_ALGORITHM, secret);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

export async function verifyBackupCode(
  hashedCodes: string[],
  enteredCode: string
): Promise<{ valid: boolean; index: number }> {
  const cleanEnteredCode = enteredCode.replace(/-/g, '').toUpperCase();
  const bcrypt = await import('bcryptjs');

  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(cleanEnteredCode, hashedCodes[i]);
    if (isValid) {
      return { valid: true, index: i };
    }
  }

  return { valid: false, index: -1 };
}

export async function removeUsedBackupCode(
  userId: number,
  indexToRemove: number
): Promise<string[]> {
  const [user] = await db
    .select({ twoFactorBackupCodes: users.twoFactorBackupCodes })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.twoFactorBackupCodes) {
    return [];
  }

  const codes: string[] = JSON.parse(user.twoFactorBackupCodes);
  codes.splice(indexToRemove, 1);

  await db
    .update(users)
    .set({ twoFactorBackupCodes: JSON.stringify(codes) })
    .where(eq(users.id, userId));

  return codes;
}

export async function setup2FA(userId: number) {
  const secret = generateTOTPSecret();
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = await hashBackupCodes(backupCodes);

  await db
    .update(users)
    .set({
      twoFactorSecret: secret,
      twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
    })
    .where(eq(users.id, userId));

  return {
    secret,
    backupCodes,
  };
}

export async function enable2FA(userId: number) {
  await db
    .update(users)
    .set({ twoFactorEnabled: true })
    .where(eq(users.id, userId));
}

export async function disable2FA(userId: number) {
  await db
    .update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    })
    .where(eq(users.id, userId));
}

export async function verify2FA(
  userId: number,
  token: string
): Promise<{ success: boolean; isBackupCode: boolean }> {
  const [user] = await db
    .select({
      twoFactorEnabled: users.twoFactorEnabled,
      twoFactorSecret: users.twoFactorSecret,
      twoFactorBackupCodes: users.twoFactorBackupCodes,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.twoFactorEnabled) {
    return { success: false, isBackupCode: false };
  }

  if (user.twoFactorSecret && verifyTOTP(user.twoFactorSecret, token)) {
    return { success: true, isBackupCode: false };
  }

  if (user.twoFactorBackupCodes) {
    const hashedCodes: string[] = JSON.parse(user.twoFactorBackupCodes);
    const result = await verifyBackupCode(hashedCodes, token);
    if (result.valid) {
      await removeUsedBackupCode(userId, result.index);
      return { success: true, isBackupCode: true };
    }
  }

  return { success: false, isBackupCode: false };
}
