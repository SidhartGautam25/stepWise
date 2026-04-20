/**
 * User Repository — users table CRUD.
 */

import { User } from "@repo/db";
import { prisma } from "@repo/db";

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  username?: string;
}): Promise<User> {
  return prisma.user.create({ data });
}
