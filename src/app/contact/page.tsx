'use client';

import { useState } from 'react';

const subjects = [
  'Order Issue',
  'Subscription Help',
  'Product Question',
  'Feedback',
  'Press & Partnerships',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const inputBase: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    borderRadius: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    outline: 'none',
  };

  return (
    <>
      {/* Header */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="mx-auto max-w-2xl">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--secondary)' }}
          >
            We&apos;d love to hear from you
          </p>
          <h1
            className="mb-4 text-5xl md:text-6xl"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
          >
            Get in Touch
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
            Questions, feedback, or just want to talk ice cream? We&apos;re here for it.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto max-w-5xl grid gap-12 md:grid-cols-5">
          {/* Contact details */}
          <aside className="md:col-span-2 space-y-8">
            <div>
              <h2
                className="mb-5 text-2xl"
                style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
              >
                Contact Info
              </h2>
              <div className="space-y-5">
                {[
                  {
                    label: 'Email',
                    value: 'hello@scoopcraft.co',
                    href: 'mailto:hello@scoopcraft.co',
                  },
                  { label: 'Hours', value: 'Mon – Fri, 9 AM – 6 PM EST', href: null },
                  { label: 'Response time', value: 'Within 24 hours', href: null },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm underline underline-offset-2"
                        style={{ color: 'var(--primary)' }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div
              className="rounded-2xl p-5 text-sm leading-relaxed"
              style={{
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground-secondary)',
              }}
            >
              <strong style={{ color: 'var(--foreground)' }}>Order issues?</strong> Please have your
              order number handy when reaching out — it helps us resolve things much faster.
            </div>
          </aside>

          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="text-4xl mb-4">🍦</div>
                <h3
                  className="mb-2 text-2xl"
                  style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
                >
                  Message sent!
                </h3>
                <p style={{ color: 'var(--foreground-secondary)' }} className="text-sm">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl p-8 space-y-5"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      style={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    style={{ ...inputBase, cursor: 'pointer' }}
                  >
                    <option value="" disabled>
                      Select a topic…
                    </option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={handleChange}
                    style={{ ...inputBase, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full py-3 text-sm font-semibold transition-opacity duration-150 hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
