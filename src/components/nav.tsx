'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, User, IceCream, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/menu', label: 'Menu', icon: null as React.ComponentType<{ className?: string }> | null },
  { href: '/scoop-lab', label: 'Scoop Lab', icon: Wand2 as React.ComponentType<{ className?: string }> },
  { href: '/subscriptions', label: 'Subscriptions', icon: null as React.ComponentType<{ className?: string }> | null },
];

interface NavProps {
  cartItemCount?: number;
}

export function Nav({ cartItemCount = 0 }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold"
          style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--primary)' }}
        >
          <IceCream className="h-6 w-6" />
          ScoopCraft
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 hover:text-foreground"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Cart + Auth */}
        <div className="flex items-center gap-1">
          {/* Cart icon button */}
          <Link
            href="/cart"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            style={{ color: 'var(--foreground)' }}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                }}
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
            <span className="sr-only">Cart ({cartItemCount} items)</span>
          </Link>

          {/* Auth */}
          {user ? (
            <Link
              href="/account"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
              title={user.name ?? user.email ?? 'Account'}
            >
              {initials ? (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                  }}
                >
                  {initials}
                </span>
              ) : (
                <User className="h-5 w-5" style={{ color: 'var(--foreground)' }} />
              )}
              <span className="sr-only">Account</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className={cn(
              'md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted',
            )}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ color: 'var(--foreground)' }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                style={{ color: 'var(--foreground)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                className="mt-2 flex items-center justify-center rounded-lg px-3 py-3 text-base font-semibold transition-colors"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
