export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSavedPaymentMethods } from "@/actions/payment-methods";
import { PaymentMethodsClient } from "./payment-methods-client";
import { Info } from "lucide-react";

export default async function PaymentMethodsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let methods: Awaited<ReturnType<typeof getSavedPaymentMethods>> = [];
  try {
    methods = await getSavedPaymentMethods();
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Payment Methods
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage your saved credit and debit cards.
        </p>
      </div>

      {/* Card list */}
      <PaymentMethodsClient methods={methods} />

      {/* Info note */}
      <div
        className="rounded-xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.06)", borderColor: "rgba(59, 130, 246, 0.25)" }}
      >
        <Info size={16} className="mt-0.5 shrink-0" style={{ color: "#3b82f6" }} />
        <p className="text-sm" style={{ color: "var(--foreground-secondary)" }}>
          New cards are saved automatically during checkout. All card data is stored securely via
          Stripe — ScoopCraft never stores your full card number.
        </p>
      </div>
    </div>
  );
}
