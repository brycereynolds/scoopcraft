export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { or, eq, and } from 'drizzle-orm';
import { MenuItemCard } from '@/components/menu-item-card';
import type { MenuItemWithPhoto } from '@/types';

// ── Data fetching ────────────────────────────────────────────────────────────

async function getFeaturedItems(): Promise<MenuItemWithPhoto[]> {
  try {
    const rows = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        category: menuItems.category,
        photoUrl: menuItems.photoUrl,
        dietaryFlags: menuItems.dietaryFlags,
        isAvailable: menuItems.isAvailable,
        availabilityType: menuItems.availabilityType,
        calories: menuItems.calories,
        sortOrder: menuItems.sortOrder,
      })
      .from(menuItems)
      .where(
        and(
          eq(menuItems.isAvailable, true),
          or(
            eq(menuItems.availabilityType, 'permanent'),
            eq(menuItems.availabilityType, 'flavor_of_day'),
            eq(menuItems.availabilityType, 'flavor_of_week')
          )
        )
      )
      .orderBy(menuItems.sortOrder, menuItems.name)
      .limit(6);

    return rows.map((row) => {
      const flags = row.dietaryFlags ?? [];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        photoUrl: row.photoUrl,
        isVegan: flags.includes('vegan'),
        isDairyFree: flags.includes('dairy-free'),
        isGlutenFree: flags.includes('gluten-free'),
        isAvailable: row.isAvailable,
        availabilityType: row.availabilityType,
        calories: row.calories,
      };
    });
  } catch {
    return [];
  }
}

// ── Placeholder card for empty state ────────────────────────────────────────

