export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/actions/settings";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let profile: Awaited<ReturnType<typeof getUserProfile>> = null;
  try {
    profile = await getUserProfile();
  } catch {
    redirect("/login");
  }

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Account Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage your profile, security, and notification preferences.
        </p>
      </div>

      <SettingsClient profile={profile} />
    </div>
  );
}
