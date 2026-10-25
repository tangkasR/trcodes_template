import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_PERIOD_SEC = 30;
const TOTP_DIGITS = 6;

function base32Encode(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const output = Buffer.alloc(Math.floor((clean.length * 5) / 8));
  let index = 0;

  for (const char of clean) {
    const digit = BASE32_ALPHABET.indexOf(char);
    if (digit === -1) continue;
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }

  return output.subarray(0, index);
}

function hotp(secret: string, counter: number) {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** TOTP_DIGITS;

  return binary.toString().padStart(TOTP_DIGITS, "0");
}

export function generateTotpSecret() {
  // 160-bit secret, sesuai rekomendasi RFC 4226/6238.
  return base32Encode(randomBytes(20));
}

export function formatTotpSecret(secret: string) {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

export function totpUri(email: string, secret: string) {
  const label = encodeURIComponent(`trcodes:${email}`);
  const params = new URLSearchParams({
    secret,
    issuer: "trcodes",
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SEC),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

function normalizeTotpCode(code: string) {
  return code.replace(/\s+/g, "");
}

export function verifyTotp(secret: string, code: string, window = 1) {
  const normalized = normalizeTotpCode(code);
  if (!new RegExp(`^\\d{${TOTP_DIGITS}}$`).test(normalized)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SEC);
  const expectedCount = window * 2 + 1;

  for (let i = 0; i < expectedCount; i++) {
    const step = currentStep - window + i;
    const expected = hotp(secret, step);
    if (
      timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))
    ) {
      return true;
    }
  }

  return false;
}

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(8).toString("hex");
    return raw.match(/.{1,4}/g)?.join("-") ?? raw;
  });
}

function normalizeRecoveryCode(code: string) {
  return code.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function hashRecoveryCode(code: string) {
  return createHash("sha256")
    .update(`trcodes-recovery:${normalizeRecoveryCode(code)}`)
    .digest("hex");
}

export function matchRecoveryCode(code: string, hashes: string[]) {
  const normalized = normalizeRecoveryCode(code);
  if (!normalized) return null;

  const candidate = Buffer.from(hashRecoveryCode(normalized), "hex");
  for (const hash of hashes) {
    const stored = Buffer.from(hash, "hex");
    if (
      stored.length === candidate.length &&
      timingSafeEqual(stored, candidate)
    ) {
      return hash;
    }
  }

  return null;
}

function getEncryptionKey() {
  const material =
    process.env.MFA_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!material || material.length < 32) {
    throw new Error(
      "MFA_ENCRYPTION_KEY atau SESSION_SECRET wajib diisi, minimal 32 karakter"
    );
  }
  return createHash("sha256").update(`trcodes-mfa-v1:${material}`).digest();
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptMfaSecret(value: string) {
  const [version, iv, tag, ciphertext] = value.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext) {
    throw new Error("Format secret MFA tidak valid");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
