"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { savedPaymentMethods } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";

async function requireUser(): Promise<{ id: number }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: must be logged in");
  }
  return { id: parseInt(session.user.id, 10) };
}

export type SavedPaymentMethod = typeof savedPaymentMethods.$inferSelect;

export async function getSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const user = await requireUser();

  const methods = await db
    .select()
    .from(savedPaymentMethods)
    .where(eq(savedPaymentMethods.userId, user.id))
    .orderBy(savedPaymentMethods.createdAt);

  return methods;
}

export async function setDefaultPaymentMethod(
  paymentMethodId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();

    // Verify the payment method belongs to this user
    const [method] = await db
      .select()
      .from(savedPaymentMethods)
      .where(
        and(
          eq(savedPaymentMethods.id, paymentMethodId),
          eq(savedPaymentMethods.userId, user.id)
        )
      );

    if (!method) {
      return { success: false, error: "Payment method not found" };
    }

    // Unset all defaults for this user
    await db
      .update(savedPaymentMethods)
      .set({ isDefault: false })
      .where(eq(savedPaymentMethods.userId, user.id));

    // Set new default
    await db
      .update(savedPaymentMethods)
      .set({ isDefault: true })
      .where(eq(savedPaymentMethods.id, paymentMethodId));

    revalidatePath("/account/payment-methods");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to update default payment method" };
  }
}

export async function removePaymentMethod(
  paymentMethodId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser();

    // Verify the payment method belongs to this user
    const [method] = await db
      .select()
      .from(savedPaymentMethods)
      .where(
        and(
          eq(savedPaymentMethods.id, paymentMethodId),
          eq(savedPaymentMethods.userId, user.id)
        )
      );

    if (!method) {
      return { success: false, error: "Payment method not found" };
    }

    // Detach from Stripe
    try {
      await stripe.paymentMethods.detach(method.stripePaymentMethodId);
    } catch {
      // Stripe detach may fail if already detached; continue with DB deletion
    }

    // Delete from DB
    await db
      .delete(savedPaymentMethods)
      .where(eq(savedPaymentMethods.id, paymentMethodId));

    revalidatePath("/account/payment-methods");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to remove payment method" };
  }
}
