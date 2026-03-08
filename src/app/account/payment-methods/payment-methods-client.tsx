"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Star } from "lucide-react";
import {
  setDefaultPaymentMethod,
  removePaymentMethod,
  type SavedPaymentMethod,
} from "@/actions/payment-methods";

// ─── Brand config ─────────────────────────────────────────────────────────────

function brandDisplay(brand: string | null): { label: string; bg: string; color: string } {
  switch ((brand ?? "").toLowerCase()) {
    case "visa":
      return { label: "Visa", bg: "rgba(30, 86, 160, 0.12)", color: "#1e56a0" };
    case "mastercard":
      return { label: "Mastercard", bg: "rgba(235, 0, 27, 0.12)", color: "#eb001b" };
    case "amex":
      return { label: "Amex", bg: "rgba(0, 121, 165, 0.12)", color: "#0079a5" };
    case "discover":
      return { label: "Discover", bg: "rgba(255, 103, 0, 0.12)", color: "#ff6700" };
    default:
      return { label: brand ?? "Card", bg: "rgba(107, 114, 128, 0.12)", color: "#374151" };
  }
}

// ─── Remove button with confirm dialog ───────────────────────────────────────

function RemoveButton({ methodId }: { methodId: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removePaymentMethod(methodId);
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive border-destructive/40 hover:bg-destructive/10"
      >
        <Trash2 size={14} className="mr-1.5" />
        Remove
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove payment method?</DialogTitle>
            <DialogDescription>
              This card will be removed from your account and detached from Stripe. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : null}
              Remove Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Set default button ───────────────────────────────────────────────────────

function SetDefaultButton({ methodId }: { methodId: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSetDefault() {
    setError(null);
    startTransition(async () => {
      const result = await setDefaultPaymentMethod(methodId);
      if (!result.success) {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSetDefault}
        disabled={isPending}
      >
        {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Star size={14} className="mr-1.5" />}
        Set as Default
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Card item ────────────────────────────────────────────────────────────────

function CardItem({ method }: { method: SavedPaymentMethod }) {
  const brand = brandDisplay(method.brand);

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-4">
        {/* Brand badge */}
        <div
          className="flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-bold min-w-[64px]"
          style={{ backgroundColor: brand.bg, color: brand.color }}
        >
          {brand.label}
        </div>

        {/* Card details */}
        <div>
          <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>
            &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {method.last4 ?? "••••"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
            Expires {method.expMonth?.toString().padStart(2, "0")}/{method.expYear}
          </p>
        </div>

        {/* Default badge */}
        {method.isDefault && (
          <span
            className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "rgba(212, 83, 106, 0.12)", color: "var(--primary)" }}
          >
            Default
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {method.isDefault && (
          <span
            className="sm:hidden inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "rgba(212, 83, 106, 0.12)", color: "var(--primary)" }}
          >
            Default
          </span>
        )}
        {!method.isDefault && <SetDefaultButton methodId={method.id} />}
        <RemoveButton methodId={method.id} />
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

interface PaymentMethodsClientProps {
  methods: SavedPaymentMethod[];
}

export function PaymentMethodsClient({ methods }: PaymentMethodsClientProps) {
  if (methods.length === 0) {
    return (
      <div
        className="rounded-2xl border p-10 flex flex-col items-center text-center gap-3"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p className="text-4xl">💳</p>
        <div>
          <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            No saved payment methods
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
            Payment methods are saved automatically when you checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {methods.map((method) => (
        <CardItem key={method.id} method={method} />
      ))}
    </div>
  );
}
