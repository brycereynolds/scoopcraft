import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { IMAGES, pexelsUrl } from '@/lib/imagery';

export const metadata: Metadata = {
  title: 'About — ScoopCraft',
  description: 'Learn about ScoopCraft — artisan ice cream made with love and delivered fresh.',
};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FEFAE0 50%, #FFF0F3 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span
              className="inline-block rounded-full px-3 py-1 text-sm font-medium mb-6"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Our Story
            </span>
            <h1
              className="text-5xl md:text-6xl leading-[1.1] mb-6"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
            >
              Handcrafted with Love, Delivered with Care
            </h1>
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              ScoopCraft was born from a simple belief: ice cream should be an experience,
              not just a treat. We craft every scoop in small batches using premium,
              locally sourced ingredients.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl md:text-4xl mb-6"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
            >
              From Kitchen to Doorstep
            </h2>
            <div className="space-y-4" style={{ color: 'var(--foreground-secondary)' }}>
              <p className="text-base leading-relaxed">
                It started with a single churner, a farmer&apos;s market stand, and lines that
                wrapped around the block. People weren&apos;t just buying ice cream — they were
                coming back for the experience of something genuinely handcrafted.
              </p>
              <p className="text-base leading-relaxed">
                Today, we bring that same care directly to your door. Every flavor is developed
                in-house, every batch is made fresh, and every delivery is timed to ensure your
                ice cream arrives at peak perfection.
              </p>
              <p className="text-base leading-relaxed">
                We partner with local dairy farms, source seasonal fruit at its peak, and never
                use artificial flavors or preservatives. What you taste is exactly what it says
                on the label — nothing more, nothing less.
              </p>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
            <Image
              src={pexelsUrl(IMAGES.hero.gelato_display, 'banner')}
              alt="Artisan ice cream being crafted"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl mb-3"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
            >
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🌾',
                title: 'Local & Seasonal',
                description:
                  'We work directly with farmers within 100 miles to source the freshest dairy, fruit, and herbs.',
              },
              {
                emoji: '🔬',
                title: 'Small Batch',
                description:
                  'Every flavor is made in batches of 10 gallons or less, ensuring consistent quality and freshness.',
              },
              {
                emoji: '♻️',
                title: 'Sustainable',
                description:
                  'Recyclable packaging, carbon-neutral delivery routes, and zero food waste through our donate-a-scoop program.',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-8 text-center"
                style={{ backgroundColor: 'white', boxShadow: '0 2px 8px -2px rgba(45,36,32,0.06)' }}
              >
                <div className="text-4xl mb-4">{v.emoji}</div>
                <h3
                  className="text-xl mb-2"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
                >
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20 text-center">
        <h2
          className="text-3xl md:text-4xl mb-4"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
        >
          Ready to Try a Scoop?
        </h2>
        <p className="text-lg mb-8" style={{ color: 'var(--foreground-secondary)' }}>
          Browse our current menu or build something entirely your own.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-150 hover:brightness-110"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 4px 12px rgba(212,83,106,0.3)' }}
          >
            Browse the Menu
          </Link>
          <Link
            href="/scoop-lab"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-150"
            style={{ backgroundColor: 'white', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Build Your Scoop
          </Link>
        </div>
      </section>
    </div>
  );
}
