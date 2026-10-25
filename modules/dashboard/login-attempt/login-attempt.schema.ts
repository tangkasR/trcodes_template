// src/modules/login-attempt/login-attempt.schema.ts
import { z } from "zod";

export const loginAttemptSchema = z.object({
  email: z.string().trim().email(),
  ip: z.string().trim(),
});

export type LoginAttemptRow = {
  uuid: string;
  email: string;
  ip: string;
  createdAt: Date;
};
