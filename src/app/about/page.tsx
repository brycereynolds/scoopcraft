import Link from 'next/link';

export const metadata = {
  title: 'About Us | ScoopCraft',
  description: "Learn about ScoopCraft's story, mission, and commitment to artisan ice cream.",
};

const values = [
  {
    title: 'Quality',
    icon: '✦',
    description:
      'Every scoop starts with premium, locally-sourced ingredients. We partner with regional dairy farms and farmers markets to ensure freshness in every batch.',
  },
  {
    title: 'Community',
    icon: '◈',
    description:
      'ScoopCraft was born out of neighborhood ice cream socials. We give back 5% of profits to local food banks and sponsor community events year-round.',
  },
  {
    title: 'Creativity',
    icon: '◇',
    description:
      'Our rotating seasonal menu pushes the boundaries of flavor — from lavender honey to spicy mango chili. We treat every batch as a canvas.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-24 px-4"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--secondary)' }}
          >
            Est. 2019
          </p>
          <h1
            className="mb-6 text-5xl md:text-6xl leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
          >
            Our Story
          </h1>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
            ScoopCraft began as a weekend project in a tiny Portland kitchen and grew into something
            far sweeter — a beloved artisan ice cream brand delivering handcrafted happiness across
            the country.
          </p>
        </div>

        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-15"
          style={{ backgroundColor: 'var(--secondary)' }}
        />
      </section>

      {/* Founding story */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2
                className="mb-5 text-3xl md:text-4xl"
                style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
              >
                Two friends, one obsession
              </h2>
              <div className="space-y-4" style={{ color: 'var(--foreground-secondary)' }}>
                <p className="leading-relaxed">
                  In the summer of 2019, childhood friends Maya Chen and Eli Torres found themselves
                  endlessly experimenting with ice cream recipes after hours, convinced that the
                  world deserved better than mass-produced pints.
                </p>
                <p className="leading-relaxed">
                  They started small — a farmers market booth, a hand-crank machine, and fifty
                  pounds of local cream. Within three weekends, they had a waitlist. Within a year,
                  ScoopCraft was shipping nationwide.
                </p>
                <p className="leading-relaxed">
                  Today we still make every flavor in small batches using the same dedication to
                  craft. Our ingredients are sourced within 150 miles of our production kitchen, and
                  our recipes are developed in-house — never outsourced, never rushed.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: '50+', label: 'Flavors crafted' },
                { number: '40k+', label: 'Happy customers' },
                { number: '12', label: 'Local farm partners' },
                { number: '5', label: 'Years of sweetness' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 text-center"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <p
                    className="text-4xl font-bold mb-1"
                    style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--primary)' }}
                  >
                    {stat.number}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            Our Mission
          </p>
          <blockquote
            className="text-2xl md:text-3xl leading-snug italic"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
          >
            "To bring the joy of handcrafted ice cream to every doorstep — one small batch at a
            time."
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2
              className="text-3xl md:text-4xl"
              style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
            >
              What we stand for
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl p-8"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="mb-4 text-3xl font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {value.icon}
                </div>
                <h3
                  className="mb-3 text-xl font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  {value.title}
                </h3>
                <p className="leading-relaxed text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: 'var(--primary)' }}>
        <div className="mx-auto max-w-2xl">
          <h2
            className="mb-4 text-3xl md:text-4xl"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--primary-foreground)' }}
          >
            Join Our Journey
          </h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--primary-foreground)', opacity: 0.85 }}>
            Taste the story for yourself. Explore our full menu of small-batch flavors, available for
            delivery nationwide.
          </p>
          <Link
            href="/menu"
            className="inline-block rounded-full px-8 py-3 text-sm font-semibold transition-opacity duration-150 hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-foreground)', color: 'var(--primary)' }}
          >
            Browse the Menu
          </Link>
        </div>
      </section>
    </>
  );
}
