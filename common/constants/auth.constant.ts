export const SESSION_COOKIE = "session";
export const MFA_CHALLENGE_COOKIE = "mfa_challenge";
export const MFA_SETUP_COOKIE = "mfa_setup";

// Durasi & Umur Token
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 jam
export const MFA_CHALLENGE_MAX_AGE_SECONDS = 5 * 60; // 5 menit
export const MFA_SETUP_MAX_AGE_SECONDS = 10 * 60; // 10 menit

// Aturan Kredensial
export const MIN_PASSWORD_LENGTH = 12;

// Ambang Batas Rate Limiting Akses API / Server Actions (per menit)
export const DEFAULT_READ_RATE_LIMIT = 120;
export const DEFAULT_MUTATION_RATE_LIMIT = 30;

// Ambang Batas Login Lockout (Anti Brute-Force)
export const LOGIN_MAX_ATTEMPTS_PER_EMAIL = 5;
export const LOGIN_MAX_ATTEMPTS_PER_IP = 20;
export const LOGIN_MAX_ATTEMPTS_UNKNOWN_IP = 200;
export const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 menit
export const LOGIN_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 jam

// Parameter TOTP MFA
export const TOTP_PERIOD_SEC = 30;
export const TOTP_DIGITS = 6;
export const MFA_MAX_ATTEMPTS_PER_USER = 5;
export const MFA_MAX_ATTEMPTS_PER_IP = 20;
export const MFA_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
export const MFA_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 jam
export const RECOVERY_CODE_COUNT = 10;
