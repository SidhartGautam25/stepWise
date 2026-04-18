/**
 * Auth Service — orchestrates user registration, OTP flow, and JWT issuance.
 *
 * This is the ONLY place that knows about the full auth workflow.
 * Controllers call this; it delegates to repositories for DB and @repo/auth for JWT.
 * Email delivery is a single swap here (console.log → nodemailer/Resend).
 */

import crypto from "crypto";
import { User } from "@repo/db";
import { signToken, type AuthPayload } from "@repo/auth";
import {
  findUserByEmail,
  createUser,
  upsertUserByEmail,
  findUserById,
} from "../repositories/userRepository";
import { createOtpToken, consumeOtpToken } from "../repositories/otpRepository";

// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerUser(email: string, username?: string): Promise<User> {
  const existing = await findUserByEmail(email);

  if (existing) {
    throw new Error(
      "An account with this email already exists. Run `stepwise login` to sign in.",
    );
  }

  return createUser({ email, username });
}

// ─── OTP Login ────────────────────────────────────────────────────────────────

export interface OtpRequestResult {
  /** In dev: returned so the CLI/web can display it without needing email setup */
  devCode?: string;
  message: string;
}

export async function requestLoginOtp(email: string): Promise<OtpRequestResult> {
  // Upsert: create the user if they don't have an account yet
  const user = await upsertUserByEmail(email);
  const code = String(crypto.randomInt(100000, 999999));

  await createOtpToken(user.id, code);

  if (process.env.NODE_ENV === "production") {
    // TODO: swap this for Resend / nodemailer / AWS SES
    // await sendEmail({ to: email, subject: "Your StepWise code", text: `Your code is: ${code}` });
    return { message: `A 6-digit code has been sent to ${email}. It expires in 10 minutes.` };
  }

  console.log(`\n[DEV] OTP for ${email}: ${code}\n`);
  return {
    devCode: code,
    message: `[DEV] Code printed to API console and returned in devCode field.`,
  };
}

export interface LoginResult {
  token: string;
  userId: string;
  email: string;
  username: string | null;
}

export async function verifyLoginOtp(email: string, code: string): Promise<LoginResult> {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or code");
  }

  const valid = await consumeOtpToken(user.id, code);

  if (!valid) {
    throw new Error("Invalid or expired code. Request a new one with `stepwise login`.");
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    username: user.username ?? undefined,
  });

  return { token, userId: user.id, email: user.email, username: user.username };
}

// ─── Dev-only fast login ──────────────────────────────────────────────────────

export async function devLogin(email: string): Promise<LoginResult> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev login is disabled in production.");
  }

  const user = await upsertUserByEmail(email);

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
