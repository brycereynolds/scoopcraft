import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReferralStats } from "@/actions/referrals";
import { ReferralClient } from "./referral-client";

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let stats: { code: string; referralCount: number; pointsEarned: number };
  try {
    stats = await getReferralStats();
  } catch {
    redirect("/login");
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralUrl = `${appUrl}/signup?ref=${stats.code}`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Referrals
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Share ScoopCraft with friends and earn 200 points each.
        </p>
      </div>

      {/* Referral code card */}
      <div
        className="rounded-2xl border p-8 text-center"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          background: "linear-gradient(135deg, rgba(212,83,106,0.05) 0%, rgba(196,136,61,0.05) 100%)",
        }}
      >
        <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--foreground-muted)" }}>
          Your referral code
        </p>
        <ReferralClient code={stats.code} referralUrl={referralUrl} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Friends Referred",
            value: stats.referralCount.toString(),
            sub: "successful signups",
          },
          {
            label: "Points Earned",
            value: stats.pointsEarned.toLocaleString() + " pts",
            sub: "from referrals",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-5 text-center"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
            >
              {stat.value}
            </p>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--foreground-secondary)" }}>
              {stat.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-xl font-semibold mb-6"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          How it works
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Share your code",
              desc: "Send your unique referral link or code to a friend who loves ice cream.",
            },
            {
              step: "2",
              title: "Friend signs up",
              desc: "Your friend creates a ScoopCraft account using your referral code during signup.",
            },
            {
              step: "3",
              title: "Both earn 200 pts",
              desc: "You and your friend each receive 200 loyalty points — that's $2 off your next order!",
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                  {item.title}
                </p>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 rounded-xl p-4 text-sm"
          style={{
            backgroundColor: "rgba(125,187,162,0.1)",
            color: "var(--accent-foreground)",
            border: "1px solid rgba(125,187,162,0.25)",
          }}
        >
          <p className="font-medium mb-1">Referral rules</p>
          <ul className="list-disc list-inside space-y-1" style={{ color: "var(--foreground-secondary)" }}>
            <li>Each referral code can only be applied once per new user</li>
            <li>Points are awarded immediately after the referred user signs up</li>
            <li>You cannot refer yourself</li>
            <li>200 points = $2 off your next order (100 pts = $1)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
