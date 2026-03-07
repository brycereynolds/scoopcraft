export const metadata = {
  title: 'FAQ | ScoopCraft',
  description: 'Answers to common questions about ScoopCraft orders, delivery, products, and subscriptions.',
};

type FAQ = { q: string; a: string };

const sections: { heading: string; faqs: FAQ[] }[] = [
  {
    heading: 'Orders & Delivery',
    faqs: [
      {
        q: 'How long does delivery take?',
        a: 'Orders ship within 24 hours of being placed and typically arrive within 1–3 business days, depending on your location. Expedited shipping options are available at checkout.',
      },
      {
        q: 'Do you offer local pickup?',
        a: 'Not currently — but we ship nationwide! Every order is packed with dry ice and insulated liners to ensure your ice cream arrives perfectly frozen no matter where you are.',
      },
      {
        q: "What's your return policy?",
        a: "If your order arrives damaged, melted, or otherwise not as expected, contact us within 48 hours at hello@scoopcraft.co with a photo and we'll send a replacement at no charge, no questions asked.",
      },
    ],
  },
  {
    heading: 'Products & Ingredients',
    faqs: [
      {
        q: 'Do you offer vegan options?',
        a: 'Yes! We offer a rotating selection of vegan and dairy-free flavors made with oat milk and coconut cream bases. Look for the "Vegan" badge on the menu page.',
      },
      {
        q: 'What packaging do you use?',
        a: 'We use insulated, eco-friendly packaging made from recycled materials. Our dry ice packs are completely safe for home disposal — just leave them in a ventilated area to dissipate.',
      },
      {
        q: 'How is the ice cream kept frozen during shipping?',
        a: 'Each order is carefully packed with food-grade dry ice that keeps the contents below freezing for up to 48 hours in transit. For longer routes, we use gel packs in combination with dry ice.',
      },
      {
        q: 'Are your ingredients locally sourced?',
        a: 'We source dairy, eggs, and most produce within 150 miles of our Portland production kitchen. We partner with over 12 regional farms and update our sourcing partners seasonally.',
      },
    ],
  },
  {
    heading: 'Subscriptions',
    faqs: [
      {
        q: 'Can I customize my subscription box?',
        a: 'Absolutely. With any ScoopCraft subscription, you can set flavor preferences (adventurous, classic, vegan-only, etc.), choose box sizes, and skip months whenever you need. Manage everything from your account dashboard.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: "You can cancel anytime from your Account Settings — no phone calls, no hassle. Cancellations made before your next billing date take effect immediately and you won't be charged again.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="mx-auto max-w-2xl">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--secondary)' }}
          >
            Help Center
          </p>
          <h1
            className="mb-4 text-5xl md:text-6xl"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
            Can&apos;t find what you&apos;re looking for? Reach us at{' '}
            <a
              href="mailto:hello@scoopcraft.co"
              style={{ color: 'var(--primary)' }}
              className="underline underline-offset-2"
            >
              hello@scoopcraft.co
            </a>
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto max-w-3xl space-y-14">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2
                className="mb-6 text-2xl"
                style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
              >
                {section.heading}
              </h2>

              <div className="space-y-3">
                {section.faqs.map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <summary
                      className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-base font-medium select-none list-none"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <span>{faq.q}</span>
                      <span
                        className="shrink-0 text-xl leading-none transition-transform duration-200 group-open:rotate-45"
                        style={{ color: 'var(--primary)' }}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <div
                      className="px-6 py-4 text-sm leading-relaxed"
                      style={{
                        backgroundColor: 'var(--muted)',
                        color: 'var(--foreground-secondary)',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section
        className="py-16 px-4 text-center"
        style={{ backgroundColor: 'var(--muted)', borderTop: '1px solid var(--border)' }}
      >
        <div className="mx-auto max-w-xl">
          <h3
            className="mb-3 text-2xl"
            style={{ fontFamily: "'DM Serif Display', serif", color: 'var(--foreground)' }}
          >
            Still have questions?
          </h3>
          <p className="mb-6 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Our team is available Monday through Friday, 9 AM – 6 PM EST. We typically respond within
            a few hours.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-full px-7 py-3 text-sm font-semibold transition-opacity duration-150 hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
