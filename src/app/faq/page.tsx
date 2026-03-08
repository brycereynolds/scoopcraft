import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — ScoopCraft',
  description: 'Frequently asked questions about ScoopCraft orders, delivery, subscriptions, and loyalty rewards.',
};

const faqs = [
  {
    category: 'Orders & Delivery',
    items: [
      {
        q: 'How fast is delivery?',
        a: 'We deliver within 2 hours of your order being placed. You can select your preferred delivery window at checkout. We operate daily from 11am to 9pm.',
      },
      {
        q: 'What is your delivery radius?',
        a: 'We currently deliver within a 15-mile radius of our production kitchen. Enter your address at checkout to confirm delivery availability.',
      },
      {
        q: 'How is the ice cream kept cold during delivery?',
        a: 'All orders are packed in insulated cooler bags with dry ice. Your ice cream will stay frozen solid for up to 2 hours after dispatch.',
      },
      {
        q: 'Can I schedule a delivery in advance?',
        a: 'Yes! You can schedule deliveries up to 7 days in advance. Select your preferred date and time slot at checkout.',
      },
      {
        q: 'What if I am not home when my order arrives?',
        a: 'Our drivers will leave the order in a safe, shaded location and send you a photo confirmation. Orders left unattended for more than 30 minutes may begin to soften.',
      },
    ],
  },
  {
    category: 'Products & Flavors',
    items: [
      {
        q: 'Are your products made in-house?',
        a: 'Yes, every flavor is crafted in our production kitchen in small batches. We never resell third-party ice cream.',
      },
      {
        q: 'Do you have vegan or dairy-free options?',
        a: 'Absolutely. We maintain a rotating selection of oat-milk and coconut-milk based sorbets and ice creams. Look for the "Vegan" or "Dairy-Free" badge on the menu.',
      },
      {
        q: 'How do I know if something contains allergens?',
        a: 'Every product on our menu displays allergen tags (nuts, gluten, dairy, soy, etc.). If you have a severe allergy, please contact us before ordering — our kitchen handles all major allergens.',
      },
      {
        q: 'What is the "Flavor of the Day"?',
        a: 'Each day our chefs craft a small-batch special flavor based on whatever seasonal ingredients are freshest. It\'s only available while supplies last, so order early!',
      },
    ],
  },
  {
    category: 'Subscriptions',
    items: [
      {
        q: 'What is included in the Classic Box?',
        a: 'The Classic Box ($25/month) includes 4 curated artisan scoops, free standard shipping, and 2x Sprinkle loyalty points. Contents are selected by our team each month.',
      },
      {
        q: 'What is included in the Deluxe Box?',
        a: 'The Deluxe Box ($45/month) includes 8 premium scoops (including exclusive limited-drop flavors), free priority delivery, 3x Sprinkle points, and early access to new flavor launches.',
      },
      {
        q: 'Can I pause or cancel my subscription?',
        a: 'Yes, you can pause for up to 3 months or cancel anytime from your account dashboard. Changes take effect before your next billing cycle.',
      },
      {
        q: 'When does my subscription box ship?',
        a: 'Boxes ship on the 1st of each month. You will receive a tracking notification 24 hours before dispatch.',
      },
    ],
  },
  {
    category: 'Loyalty & Rewards',
    items: [
      {
        q: 'How do I earn Sprinkle points?',
        a: 'You earn 1 point per $1 spent on regular orders, 2x on Classic subscriptions, and 3x on Deluxe subscriptions. You also earn 200 bonus points for each successful friend referral.',
      },
      {
        q: 'What are the loyalty tiers?',
        a: 'Sprinkle (0–499 pts), Swirl (500–1,499 pts), and Sundae Supreme (1,500+ pts). Higher tiers unlock exclusive discounts, early flavor access, and free delivery.',
      },
      {
        q: 'How do I redeem my points?',
        a: 'At checkout, you can apply your points for a discount (100 points = $1 off). You can also redeem points for free scoops or exclusive merchandise from the loyalty shop.',
      },
    ],
  },
];

export default function FAQPage() {
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
            Help Center
          </span>
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
            Everything you need to know about ScoopCraft. Can&apos;t find what you&apos;re looking for?{' '}
            <Link href="/contact" className="font-medium" style={{ color: 'var(--primary)' }}>
              Contact us.
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
        <div className="space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2
                className="text-2xl mb-6 pb-3 border-b"
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                }}
              >
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <summary
                      className="flex items-center justify-between px-6 py-4 cursor-pointer select-none font-medium hover:bg-muted transition-colors"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {item.q}
                      <span
                        className="ml-4 flex-shrink-0 text-lg transition-transform group-open:rotate-45"
                        style={{ color: 'var(--primary)' }}
                      >
                        +
                      </span>
                    </summary>
                    <div
                      className="px-6 pb-5 pt-1 text-sm leading-relaxed"
                      style={{ color: 'var(--foreground-secondary)', backgroundColor: 'var(--surface)' }}
                    >
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <h3
            className="text-2xl mb-2"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--foreground)' }}
          >
            Still have questions?
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--foreground-secondary)' }}>
            Our team typically responds within a few hours.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 4px 12px rgba(212,83,106,0.3)' }}
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
