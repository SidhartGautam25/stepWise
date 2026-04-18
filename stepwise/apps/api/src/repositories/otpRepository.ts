/**
 * OTP Token Repository — otp_tokens table CRUD.
 */

import { prisma } from "@repo/db";

const OTP_EXPIRY_MINUTES = 10;

export async function createOtpToken(userId: string, code: string): Promise<void> {
  // Invalidate previous unused tokens first
  await prisma.otpToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await prisma.otpToken.create({
    data: { userId, code, expiresAt },
  });
}

export async function consumeOtpToken(
  userId: string,
  code: string,
): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: {
      userId,
      code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return false;

  await prisma.otpToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  return true;
}
