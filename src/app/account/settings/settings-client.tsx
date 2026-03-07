"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import { updateProfile, updatePassword } from "@/actions/settings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
}

// ─── Profile form ─────────────────────────────────────────────────────────────

function ProfileForm({ profile }: { profile: UserProfile }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile({ firstName, lastName, phone });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={profile.email}
          disabled
          style={{ color: "var(--foreground-muted)", backgroundColor: "rgba(0,0,0,0.03)" }}
        />
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          Email cannot be changed here. Contact support if needed.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          style={{ backgroundColor: "var(--primary)" }}
          className="text-white hover:opacity-90"
        >
          {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : null}
          Save Changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--success)" }}>
            <Check size={14} />
            Saved!
          </span>
        )}
      </div>
    </form>
  );
}

// ─── Password form ────────────────────────────────────────────────────────────

function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword({ currentPassword, newPassword });
      if (result.success) {
        setSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          style={{ backgroundColor: "var(--primary)" }}
          className="text-white hover:opacity-90"
        >
          {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : null}
          Update Password
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--success)" }}>
            <Check size={14} />
            Password updated!
          </span>
        )}
      </div>
    </form>
  );
}

// ─── Notifications section ────────────────────────────────────────────────────

function NotificationsSection() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);
  const [loyaltyUpdates, setLoyaltyUpdates] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      {[
        {
          id: "orderUpdates",
          label: "Order status updates",
          description: "Get notified when your order status changes",
          checked: orderUpdates,
          onChange: setOrderUpdates,
        },
        {
          id: "promoOffers",
          label: "Promotional offers",
          description: "Receive discounts, seasonal deals, and special offers",
          checked: promoOffers,
          onChange: setPromoOffers,
        },
        {
          id: "loyaltyUpdates",
          label: "Loyalty point updates",
          description: "Know when you earn or redeem points",
          checked: loyaltyUpdates,
          onChange: setLoyaltyUpdates,
        },
      ].map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {item.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              {item.description}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={item.checked}
            onClick={() => item.onChange(!item.checked)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none"
            style={{
              backgroundColor: item.checked ? "var(--primary)" : "var(--border)",
            }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: item.checked ? "translateX(22px)" : "translateX(4px)" }}
            />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-3 mt-1">
        <Button
          onClick={handleSave}
          style={{ backgroundColor: "var(--secondary)" }}
          className="text-white hover:opacity-90"
        >
          Save Preferences
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--success)" }}>
            <Check size={14} />
            Preferences saved!
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Danger zone ──────────────────────────────────────────────────────────────

function DangerZone() {
  const [open, setOpen] = useState(false);
  const [noticeShown, setNoticeShown] = useState(false);

  function handleConfirmDelete() {
    setOpen(false);
    setNoticeShown(true);
  }

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-destructive border-destructive/40 hover:bg-destructive/10"
      >
        <AlertTriangle size={14} className="mr-1.5" />
        Delete Account
      </Button>

      {noticeShown && (
        <p className="mt-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
          To delete your account, please contact{" "}
          <a href="mailto:support@scoopcraft.com" style={{ color: "var(--primary)" }}>
            support@scoopcraft.com
          </a>
          . Our team will process your request within 5 business days.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This will permanently remove your account, order history, loyalty points, and all
              associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

interface SettingsClientProps {
  profile: UserProfile;
}

export function SettingsClient({ profile }: SettingsClientProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Profile section */}
      <section
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-xl font-semibold mb-5"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Profile
        </h2>
        <ProfileForm profile={profile} />
      </section>

      {/* Security section */}
      <section
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-xl font-semibold mb-5"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Security
        </h2>
        <PasswordForm />
      </section>

      {/* Notifications section */}
      <section
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Notifications
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--foreground-muted)" }}>
          Choose which email notifications you receive.
        </p>
        <NotificationsSection />
      </section>

      {/* Danger zone */}
      <section
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.04)",
          borderColor: "rgba(239, 68, 68, 0.25)",
        }}
      >
        <h2
          className="text-xl font-semibold mb-1"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Danger Zone
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--foreground-muted)" }}>
          Permanently delete your account and all associated data.
        </p>
        <DangerZone />
      </section>
    </div>
  );
}
