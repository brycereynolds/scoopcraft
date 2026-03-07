export const metadata = {
  title: 'Privacy Policy | ScoopCraft',
  description: 'How ScoopCraft collects, uses, and protects your personal information.',
};

const sections = [
  {
    id: 'collect',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Information you provide directly',
        body: 'When you create an account, place an order, or contact us, we collect your name, email address, shipping address, phone number, and payment information. Payment card data is processed by our PCI-compliant payment processors (Stripe) and is never stored on our servers.',
      },
      {
        subtitle: 'Information collected automatically',
        body: 'When you visit our website, we automatically collect certain technical data including your IP address, browser type, operating system, referring URLs, pages viewed, and the dates and times of your visits. We use cookies and similar tracking technologies to collect this information.',
      },
      {
        subtitle: 'Information from third parties',
        body: 'We may receive information about you from third-party services such as social media platforms if you connect your account, or from our marketing and analytics partners.',
      },
    ],
  },
  {
    id: 'use',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: null,
        body: 'We use the information we collect to:',
      },
      {
        subtitle: null,
        body: '• Process and fulfill your orders, including sending shipping confirmations and delivery updates\n• Manage your account and subscription preferences\n• Communicate with you about your orders, promotions, and updates to our services\n• Personalize your experience and recommend flavors based on past orders\n• Detect and prevent fraud and unauthorized account access\n• Comply with legal obligations and enforce our terms of service\n• Analyze usage trends and improve our website and product offerings',
      },
    ],
  },
  {
    id: 'sharing',
    title: '3. Data Sharing',
    content: [
      {
        subtitle: 'We do not sell your personal data.',
        body: 'We may share your information with trusted third-party service providers who assist us in operating our business, including shipping carriers (UPS, FedEx), payment processors (Stripe), email service providers, and analytics platforms. All service providers are contractually obligated to handle your data securely and only for the purposes we specify.',
      },
      {
        subtitle: 'Legal disclosures',
        body: 'We may disclose your information if required by law, court order, or government authority, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking',
    content: [
      {
        subtitle: null,
        body: 'We use cookies and similar technologies (web beacons, pixels) to improve your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser. Note that disabling cookies may limit some functionality of our website, including keeping items in your cart.',
      },
      {
        subtitle: null,
        body: 'We use Google Analytics to understand how visitors use our site. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on.',
      },
    ],
  },
  {
    id: 'rights',
    title: '5. Your Rights',
    content: [
      {
        subtitle: null,
        body: 'Depending on your location, you may have the following rights regarding your personal data:',
      },
      {
        subtitle: null,
        body: '• Access — Request a copy of the personal data we hold about you\n• Correction — Request correction of inaccurate or incomplete data\n• Deletion — Request deletion of your personal data, subject to legal retention requirements\n• Portability — Request a machine-readable copy of your data\n• Opt-out — Unsubscribe from marketing emails at any time via the unsubscribe link or your account settings\n• Restriction — Request that we limit how we use your data in certain circumstances',
      },
      {
        subtitle: null,
        body: 'To exercise any of these rights, contact us at hello@scoopcraft.co. We will respond within 30 days.',
      },
    ],
  },
  {
    id: 'security',
    title: '6. Data Security',
    content: [
      {
        subtitle: null,
        body: 'We implement industry-standard security measures including TLS encryption for data in transit, encrypted storage for sensitive data, regular security audits, and access controls limiting who can view your information. While we take reasonable precautions, no method of internet transmission is 100% secure.',
      },
    ],
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: [
      {
        subtitle: null,
        body: 'We retain your personal data for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are retained for 7 years for tax and accounting purposes. You may request deletion of your account at any time.',
      },
    ],
  },
  {
    id: 'contact',
    title: '8. Contact Us',
    content: [
      {
        subtitle: null,
        body: 'If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please reach out:',
      },
      {
        subtitle: null,
        body: 'ScoopCraft\nEmail: hello@scoopcraft.co\nResponse time: Within 5 business days',
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--secondary)' }}
          >
            Legal
          </p>
          <h1
            className="mb-4 text-5xl md:text-6xl"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Last updated: <strong>March 2025</strong>
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
            ScoopCraft (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
            protecting your privacy. This policy explains how we collect, use, and safeguard your
            personal information when you use our website and services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto max-w-3xl">
          {/* Table of contents */}
          <nav
            className="mb-12 rounded-2xl p-6"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              Contents
            </p>
            <ol className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm underline underline-offset-2"
                    style={{ color: 'var(--primary)' }}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.id} id={section.id}>
                <h2
                  className="mb-5 text-2xl"
                  style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
                >
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((block, i) => (
                    <div key={i}>
                      {block.subtitle && (
                        <p
                          className="mb-1.5 font-semibold text-sm"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {block.subtitle}
                        </p>
                      )}
                      <p
                        className="text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {block.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-10 border-b"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs" style={{ color: 'var(--foreground-secondary)' }}>
            This policy may be updated periodically. Continued use of ScoopCraft services after
            changes constitutes your acceptance of the revised policy.
          </p>
        </div>
      </section>
    </>
  );
}
