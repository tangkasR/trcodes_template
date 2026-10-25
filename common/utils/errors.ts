export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Error "yang diharapkan" (aturan bisnis), pesannya aman ditampilkan ke user
export class AppError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "AppError";
    this.field = field; // kalau diisi, pesan ditampilkan di bawah input itu
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Sesi berakhir, silakan login kembali");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Kamu tidak memiliki izin untuk melakukan aksi ini") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class RateLimitError extends AppError {
  retryAfterSec: number;

  constructor(retryAfterSec: number) {
    super(
      `Terlalu banyak permintaan. Coba lagi dalam ${retryAfterSec} detik.`
    );
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

export class ValidationError extends AppError {
  fieldErrors: Record<string, string>;

  constructor(
    fieldErrors: Record<string, string>,
    message = "Periksa kembali isian form"
  ) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

// Kode error Prisma (misalnya "P2002" untuk pelanggaran unique)
export function errorCode(e: unknown): string | undefined {
  return typeof e === "object" && e !== null && "code" in e
    ? String(e.code)
    : undefined;
}
