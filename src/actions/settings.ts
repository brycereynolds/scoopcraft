"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash, verify } from "@node-rs/argon2";

async function requireUser(): Promise<{ id: number }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: must be logged in");
  }
  return { id: parseInt(session.user.id, 10) };
}

// ─── updateProfile ─────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
});

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();

    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db
      .update(users)
      .set({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName ?? null,
        phone: parsed.data.phone ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/account/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to update profile" };
  }
}

// ─── updatePassword ────────────────────────────────────────────────────────────

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();

    if (!data.currentPassword) {
      return { success: false, error: "Current password is required" };
    }
    if (!data.newPassword || data.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" };
    }

    // Fetch the current password hash
    const [userRecord] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, user.id));

    if (!userRecord) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await verify(userRecord.passwordHash, data.currentPassword);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash and save new password
    const newHash = await hash(data.newPassword, {
      algorithm: 1, // argon2id
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to update password" };
  }
}

// ─── getUserProfile ────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<{
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = parseInt(session.user.id, 10);

  const [record] = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, userId));

  return record ?? null;
}
