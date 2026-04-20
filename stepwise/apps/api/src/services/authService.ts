/**
 * Auth Service — orchestrates user registration, OTP flow, and JWT issuance.
 *
 * This is the ONLY place that knows about the full auth workflow.
 * Controllers call this; it delegates to repositories for DB and @repo/auth for JWT.
 * Email delivery is a single swap here (console.log → nodemailer/Resend).
 */

import * as bcrypt from "bcryptjs";
import { User } from "@repo/db";
import { signToken } from "@repo/auth";
import {
  findUserByEmail,
  createUser,
  findUserById,
} from "../repositories/userRepository";

// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerUser(email: string, passwordHash: string, username?: string): Promise<User> {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new Error(
      "An account with this email already exists. Please log in.",
    );
  }

  return createUser({ email, passwordHash, username });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  token: string;
  userId: string;
  email: string;
  username: string | null;
}

export async function loginWithPassword(email: string, passwordRaw: string): Promise<LoginResult> {
  const user = await findUserByEmail(email);

  if (!user || typeof user.passwordHash !== "string") {
    // Return generic error message to prevent email enumeration
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    username: user.username ?? undefined,
  });

  return { token, userId: user.id, email: user.email, username: user.username };
}

// ─── Current user ─────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<User> {
  const user = await findUserById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
