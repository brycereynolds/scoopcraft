import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  User,
  ShoppingBag,
  Star,
  CreditCard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/account", label: "Profile", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/account/loyalty", label: "Loyalty Points", icon: Star, exact: false },
  { href: "/account/subscription", label: "Subscription", icon: Wallet, exact: false },
  { href: "/account/referrals", label: "Referrals", icon: Users, exact: false },
  { href: "/account/payment-methods", label: "Payment Methods", icon: CreditCard, exact: false },
  { href: "/account/settings", label: "Settings", icon: Settings, exact: false },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Mobile tabs */}
        <div
          className="md:hidden mb-6 overflow-x-auto rounded-xl border"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <nav className="flex min-w-max px-2 py-2 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-muted"
                style={{ color: "var(--foreground-secondary)" }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside
            className="hidden md:flex w-60 shrink-0 flex-col gap-1 self-start rounded-2xl border p-4 sticky top-24"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* User info */}
            <div className="mb-4 flex items-center gap-3 px-2 py-2">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {displayName}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--foreground-muted)" }}>
                  {user.email}
                </p>
              </div>
            </div>

            <div className="h-px mb-2" style={{ backgroundColor: "var(--border)" }} />

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
