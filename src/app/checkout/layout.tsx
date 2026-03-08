import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Delivery', href: '/checkout' },
  { label: 'Review', href: '/checkout/review' },
  { label: 'Payment', href: '/checkout/payment' },
  { label: 'Confirmation', href: '/checkout/confirmation' },
];

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Minimal header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: 'var(--primary)', fontFamily: "'DM Serif Display', Georgia, serif" }}>
            ScoopCraft
          </Link>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Secure Checkout</span>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <nav aria-label="Checkout progress">
            <ol className="flex items-center justify-center gap-0">
              {STEPS.map((step, index) => (
                <li key={step.label} className="flex items-center">
                  <StepIndicator step={index + 1} label={step.label} />
                  {index < STEPS.length - 1 && (
                    <div
                      className="w-8 h-px mx-1 sm:w-16 sm:mx-2"
                      style={{ background: 'var(--border)' }}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function StepIndicator({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--muted)',
          color: 'var(--muted-foreground)',
        }}
      >
        {step}
      </div>
      <span className="text-xs hidden sm:block" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
    </div>
  );
}
