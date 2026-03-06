import Link from 'next/link';
import { IceCream } from 'lucide-react';

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Branding */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--primary)' }}
          >
            <IceCream className="h-5 w-5" />
            ScoopCraft
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors duration-150"
                style={{ color: 'var(--foreground-secondary)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--foreground)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    'var(--foreground-secondary)';
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            &copy; {year} ScoopCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
