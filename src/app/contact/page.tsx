'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this would POST to an API route
    setSubmitted(true);
  }

  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <section
        className="py-16 md:py-20"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FEFAE0 50%, #FFF0F3 100%)' }}
      >
        <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-medium mb-6"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Get in Touch
          </span>
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
          >
            Contact Us
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
            Questions, feedback, or a custom order request? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2
              className="text-2xl mb-6"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
            >
              Reach Out
            </h2>
            <div className="space-y-6">
              {[
                {
                  emoji: '📧',
                  label: 'Email',
                  value: 'hello@scoopcraft.com',
                  sub: 'We reply within a few hours',
                },
                {
                  emoji: '📍',
                  label: 'Production Kitchen',
                  value: '123 Creamery Lane, Artisan District',
                  sub: 'Not open to the public — delivery only',
                },
                {
                  emoji: '🕐',
                  label: 'Delivery Hours',
                  value: 'Daily, 11am – 9pm',
                  sub: 'Last order by 8:30pm',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--foreground-muted)' }}>
                      {item.label}
                    </p>
                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-10 rounded-2xl p-6"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <p className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>Need help with an order?</p>
              <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                Check our{' '}
                <Link href="/faq" className="font-medium" style={{ color: 'var(--primary)' }}>FAQ</Link>{' '}
                for quick answers about delivery, subscriptions, and loyalty rewards.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div>
            {submitted ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ backgroundColor: 'var(--success-foreground)', border: '1px solid var(--success)' }}
              >
                <div className="text-4xl mb-4">🎉</div>
                <h3
                  className="text-2xl mb-2"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
                >
                  Message Sent!
                </h3>
                <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  Thanks for reaching out. We&apos;ll get back to you within a few hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Subject
                  </label>
                  <select
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: form.subject ? 'var(--foreground)' : 'var(--foreground-muted)',
                    }}
                  >
                    <option value="" disabled>Select a topic...</option>
                    <option value="order">Order issue</option>
                    <option value="delivery">Delivery question</option>
                    <option value="subscription">Subscription help</option>
                    <option value="custom">Custom / bulk order</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl px-6 py-3 text-base font-semibold transition-all hover:brightness-110"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    boxShadow: '0 4px 12px rgba(212,83,106,0.3)',
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
