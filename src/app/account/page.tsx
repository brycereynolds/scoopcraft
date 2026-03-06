export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const displayName = user.name ?? user.email;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const quickLinks = [
    { href: "/account/loyalty", label: "Loyalty Points", sub: "View your points balance and tier", emoji: "⭐" },
    { href: "/account/subscription", label: "Subscription", sub: "Manage your monthly plan", emoji: "📦" },
    { href: "/account/orders", label: "Orders", sub: "View order history", emoji: "🛍️" },
    { href: "/account/referrals", label: "Referrals", sub: "Refer friends, earn 200 pts each", emoji: "🎁" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          My Account
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage your profile and preferences.
        </p>
      </div>

      {/* Profile card */}
      <div
        className="rounded-2xl border p-6 flex items-center gap-5"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p
            className="text-xl font-semibold truncate"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
          >
            {displayName}
          </p>
          <p className="text-sm truncate" style={{ color: "var(--foreground-muted)" }}>
            {user.email}
          </p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-2xl">{link.emoji}</span>
            <div>
              <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                {link.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                {link.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
