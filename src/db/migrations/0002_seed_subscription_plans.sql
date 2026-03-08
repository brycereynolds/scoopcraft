-- Seed subscription plans for ScoopCraft
-- Classic Box: $25/month, 2 pints, free shipping, early flavor access, Sprinkle tier loyalty
-- Deluxe Box:  $45/month, 4 pints, priority shipping, exclusive flavors, bonus points, Swirl tier loyalty
--
-- stripe_price_id values are placeholder strings; the createSubscription() server action will
-- call getOrCreateStripeProduct / createStripePrice to mint real Stripe IDs on first use and
-- persist them back to these rows automatically.
--
-- NOTE: The auto-mint fallback in subscriptions.ts only triggers when stripe_price_id is NULL
-- or exactly 'price_placeholder'. The placeholder values inserted here will NOT trigger
-- the auto-mint; update stripe_price_id to a real price_... ID (or 'price_placeholder') once
-- you have created the products in your Stripe dashboard.

INSERT INTO subscription_plans (
  name,
  description,
  price,
  stripe_price_id,
  stripe_product_id,
  sort_order,
  is_active,
  created_at
)
VALUES
  (
    'Classic Box',
    'Two handcrafted pints delivered monthly — our most popular flavors curated fresh.',
    25.00,
    'price_classic_monthly_placeholder',
    'prod_classic_box_placeholder',
    1,
    TRUE,
    NOW()
  ),
  (
    'Deluxe Box',
    'Four premium pints plus exclusive seasonal creations and a surprise treat.',
    45.00,
    'price_deluxe_monthly_placeholder',
    'prod_deluxe_box_placeholder',
    2,
    TRUE,
    NOW()
  )
ON CONFLICT (stripe_price_id) DO NOTHING;
