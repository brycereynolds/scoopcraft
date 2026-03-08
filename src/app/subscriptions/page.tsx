import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Truck, Star, Heart } from "lucide-react";
import { IMAGES, pexelsUrl } from "@/lib/imagery";

const plans = [
  {
    id: "classic",
    name: "Classic Box",
    price: 25,
    tagline: "2 handcrafted pints delivered monthly",
    features: [
      "Free standard shipping",
      "Early flavor access",
      "Sprinkle tier loyalty rewards",
      "Monthly curated selection",
      "Cancel anytime",
    ],
    cta: "Get Classic",
    featured: false,
    badge: null,
  },
  {
    id: "deluxe",
    name: "Deluxe Box",
    price: 45,
    tagline: "4 premium pints + seasonal exclusives",
    features: [
      "Free priority shipping",
      "Exclusive member-only flavors",
      "Bonus loyalty points every month",
      "Swirl tier loyalty status",
      "Seasonal surprise extras",
      "Cancel anytime",
    ],
    cta: "Get Deluxe",
    featured: true,
    badge: "Most Popular",
  },
];

const faqs = [
  {
    q: "When will my box ship?",
    a: "Boxes ship in the first week of each month. You'll receive a tracking notification by email as soon as your box is on its way.",
  },
  {
    q: "Can I pause or cancel anytime?",
    a: "Yes. You can pause your subscription for up to 3 months or cancel at any time from your account page. There are no cancellation fees.",
  },
  {
    q: "How does the loyalty program work?",
    a: "Every dollar you spend earns you loyalty points. Classic subscribers start at Sprinkle tier (1x multiplier). Deluxe subscribers get Swirl tier status (1.25x multiplier) automatically.",
  },
  {
    q: "Can I customize my flavors?",
    a: "We curate each month's selection based on seasonal ingredients and member feedback. Deluxe subscribers get access to exclusive flavors before anyone else.",
  },
  {
    q: "Do you ship everywhere in the US?",
    a: "We currently ship to the contiguous 48 US states. Alaska and Hawaii are not yet supported but we're working on it!",
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-24 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(212,83,106,0.08) 0%, rgba(196,136,61,0.08) 50%, rgba(125,187,162,0.08) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--primary)" }}
          >
            The ScoopCraft Club
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
          >
            Happiness, delivered
            <br />
            <span style={{ color: "var(--primary)" }}>every month</span>
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Join thousands of ice cream lovers who get artisan pints delivered right to their door.
            No grocery runs. No compromises. Just joy in a box.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative flex flex-col rounded-2xl border p-8 gap-6"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: plan.featured ? "var(--primary)" : "var(--border)",
                  boxShadow: plan.featured
                    ? "0 0 0 2px var(--primary), 0 20px 60px rgba(212,83,106,0.12)"
                    : "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1 text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
                  >
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-base" style={{ color: "var(--foreground-secondary)" }}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className="text-5xl font-bold"
                    style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
                  >
                    ${plan.price}
                  </span>
                  <span className="text-base" style={{ color: "var(--foreground-muted)" }}>
                    /month
                  </span>
                </div>

                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "var(--foreground-secondary)" }}
                    >
                      <span
                        className="mt-0.5 text-base leading-none font-bold shrink-0"
                        style={{ color: "var(--success)" }}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link href="/account/subscription">
                    <Button
                      className="w-full text-base py-6"
                      style={
                        plan.featured
                          ? {
                              backgroundColor: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }
                          : {}
                      }
                      variant={plan.featured ? "primary" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-6" style={{ color: "var(--foreground-muted)" }}>
            All plans include free shipping. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section
        className="py-12 px-4"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
            {[
              {
                badge: (
                  <img
                    src={pexelsUrl(IMAGES.flavors.vanilla, "icon")}
                    alt="Vanilla ice cream"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    style={{ backgroundColor: IMAGES.flavors.vanilla.avgColor }}
                  />
                ),
                label: "Handcrafted",
                sub: "small-batch recipes",
              },
              {
                badge: <Truck className="h-8 w-8" style={{ color: "var(--primary)" }} />,
                label: "Free shipping",
                sub: "on every box",
              },
              {
                badge: <Star className="h-8 w-8" style={{ color: "var(--primary)" }} />,
                label: "Loyalty rewards",
                sub: "earn on every order",
              },
              {
                badge: <Heart className="h-8 w-8" style={{ color: "var(--primary)" }} />,
                label: "Cancel anytime",
                sub: "no commitment needed",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center">{item.badge}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-2xl">
          <h2
            className="text-3xl font-bold text-center mb-10"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
          >
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border overflow-hidden"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-medium text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "var(--foreground-muted)" }} />
                </summary>
                <div
                  className="px-6 pb-5 text-sm leading-relaxed"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section
        className="py-16 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(212,83,106,0.06) 0%, rgba(196,136,61,0.06) 100%)",
        }}
      >
        <div className="mx-auto max-w-lg">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
          >
            Not ready yet?
          </h2>
          <p className="text-base mb-6" style={{ color: "var(--foreground-secondary)" }}>
            Explore our full menu and order individual pints first. No subscription required.
          </p>
          <Link href="/menu">
            <Button variant="outline" size="lg">
              Browse the menu first
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
