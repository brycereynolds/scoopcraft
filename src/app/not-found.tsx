import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | ScoopCraft',
};

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-20 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Large emoji */}
      <div className="text-8xl mb-6 select-none">🍦</div>

      {/* Heading */}
      <h1
        className="text-5xl md:text-6xl mb-4"
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          color: 'var(--foreground)',
        }}
      >
        404
      </h1>

      <h2
        className="text-2xl md:text-3xl mb-4"
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          color: 'var(--foreground)',
        }}
      >
        Oops — this scoop melted
      </h2>

      <p
        className="text-base md:text-lg mb-10 max-w-md leading-relaxed"
        style={{ color: 'var(--foreground-secondary)' }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Let&apos;s get you back to the good stuff.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all hover:brightness-110"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            boxShadow: '0 4px 12px rgba(212,83,106,0.3)',
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all"
          style={{
            backgroundColor: 'white',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }}
        >
          Browse Menu
        </Link>
      </div>
    </div>
  );
}