function PlaceholderCard({ emoji, name, price }: { emoji: string; name: string; price: string }) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden bg-white"
      style={{ boxShadow: '0 2px 8px -2px rgba(45, 36, 32, 0.06), 0 1px 3px -1px rgba(45, 36, 32, 0.04)' }}
    >
      <div
        className="flex items-center justify-center aspect-[4/3]"
        style={{ background: 'linear-gradient(135deg, #FDF8F4, #FFF0F3)' }}
      >
        <span className="text-5xl select-none">{emoji}</span>
      </div>
      <div className="p-5">
        <h3
          className="text-lg mb-1"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
        >
          {name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            {price}
          </span>
          <span
            className="rounded-lg px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground-secondary)' }}
          >
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_ITEMS = [
  { emoji: '🍓', name: 'Strawberry Fields', price: '$6.50' },
  { emoji: '🍫', name: 'Dark Chocolate Dream', price: '$6.50' },
  { emoji: '🍵', name: 'Matcha Mochi Swirl', price: '$7.00' },
  { emoji: '🫐', name: 'Blueberry Lavender', price: '$6.75' },
  { emoji: '🥜', name: 'Peanut Butter Crunch', price: '$6.50' },
  { emoji: '🍋', name: 'Lemon Verbena Sorbet', price: '$5.75' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const featured = await getFeaturedItems();

  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FEFAE0 50%, #FFF0F3 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <span
              className="inline-block rounded-full px-3 py-1 text-sm font-medium mb-6"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              Artisan ice cream, delivered fresh
            </span>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                color: 'var(--foreground)',
              }}
            >
              Handcrafted Happiness, Delivered to Your Door
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              Artisan ice cream made with love, delivered fresh to your doorstep.
              Small batches, premium ingredients, unforgettable flavors.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-150 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '0 4px 12px rgba(212, 83, 106, 0.3)',
                }}
              >
                Browse the Menu
              </Link>
              <Link
                href="/scoop-lab"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-150 hover:bg-muted"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                Build Your Scoop
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative emojis */}
        <div
          className="absolute top-12 right-8 text-6xl select-none hidden lg:block"
          style={{ transform: 'rotate(12deg)', opacity: 0.7 }}
        >
          🍦
        </div>
        <div
          className="absolute top-32 right-36 text-4xl select-none hidden lg:block"
          style={{ transform: 'rotate(-8deg)', opacity: 0.5 }}
        >
          🍧
        </div>
        <div
          className="absolute bottom-16 right-16 text-5xl select-none hidden lg:block"
          style={{ transform: 'rotate(5deg)', opacity: 0.6 }}
        >
          🍡
        </div>
        <div
          className="absolute top-1/2 right-64 text-3xl select-none hidden xl:block"
          style={{ transform: 'translateY(-50%) rotate(-15deg)', opacity: 0.4 }}
        >
          🌟
        </div>
      </section>

      {/* ── Why ScoopCraft ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl mb-3"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              color: 'var(--foreground)',
            }}
          >
            Why ScoopCraft?
          </h2>
          <p className="text-base md:text-lg" style={{ color: 'var(--foreground-secondary)' }}>
            Every detail designed around your perfect scoop
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: '🎨',
              title: 'Artisan Quality',
              description: 'Made in small batches with premium, locally sourced ingredients. No shortcuts, ever.',
            },
            {
              emoji: '🚚',
              title: 'Fast Delivery',
              description: 'Fresh to your door within 2 hours. We time production to your delivery slot.',
            },
            {
              emoji: '💝',
              title: 'Loyalty Rewards',
              description: 'Earn Sprinkle points with every order. Redeem for free scoops, discounts, and exclusive drops.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl p-8 text-center transition-all duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 2px 8px -2px rgba(45, 36, 32, 0.06), 0 1px 3px -1px rgba(45, 36, 32, 0.04)',
              }}
            >
              <div className="text-4xl mb-4 select-none">{card.emoji}</div>
              <h3
                className="text-xl mb-2"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  color: 'var(--foreground)',
                }}
              >
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Flavors ─────────────────────────────────────────────── */}
      <section
        className="py-16 md:py-20"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2
                className="text-3xl md:text-4xl mb-2"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  color: 'var(--foreground)',
                }}
              >
                Featured Flavors
              </h2>
              <p className="text-base" style={{ color: 'var(--foreground-secondary)' }}>
                Our most-loved scoops, ready to order
              </p>
            </div>
            <Link
              href="/menu"
              className="text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              View full menu →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLACEHOLDER_ITEMS.map((p) => (
                <PlaceholderCard key={p.name} {...p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Subscription Teaser ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl mb-3"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              color: 'var(--foreground)',
            }}
          >
            Join the ScoopCraft Club
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: 'var(--foreground-secondary)' }}>
            A monthly delivery of handpicked artisan scoops, curated just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Classic plan */}
          <div
            className="rounded-2xl p-8 flex flex-col border transition-all duration-200 hover:-translate-y-1"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--border)',
              boxShadow: '0 2px 8px -2px rgba(45, 36, 32, 0.06)',
            }}
          >
            <div className="text-3xl mb-3 select-none">🍦</div>
            <h3
              className="text-2xl mb-1"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                color: 'var(--foreground)',
              }}
            >
              Classic
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>$25</span>
              <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>/month</span>
            </div>
            <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: 'var(--foreground-secondary)' }}>
              <li className="flex items-center gap-2">✓ 4 signature scoops</li>
              <li className="flex items-center gap-2">✓ Curated monthly selection</li>
              <li className="flex items-center gap-2">✓ Priority delivery</li>
              <li className="flex items-center gap-2">✓ 2x Sprinkle points</li>
            </ul>
            <Link
              href="/subscriptions"
              className="block text-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-110"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)',
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Deluxe plan */}
          <div
            className="rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, var(--primary), #B8A4D6)',
              boxShadow: '0 8px 24px rgba(212, 83, 106, 0.25)',
            }}
          >
            <span className="absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-white/20 text-white">
              Most Popular
            </span>
            <div className="text-3xl mb-3 select-none">🌟</div>
            <h3
              className="text-2xl mb-1 text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Deluxe
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">$45</span>
              <span className="text-sm text-white/80">/month</span>
            </div>
            <ul className="space-y-2 text-sm mb-6 flex-1 text-white/90">
              <li className="flex items-center gap-2">✓ 8 premium scoops</li>
              <li className="flex items-center gap-2">✓ Exclusive limited-drop flavors</li>
              <li className="flex items-center gap-2">✓ Free delivery, every time</li>
              <li className="flex items-center gap-2">✓ 3x Sprinkle points</li>
              <li className="flex items-center gap-2">✓ Early access to new flavors</li>
            </ul>
            <Link
              href="/subscriptions"
              className="block text-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-white transition-all hover:bg-white/90"
              style={{ color: 'var(--primary)' }}
            >
              Start Your Subscription
            </Link>
          </div>
        </div>
      </section>

      {/* ── Scoop Lab Promo ──────────────────────────────────────────────── */}
      <section
        className="mx-4 md:mx-6 lg:mx-8 mb-16 md:mb-20 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7DBBA2 0%, #A8E0D0 50%, #D4536A 100%)',
          maxWidth: 'calc(100% - 2rem)',
        }}
      >
        <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-16 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="text-5xl mb-6 select-none">🧪</div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl text-white mb-4"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              The Scoop Lab
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Your imagination, your ice cream. Mix and match flavors, toppings, sauces, and vessels
              to create a scoop that&apos;s entirely yours. Save it, share it, make it a regular.
            </p>
            <Link
              href="/scoop-lab"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold bg-white transition-all hover:bg-white/90 hover:-translate-y-0.5"
              style={{ color: 'var(--accent-foreground)' }}
            >
              Build Your Perfect Scoop →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
