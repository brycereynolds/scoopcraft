import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — ScoopCraft',
  description: 'ScoopCraft privacy policy — how we collect, use, and protect your data.',
};

const sections = [
  {
    title: '1. Information We Collect',
    content: `When you create an account, place an order, or use our services, we collect:

• **Account information**: name, email address, and password (stored as a secure hash — we never see your password in plain text).
• **Order information**: delivery address, order contents, and payment details (payment data is processed by Stripe and never stored on our servers).
• **Usage data**: pages visited, features used, and timestamps to improve our service.
• **Communications**: messages sent to our support team.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information to:

• Process and deliver your orders.
• Send order confirmations, delivery updates, and receipts via email.
• Manage your loyalty points and subscription.
• Respond to your support requests.
• Improve our products and services through aggregate usage analytics.
• Send marketing emails if you have opted in (you may opt out at any time).`,
  },
  {
    title: '3. Data Sharing',
    content: `We do not sell your personal information. We share your data only as necessary to operate our services:

• **Stripe**: for secure payment processing.
• **Delivery partners**: your name and address to complete deliveries.
• **Email service providers**: to send transactional and marketing emails.
• **Legal obligations**: when required by law or to protect rights and safety.`,
  },
  {
    title: '4. Cookies',
    content: `We use cookies and similar technologies to:

• Keep you logged in across sessions (authentication cookies, 30-day expiry).
• Remember your cart contents.
• Analyze site performance (aggregated, anonymized analytics only).

You can disable cookies in your browser settings, but some features (like staying logged in) may not function properly.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your account data for as long as your account is active. Order history is retained for 7 years for legal and tax purposes. You may request deletion of your account and associated data at any time by contacting us — we will process deletion requests within 30 days.`,
  },
  {
    title: '6. Security',
    content: `We take data security seriously:

• Passwords are hashed with argon2id and never stored in plain text.
• All traffic is encrypted via HTTPS/TLS.
• Payment data is handled entirely by Stripe (PCI-DSS compliant) and never touches our servers.
• Access to production data is restricted to authorized personnel only.`,
  },
  {
    title: '7. Your Rights',
    content: `You have the right to:

• **Access**: request a copy of the personal data we hold about you.
• **Correction**: update inaccurate information via your account settings.
• **Deletion**: request erasure of your account and personal data.
• **Portability**: receive your data in a machine-readable format.
• **Opt-out**: unsubscribe from marketing emails at any time.

To exercise any of these rights, contact us at privacy@scoopcraft.com.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by displaying a prominent notice on the site. The "last updated" date at the top of this page will always reflect the most recent version.`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <section
        className="py-16"
        style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FEFAE0 50%, #FFF0F3 100%)' }}
      >
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-medium mb-6"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Legal
          </span>
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-base" style={{ color: 'var(--foreground-secondary)' }}>
            Last updated: March 2026
          </p>
          <p className="text-base mt-3" style={{ color: 'var(--foreground-secondary)' }}>
            ScoopCraft (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                {section.title}
              </h2>
              <div
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--foreground-secondary)' }}
                dangerouslySetInnerHTML={{
                  __html: section.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            </div>
          ))}
        </div>

        <div
          className="mt-12 rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Questions about your privacy?{' '}
            <a
              href="mailto:privacy@scoopcraft.com"
              className="font-medium"
              style={{ color: 'var(--primary)' }}
            >
              privacy@scoopcraft.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
