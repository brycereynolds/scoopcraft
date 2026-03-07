-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0002_seed_test_data
-- Purpose: Comprehensive test data for ScoopCraft development & QA
--
-- Populates:
--   • menu_items      — 35 items (18 flavors, 7 toppings, 5 sauces, 3 vessels, 2 extras)
--   • users           — 10 test customers (password: TestUser2026!)
--   • loyalty_accounts — for each test user
--   • promo_codes     — 5 codes for testing discounts
--   • achievement_definitions — 8 achievements
--   • delivery_zones  — 5 postal codes
--   • delivery_slots  — upcoming week slots
--   • orders          — 15 realistic orders with items, status logs, reviews
--
-- Idempotent: safe to run multiple times (uses ON CONFLICT / existence checks)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── MENU ITEMS ──────────────────────────────────────────────────────────────
-- Only insert if table is empty (prevents duplicates on re-run)
INSERT INTO menu_items (
  name, description, price, category, availability_type, is_available,
  allergens, dietary_flags, calories, fat_grams, carb_grams, sort_order
)
SELECT name, description, price, category::menu_item_category,
       availability_type::availability_type, is_available,
       allergens, dietary_flags, calories, fat_grams, carb_grams, sort_order
FROM (VALUES
  -- ── FLAVORS ─────────────────────────────────────────────────────────────
  (
    'Vanilla Bean Dream',
    'Classic Madagascar vanilla bean ice cream — silky smooth with flecks of real vanilla.',
    '4.50', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 230, '12.0', '27.0', 10
  ),
  (
    'Double Chocolate Fudge',
    'Rich dark chocolate base loaded with velvety fudge ribbons. For serious choco-lovers.',
    '4.75', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY[]::text[], 320, '16.0', '42.0', 20
  ),
  (
    'Strawberry Fields Forever',
    'Sun-ripened strawberry ice cream made with real fruit — sweet, bright, and refreshing.',
    '4.50', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 210, '10.0', '28.0', 30
  ),
  (
    'Mint Chocolate Chip',
    'Cool peppermint ice cream packed with generous dark chocolate chips. A perennial favourite.',
    '4.75', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY[]::text[], 260, '13.0', '32.0', 40
  ),
  (
    'Butter Pecan Bliss',
    'Buttery vanilla base loaded with caramelized pecan pieces. Sweet, nutty, indulgent.',
    '5.00', 'flavor', 'permanent', true,
    ARRAY['dairy', 'tree_nuts'], ARRAY['gluten-free'], 290, '18.0', '28.0', 50
  ),
  (
    'Cookie Dough Carnival',
    'Vanilla ice cream stuffed with edible cookie dough chunks and mini chocolate chips.',
    '5.25', 'flavor', 'permanent', true,
    ARRAY['dairy', 'gluten', 'eggs'], ARRAY[]::text[], 380, '18.0', '50.0', 60
  ),
  (
    'Salted Caramel Swirl',
    'Creamy caramel ice cream with a bold salted caramel ribbon. The perfect sweet-salty balance.',
    '5.00', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 300, '14.0', '39.0', 70
  ),
  (
    'Rocky Road Adventure',
    'Chocolate ice cream with marshmallows, almonds, and fudge swirls. Classic comfort in a scoop.',
    '5.25', 'flavor', 'permanent', true,
    ARRAY['dairy', 'tree_nuts'], ARRAY[]::text[], 350, '18.0', '44.0', 80
  ),
  (
    'Pistachio Dream',
    'Roasted pistachio ice cream with a natural pale-green hue. Subtle, nutty, and utterly creamy.',
    '5.50', 'flavor', 'permanent', true,
    ARRAY['dairy', 'tree_nuts'], ARRAY['gluten-free'], 310, '20.0', '28.0', 90
  ),
  (
    'Birthday Cake Bash',
    'Vanilla cake-flavoured ice cream swirled with frosting and rainbow sprinkles. Party in a cup!',
    '5.25', 'flavor', 'permanent', true,
    ARRAY['dairy', 'gluten', 'eggs'], ARRAY[]::text[], 370, '15.0', '54.0', 100
  ),
  (
    'Lavender Honey',
    'Delicate lavender ice cream kissed with local wildflower honey. A summer floral delight.',
    '5.75', 'flavor', 'seasonal', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 240, '11.0', '31.0', 110
  ),
  (
    'Pumpkin Spice Supreme',
    'Velvety pumpkin ice cream with cinnamon, nutmeg, and cloves. Autumn in every scoop.',
    '5.50', 'flavor', 'seasonal', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 270, '12.0', '37.0', 120
  ),
  (
    'Matcha Green Tea',
    'Stone-ground ceremonial matcha blended into premium cream. Earthy, bittersweet perfection.',
    '5.50', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 225, '11.0', '28.0', 130
  ),
  (
    'Mango Tango Sorbet',
    'Bright, tropical Alphonso mango sorbet — 100% dairy-free and bursting with sunshine.',
    '4.75', 'flavor', 'seasonal', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 180, '0.5', '44.0', 140
  ),
  (
    'Blackberry Bramble',
    'Wild blackberry ice cream with berry coulis swirls. Limited drops only — catch it while it lasts!',
    '5.75', 'flavor', 'limited_drop', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 245, '12.0', '30.0', 150
  ),
  (
    'Coffee Toffee Crunch',
    'Bold espresso ice cream studded with crunchy toffee bits. Your dessert and coffee in one.',
    '5.25', 'flavor', 'permanent', true,
    ARRAY['dairy'], ARRAY[]::text[], 330, '15.0', '43.0', 160
  ),
  (
    'Peach Cobbler Delight',
    'Peach ice cream with buttery cobbler crumble swirls. Grandma''s recipe, frozen and perfected.',
    '5.50', 'flavor', 'seasonal', true,
    ARRAY['dairy', 'gluten'], ARRAY[]::text[], 320, '14.0', '44.0', 170
  ),
  (
    'Coconut Lime Sorbet',
    'Zingy coconut and lime sorbet made with fresh-pressed coconut milk. Vegan and refreshing.',
    '4.75', 'flavor', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 190, '4.0', '38.0', 180
  ),
  -- ── TOPPINGS ────────────────────────────────────────────────────────────
  (
    'Rainbow Sprinkles',
    'Classic multicolour sprinkles — the finishing touch every scoop deserves.',
    '0.50', 'topping', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free'], 25, '0.5', '6.0', 10
  ),
  (
    'Chocolate Chips',
    'Semi-sweet mini chocolate chips for extra chocolatey goodness.',
    '0.75', 'topping', 'permanent', true,
    ARRAY['dairy'], ARRAY[]::text[], 70, '4.0', '9.0', 20
  ),
  (
    'Crushed Oreos',
    'Freshly crushed Oreo cookies for crunch and cookies-and-cream vibes.',
    '0.75', 'topping', 'permanent', true,
    ARRAY['gluten'], ARRAY['vegan'], 80, '3.5', '11.0', 30
  ),
  (
    'Gummy Bears',
    'Assorted fruit-flavoured gummy bears — chewy, colourful, and irresistible.',
    '0.75', 'topping', 'permanent', true,
    ARRAY[]::text[], ARRAY['dairy-free', 'gluten-free'], 60, '0.0', '15.0', 40
  ),
  (
    'Chopped Almonds',
    'Dry-roasted California almonds, chopped for the perfect crunchy topping.',
    '0.75', 'topping', 'permanent', true,
    ARRAY['tree_nuts'], ARRAY['vegan', 'gluten-free', 'dairy-free'], 55, '5.0', '2.0', 50
  ),
  (
    'Toasted Coconut Flakes',
    'Golden toasted coconut flakes — lightly sweet and wonderfully tropical.',
    '0.50', 'topping', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 45, '4.0', '4.0', 60
  ),
  (
    'Fresh Strawberry Slices',
    'Hand-sliced fresh strawberries, seasonal and never frozen.',
    '0.75', 'topping', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 20, '0.2', '5.0', 70
  ),
  -- ── SAUCES ──────────────────────────────────────────────────────────────
  (
    'Hot Fudge',
    'Thick, glossy hot fudge sauce — poured warm over cold ice cream for maximum contrast.',
    '0.75', 'sauce', 'permanent', true,
    ARRAY['dairy'], ARRAY[]::text[], 90, '4.0', '13.0', 10
  ),
  (
    'Salted Caramel Drizzle',
    'Silky house-made salted caramel. Sweet, buttery, with a pinch of fleur de sel.',
    '0.75', 'sauce', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 80, '3.0', '13.0', 20
  ),
  (
    'Strawberry Compote',
    'Slow-cooked strawberry compote with just a touch of lemon. Bright and jammy.',
    '0.75', 'sauce', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 50, '0.1', '13.0', 30
  ),
  (
    'Butterscotch',
    'Old-fashioned butterscotch sauce — rich, golden, and deeply caramelised.',
    '0.75', 'sauce', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 85, '3.5', '14.0', 40
  ),
  (
    'Raspberry Coulis',
    'Fresh raspberry coulis — tart, vibrant, and dairy-free. Beautiful in colour and flavour.',
    '0.75', 'sauce', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 45, '0.2', '11.0', 50
  ),
  -- ── VESSELS ─────────────────────────────────────────────────────────────
  (
    'Sugar Cone',
    'Classic crispy sugar cone — light, sweet, and perfectly crunchy.',
    '0.50', 'vessel', 'permanent', true,
    ARRAY['gluten'], ARRAY['vegan'], 50, '1.0', '10.0', 10
  ),
  (
    'Waffle Cone',
    'Fresh-baked house waffle cone — thick, fragrant, and made fresh daily.',
    '1.00', 'vessel', 'permanent', true,
    ARRAY['gluten', 'eggs'], ARRAY[]::text[], 120, '3.0', '23.0', 20
  ),
  (
    'Cup',
    'Our standard paper cup — eco-friendly, no cone needed.',
    '0.00', 'vessel', 'permanent', true,
    ARRAY[]::text[], ARRAY['vegan', 'gluten-free', 'dairy-free'], 0, '0.0', '0.0', 30
  ),
  -- ── EXTRAS ──────────────────────────────────────────────────────────────
  (
    'Extra Scoop',
    'Add another full scoop of any flavour to your order.',
    '2.50', 'extra', 'permanent', true,
    ARRAY['dairy'], ARRAY[]::text[], NULL, NULL, NULL, 10
  ),
  (
    'Whipped Cream',
    'Freshly whipped cream — light, airy, and a generous swirl.',
    '0.50', 'extra', 'permanent', true,
    ARRAY['dairy'], ARRAY['gluten-free'], 50, '5.0', '1.0', 20
  )
) AS v(name, description, price, category, availability_type, is_available,
        allergens, dietary_flags, calories, fat_grams, carb_grams, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1);
--> statement-breakpoint

-- ─── TEST USERS ──────────────────────────────────────────────────────────────
-- Password for all test users: TestUser2026!
-- Hash computed with argon2id (m=19456, t=2, p=1)
INSERT INTO users (
  email, password_hash, role, first_name, last_name, phone,
  sms_opt_in, birthday_month, birthday_day, email_verified_at,
  referral_code, created_at, updated_at
) VALUES
  (
    'alice.johnson@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Alice', 'Johnson', '555-0101',
    true, 7, 14, NOW() - INTERVAL '90 days',
    'ALICE2026', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days'
  ),
  (
    'bob.williams@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Bob', 'Williams', '555-0102',
    false, 3, 22, NOW() - INTERVAL '75 days',
    'BOB20261', NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days'
  ),
  (
    'carol.martinez@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Carol', 'Martinez', '555-0103',
    true, 11, 5, NOW() - INTERVAL '60 days',
    'CAROL026', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'
  ),
  (
    'david.chen@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'David', 'Chen', '555-0104',
    true, 1, 30, NOW() - INTERVAL '45 days',
    'DAVID026', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'
  ),
  (
    'emma.thompson@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Emma', 'Thompson', '555-0105',
    false, 5, 18, NOW() - INTERVAL '40 days',
    'EMMA2026', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'
  ),
  (
    'frank.rodriguez@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Frank', 'Rodriguez', '555-0106',
    true, 9, 12, NOW() - INTERVAL '120 days',
    'FRANK026', NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days'
  ),
  (
    'grace.kim@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Grace', 'Kim', '555-0107',
    true, 8, 25, NOW() - INTERVAL '30 days',
    'GRACE026', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
  ),
  (
    'henry.patel@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Henry', 'Patel', '555-0108',
    false, 4, 7, NOW() - INTERVAL '55 days',
    'HENRY026', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'
  ),
  (
    'isabella.nguyen@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'Isabella', 'Nguyen', '555-0109',
    true, 12, 3, NOW() - INTERVAL '20 days',
    'ISAB2026', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'
  ),
  (
    'james.obrien@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$FH5ypsoq1LRc+0WXvP2UeQ$fN4cXOBvZycc8HKoiw3FlUwjScGvHKBx8IwDpG3Nqdk',
    'customer', 'James', 'O''Brien', '555-0110',
    false, 6, 20, NOW() - INTERVAL '10 days',
    'JAMES026', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  )
ON CONFLICT (email) DO NOTHING;
--> statement-breakpoint

-- ─── LOYALTY ACCOUNTS ────────────────────────────────────────────────────────
INSERT INTO loyalty_accounts (user_id, points_balance, tier, created_at, updated_at)
SELECT u.id, la.points_balance, la.tier::loyalty_tier, u.created_at, NOW()
FROM users u
JOIN (VALUES
  ('alice.johnson@example.com',   850,  'swirl'),
  ('bob.williams@example.com',    200,  'sprinkle'),
  ('carol.martinez@example.com',  1450, 'swirl'),
  ('david.chen@example.com',      620,  'sprinkle'),
  ('emma.thompson@example.com',   100,  'sprinkle'),
  ('frank.rodriguez@example.com', 3200, 'sundae_supreme'),
  ('grace.kim@example.com',       75,   'sprinkle'),
  ('henry.patel@example.com',     420,  'sprinkle'),
  ('isabella.nguyen@example.com', 50,   'sprinkle'),
  ('james.obrien@example.com',    180,  'sprinkle')
) AS la(email, points_balance, tier) ON u.email = la.email
ON CONFLICT (user_id) DO NOTHING;
--> statement-breakpoint

-- ─── PROMO CODES ─────────────────────────────────────────────────────────────
INSERT INTO promo_codes (
  code, discount_type, discount_value, min_order_value,
  usage_limit, per_customer_limit, is_active, applicable_to,
  created_by_admin_id, created_at
)
SELECT
  pc.code, pc.discount_type::discount_type, pc.discount_value,
  pc.min_order_value, pc.usage_limit, pc.per_customer_limit,
  pc.is_active, pc.applicable_to,
  (SELECT id FROM users WHERE email = 'admin@scoopcraft.com' LIMIT 1),
  NOW()
FROM (VALUES
  ('WELCOME10',  'percentage', '10.00', '5.00',  NULL, 1, true,  'all'),
  ('SCOOP5OFF',  'fixed',      '5.00',  '20.00', 500,  1, true,  'all'),
  ('SUMMER20',   'percentage', '20.00', '15.00', 200,  1, true,  'all'),
  ('SWEETDEAL',  'fixed',      '3.00',  '12.00', NULL, 2, true,  'all'),
  ('LOYALCLUB',  'percentage', '15.00', '10.00', 100,  1, true,  'all')
) AS pc(code, discount_type, discount_value, min_order_value, usage_limit, per_customer_limit, is_active, applicable_to)
ON CONFLICT (code) DO NOTHING;
--> statement-breakpoint

-- ─── ACHIEVEMENT DEFINITIONS ─────────────────────────────────────────────────
INSERT INTO achievement_definitions (name, description, icon, condition_type, condition_value, is_active, created_at)
SELECT name, description, icon, condition_type, condition_value, true, NOW()
FROM (VALUES
  ('First Scoop',        'Place your very first order.',                    '🍦', 'order_count',          1),
  ('Sweet Trio',         'Place 3 orders total.',                           '🎉', 'order_count',          3),
  ('Scoop Veteran',      'Place 10 orders — you''re a true ScoopCrafter!', '🏆', 'order_count',         10),
  ('Social Scooper',     'Refer a friend who places their first order.',    '👯', 'referral_count',        1),
  ('Review Star',        'Leave your first review.',                        '⭐', 'review_count',          1),
  ('Flavor Explorer',    'Order 5 different flavors.',                      '🌈', 'flavor_variety_count',  5),
  ('Swirl Status',       'Reach Swirl loyalty tier.',                       '🌀', 'tier_reached',          2),
  ('Birthday Treat',     'Order on your birthday.',                         '🎂', 'birthday_order',        1)
) AS v(name, description, icon, condition_type, condition_value)
WHERE NOT EXISTS (SELECT 1 FROM achievement_definitions LIMIT 1);
--> statement-breakpoint

-- ─── DELIVERY ZONES ──────────────────────────────────────────────────────────
INSERT INTO delivery_zones (zone_type, value, is_active, created_at)
SELECT 'postal_code'::delivery_zone_type, value, true, NOW()
FROM (VALUES ('10001'), ('10002'), ('10003'), ('10004'), ('10005')) AS v(value)
WHERE NOT EXISTS (SELECT 1 FROM delivery_zones LIMIT 1);
--> statement-breakpoint

-- ─── DELIVERY SLOTS ──────────────────────────────────────────────────────────
-- Slots for the next 7 days (2-hour windows, 3 per day)
INSERT INTO delivery_slots (slot_date, start_time, end_time, max_orders, booked_count, is_active, created_at)
SELECT
  (CURRENT_DATE + (day_offset || ' days')::interval)::date,
  start_time, end_time, 8, 0, true, NOW()
FROM
  (VALUES (1),(2),(3),(4),(5),(6),(7)) AS days(day_offset),
  (VALUES ('12:00','14:00'),('14:00','16:00'),('18:00','20:00')) AS slots(start_time, end_time)
ON CONFLICT (slot_date, start_time) DO NOTHING;
--> statement-breakpoint

-- ─── ORDERS, ORDER ITEMS, STATUS LOGS & REVIEWS ──────────────────────────────
-- Uses a PL/pgSQL block so we can capture IDs and avoid FK issues
DO $$
DECLARE
  admin_id      INTEGER;
  alice_id      INTEGER;
  bob_id        INTEGER;
  carol_id      INTEGER;
  david_id      INTEGER;
  emma_id       INTEGER;
  frank_id      INTEGER;
  grace_id      INTEGER;
  henry_id      INTEGER;
  isabella_id   INTEGER;
  james_id      INTEGER;

  -- Menu item IDs
  vanilla_id    INTEGER;
  choc_id       INTEGER;
  strawberry_id INTEGER;
  mint_cc_id    INTEGER;
  butter_pecan_id INTEGER;
  cookie_dough_id INTEGER;
  sal_caramel_id INTEGER;
  rocky_road_id  INTEGER;
  pistachio_id   INTEGER;
  birthday_cake_id INTEGER;
  matcha_id      INTEGER;
  coconut_lime_id INTEGER;
  coffee_toffee_id INTEGER;
  sprinkles_id   INTEGER;
  choc_chips_id  INTEGER;
  oreos_id       INTEGER;
  almonds_id     INTEGER;
  hot_fudge_id   INTEGER;
  caramel_sauce_id INTEGER;
  sugar_cone_id  INTEGER;
  waffle_cone_id INTEGER;
  cup_id         INTEGER;
  extra_scoop_id INTEGER;
  whipped_id     INTEGER;

  -- Order IDs
  ord1  INTEGER; ord2  INTEGER; ord3  INTEGER; ord4  INTEGER; ord5  INTEGER;
  ord6  INTEGER; ord7  INTEGER; ord8  INTEGER; ord9  INTEGER; ord10 INTEGER;
  ord11 INTEGER; ord12 INTEGER; ord13 INTEGER; ord14 INTEGER; ord15 INTEGER;

BEGIN
  -- Skip entire block if orders already exist
  IF (SELECT COUNT(*) FROM orders) > 0 THEN
    RETURN;
  END IF;

  -- Lookup user IDs
  SELECT id INTO admin_id     FROM users WHERE email = 'admin@scoopcraft.com';
  SELECT id INTO alice_id     FROM users WHERE email = 'alice.johnson@example.com';
  SELECT id INTO bob_id       FROM users WHERE email = 'bob.williams@example.com';
  SELECT id INTO carol_id     FROM users WHERE email = 'carol.martinez@example.com';
  SELECT id INTO david_id     FROM users WHERE email = 'david.chen@example.com';
  SELECT id INTO emma_id      FROM users WHERE email = 'emma.thompson@example.com';
  SELECT id INTO frank_id     FROM users WHERE email = 'frank.rodriguez@example.com';
  SELECT id INTO grace_id     FROM users WHERE email = 'grace.kim@example.com';
  SELECT id INTO henry_id     FROM users WHERE email = 'henry.patel@example.com';
  SELECT id INTO isabella_id  FROM users WHERE email = 'isabella.nguyen@example.com';
  SELECT id INTO james_id     FROM users WHERE email = 'james.obrien@example.com';

  -- Lookup menu item IDs
  SELECT id INTO vanilla_id       FROM menu_items WHERE name = 'Vanilla Bean Dream';
  SELECT id INTO choc_id          FROM menu_items WHERE name = 'Double Chocolate Fudge';
  SELECT id INTO strawberry_id    FROM menu_items WHERE name = 'Strawberry Fields Forever';
  SELECT id INTO mint_cc_id       FROM menu_items WHERE name = 'Mint Chocolate Chip';
  SELECT id INTO butter_pecan_id  FROM menu_items WHERE name = 'Butter Pecan Bliss';
  SELECT id INTO cookie_dough_id  FROM menu_items WHERE name = 'Cookie Dough Carnival';
  SELECT id INTO sal_caramel_id   FROM menu_items WHERE name = 'Salted Caramel Swirl';
  SELECT id INTO rocky_road_id    FROM menu_items WHERE name = 'Rocky Road Adventure';
  SELECT id INTO pistachio_id     FROM menu_items WHERE name = 'Pistachio Dream';
  SELECT id INTO birthday_cake_id FROM menu_items WHERE name = 'Birthday Cake Bash';
  SELECT id INTO matcha_id        FROM menu_items WHERE name = 'Matcha Green Tea';
  SELECT id INTO coconut_lime_id  FROM menu_items WHERE name = 'Coconut Lime Sorbet';
  SELECT id INTO coffee_toffee_id FROM menu_items WHERE name = 'Coffee Toffee Crunch';
  SELECT id INTO sprinkles_id     FROM menu_items WHERE name = 'Rainbow Sprinkles';
  SELECT id INTO choc_chips_id    FROM menu_items WHERE name = 'Chocolate Chips';
  SELECT id INTO oreos_id         FROM menu_items WHERE name = 'Crushed Oreos';
  SELECT id INTO almonds_id       FROM menu_items WHERE name = 'Chopped Almonds';
  SELECT id INTO hot_fudge_id     FROM menu_items WHERE name = 'Hot Fudge';
  SELECT id INTO caramel_sauce_id FROM menu_items WHERE name = 'Salted Caramel Drizzle';
  SELECT id INTO sugar_cone_id    FROM menu_items WHERE name = 'Sugar Cone';
  SELECT id INTO waffle_cone_id   FROM menu_items WHERE name = 'Waffle Cone';
  SELECT id INTO cup_id           FROM menu_items WHERE name = 'Cup';
  SELECT id INTO extra_scoop_id   FROM menu_items WHERE name = 'Extra Scoop';
  SELECT id INTO whipped_id       FROM menu_items WHERE name = 'Whipped Cream';

  -- ── ORDER 1: Alice — delivered delivery, 65 days ago ─────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    alice_id, 'delivered', 'delivery',
    '{"street":"123 Maple St","city":"New York","state":"NY","zip":"10001"}',
    '10.75', '0.97', '11.72', 11,
    'pi_test_0001', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days' + INTERVAL '45 minutes',
    NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days'
  ) RETURNING id INTO ord1;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord1, vanilla_id,      1, '4.50', '4.50', 'Vanilla Bean Dream'),
    (ord1, strawberry_id,   1, '4.50', '4.50', 'Strawberry Fields Forever'),
    (ord1, sugar_cone_id,   1, '0.50', '0.50', 'Sugar Cone'),
    (ord1, sprinkles_id,    1, '0.50', '0.50', 'Rainbow Sprinkles'),
    (ord1, hot_fudge_id,    1, '0.75', '0.75', 'Hot Fudge');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord1, 'pending',   'confirmed',       admin_id, NOW() - INTERVAL '65 days' + INTERVAL '2 minutes'),
    (ord1, 'confirmed', 'preparing',       admin_id, NOW() - INTERVAL '65 days' + INTERVAL '10 minutes'),
    (ord1, 'preparing', 'out_for_delivery',admin_id, NOW() - INTERVAL '65 days' + INTERVAL '25 minutes'),
    (ord1, 'out_for_delivery', 'delivered',admin_id, NOW() - INTERVAL '65 days' + INTERVAL '45 minutes');

  -- ── ORDER 2: Alice — delivered delivery, 30 days ago ─────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    alice_id, 'delivered', 'delivery',
    '{"street":"123 Maple St","city":"New York","state":"NY","zip":"10001"}',
    '16.50', '1.49', '17.99', 17,
    'pi_test_0002', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '40 minutes',
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
  ) RETURNING id INTO ord2;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord2, mint_cc_id,      1, '4.75', '4.75', 'Mint Chocolate Chip'),
    (ord2, cookie_dough_id, 1, '5.25', '5.25', 'Cookie Dough Carnival'),
    (ord2, waffle_cone_id,  2, '1.00', '2.00', 'Waffle Cone'),
    (ord2, hot_fudge_id,    1, '0.75', '0.75', 'Hot Fudge'),
    (ord2, whipped_id,      1, '0.50', '0.50', 'Whipped Cream'),
    (ord2, extra_scoop_id,  1, '2.50', '2.50', 'Extra Scoop'),
    (ord2, oreos_id,        1, '0.75', '0.75', 'Crushed Oreos');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord2, 'pending',   'confirmed',       admin_id, NOW() - INTERVAL '30 days' + INTERVAL '3 minutes'),
    (ord2, 'confirmed', 'preparing',       admin_id, NOW() - INTERVAL '30 days' + INTERVAL '12 minutes'),
    (ord2, 'preparing', 'out_for_delivery',admin_id, NOW() - INTERVAL '30 days' + INTERVAL '28 minutes'),
    (ord2, 'out_for_delivery', 'delivered',admin_id, NOW() - INTERVAL '30 days' + INTERVAL '40 minutes');

  -- ── ORDER 3: Bob — delivered pickup, 50 days ago ──────────────────────────
  INSERT INTO orders (
    user_id, status, order_type,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    bob_id, 'delivered', 'pickup',
    '8.25', '0.74', '8.99', 8,
    'pi_test_0003', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days' + INTERVAL '15 minutes',
    NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'
  ) RETURNING id INTO ord3;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord3, choc_id,        1, '4.75', '4.75', 'Double Chocolate Fudge'),
    (ord3, rocky_road_id,  1, '5.25', '5.25', 'Rocky Road Adventure'),
    (ord3, cup_id,         2, '0.00', '0.00', 'Cup'),
    (ord3, hot_fudge_id,   1, '0.75', '0.75', 'Hot Fudge'),
    (ord3, sprinkles_id,   1, '0.50', '0.50', 'Rainbow Sprinkles');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord3, 'pending',  'confirmed', admin_id, NOW() - INTERVAL '50 days' + INTERVAL '2 minutes'),
    (ord3, 'confirmed','preparing', admin_id, NOW() - INTERVAL '50 days' + INTERVAL '8 minutes'),
    (ord3, 'preparing','ready',     admin_id, NOW() - INTERVAL '50 days' + INTERVAL '14 minutes'),
    (ord3, 'ready',    'delivered', admin_id, NOW() - INTERVAL '50 days' + INTERVAL '15 minutes');

  -- ── ORDER 4: Bob — pending delivery (just placed) ─────────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    edit_window_expires_at,
    stripe_payment_intent_id,
    created_at, updated_at
  ) VALUES (
    bob_id, 'pending', 'delivery',
    '{"street":"456 Oak Ave","city":"New York","state":"NY","zip":"10002"}',
    '7.25', '0.65', '7.90', 0,
    NOW() + INTERVAL '90 seconds',
    'pi_test_0004',
    NOW() - INTERVAL '30 seconds', NOW() - INTERVAL '30 seconds'
  ) RETURNING id INTO ord4;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord4, pistachio_id,   1, '5.50', '5.50', 'Pistachio Dream'),
    (ord4, sugar_cone_id,  1, '0.50', '0.50', 'Sugar Cone'),
    (ord4, caramel_sauce_id,1,'0.75', '0.75', 'Salted Caramel Drizzle'),
    (ord4, almonds_id,     1, '0.75', '0.75', 'Chopped Almonds');

  -- ── ORDER 5: Carol — delivered delivery, 55 days ago ─────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    carol_id, 'delivered', 'delivery',
    '{"street":"789 Pine Rd","city":"New York","state":"NY","zip":"10003"}',
    '12.00', '1.08', '13.08', 13,
    'pi_test_0005', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days' + INTERVAL '50 minutes',
    NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'
  ) RETURNING id INTO ord5;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord5, sal_caramel_id,  1, '5.00', '5.00', 'Salted Caramel Swirl'),
    (ord5, matcha_id,       1, '5.50', '5.50', 'Matcha Green Tea'),
    (ord5, waffle_cone_id,  1, '1.00', '1.00', 'Waffle Cone'),
    (ord5, caramel_sauce_id,1, '0.75', '0.75', 'Salted Caramel Drizzle');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord5, 'pending', 'confirmed',        admin_id, NOW() - INTERVAL '55 days' + INTERVAL '3 minutes'),
    (ord5, 'confirmed','preparing',       admin_id, NOW() - INTERVAL '55 days' + INTERVAL '15 minutes'),
    (ord5, 'preparing','out_for_delivery',admin_id, NOW() - INTERVAL '55 days' + INTERVAL '35 minutes'),
    (ord5, 'out_for_delivery','delivered',admin_id, NOW() - INTERVAL '55 days' + INTERVAL '50 minutes');

  -- ── ORDER 6: Carol — delivered pickup, 25 days ago ────────────────────────
  INSERT INTO orders (
    user_id, status, order_type,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    carol_id, 'delivered', 'pickup',
    '14.00', '1.26', '15.26', 15,
    'pi_test_0006', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '20 minutes',
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'
  ) RETURNING id INTO ord6;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord6, birthday_cake_id, 1, '5.25', '5.25', 'Birthday Cake Bash'),
    (ord6, cookie_dough_id,  1, '5.25', '5.25', 'Cookie Dough Carnival'),
    (ord6, cup_id,           2, '0.00', '0.00', 'Cup'),
    (ord6, sprinkles_id,     1, '0.50', '0.50', 'Rainbow Sprinkles'),
    (ord6, choc_chips_id,    1, '0.75', '0.75', 'Chocolate Chips'),
    (ord6, oreos_id,         1, '0.75', '0.75', 'Crushed Oreos'),
    (ord6, whipped_id,       1, '0.50', '0.50', 'Whipped Cream');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord6, 'pending',  'confirmed', admin_id, NOW() - INTERVAL '25 days' + INTERVAL '2 minutes'),
    (ord6, 'confirmed','preparing', admin_id, NOW() - INTERVAL '25 days' + INTERVAL '10 minutes'),
    (ord6, 'preparing','ready',     admin_id, NOW() - INTERVAL '25 days' + INTERVAL '18 minutes'),
    (ord6, 'ready',    'delivered', admin_id, NOW() - INTERVAL '25 days' + INTERVAL '20 minutes');

  -- ── ORDER 7: Carol — delivered delivery, 10 days ago ─────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    carol_id, 'delivered', 'delivery',
    '{"street":"789 Pine Rd","city":"New York","state":"NY","zip":"10003"}',
    '9.50', '0.86', '10.36', 10,
    'pi_test_0007', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '42 minutes',
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  ) RETURNING id INTO ord7;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord7, vanilla_id,       1, '4.50', '4.50', 'Vanilla Bean Dream'),
    (ord7, butter_pecan_id,  1, '5.00', '5.00', 'Butter Pecan Bliss'),
    (ord7, cup_id,           2, '0.00', '0.00', 'Cup'),
    (ord7, caramel_sauce_id, 1, '0.75', '0.75', 'Salted Caramel Drizzle'),
    (ord7, almonds_id,       1, '0.75', '0.75', 'Chopped Almonds'),
    (ord7, whipped_id,       1, '0.50', '0.50', 'Whipped Cream');

  -- ── ORDER 8: David — delivered pickup, 40 days ago ────────────────────────
  INSERT INTO orders (
    user_id, status, order_type,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    david_id, 'delivered', 'pickup',
    '11.00', '0.99', '11.99', 11,
    'pi_test_0008', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days' + INTERVAL '18 minutes',
    NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'
  ) RETURNING id INTO ord8;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord8, matcha_id,        1, '5.50', '5.50', 'Matcha Green Tea'),
    (ord8, coconut_lime_id,  1, '4.75', '4.75', 'Coconut Lime Sorbet'),
    (ord8, cup_id,           2, '0.00', '0.00', 'Cup'),
    (ord8, choc_chips_id,    1, '0.75', '0.75', 'Chocolate Chips');

  -- ── ORDER 9: David — confirmed delivery, 5 days ago ──────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at,
    created_at, updated_at
  ) VALUES (
    david_id, 'confirmed', 'delivery',
    '{"street":"321 Elm St","city":"New York","state":"NY","zip":"10004"}',
    '13.25', '1.19', '14.44', 0,
    'pi_test_0009', NOW() - INTERVAL '5 days' + INTERVAL '5 minutes',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  ) RETURNING id INTO ord9;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord9, coffee_toffee_id, 1, '5.25', '5.25', 'Coffee Toffee Crunch'),
    (ord9, rocky_road_id,    1, '5.25', '5.25', 'Rocky Road Adventure'),
    (ord9, waffle_cone_id,   1, '1.00', '1.00', 'Waffle Cone'),
    (ord9, hot_fudge_id,     1, '0.75', '0.75', 'Hot Fudge'),
    (ord9, oreos_id,         1, '0.75', '0.75', 'Crushed Oreos'),
    (ord9, whipped_id,       1, '0.50', '0.50', 'Whipped Cream'),
    (ord9, extra_scoop_id,   1, '2.50', '2.50', 'Extra Scoop');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord9, 'pending', 'confirmed', admin_id, NOW() - INTERVAL '5 days' + INTERVAL '5 minutes');

  -- ── ORDER 10: Frank — delivered delivery #1, 100 days ago ─────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tip_amount, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    frank_id, 'delivered', 'delivery',
    '{"street":"555 Broadway","city":"New York","state":"NY","zip":"10002"}',
    '22.75', '4.00', '2.05', '28.80', 22,
    'pi_test_0010', NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days' + INTERVAL '52 minutes',
    NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days'
  ) RETURNING id INTO ord10;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord10, sal_caramel_id,  1, '5.00', '5.00', 'Salted Caramel Swirl'),
    (ord10, butter_pecan_id, 1, '5.00', '5.00', 'Butter Pecan Bliss'),
    (ord10, pistachio_id,    1, '5.50', '5.50', 'Pistachio Dream'),
    (ord10, waffle_cone_id,  2, '1.00', '2.00', 'Waffle Cone'),
    (ord10, hot_fudge_id,    1, '0.75', '0.75', 'Hot Fudge'),
    (ord10, caramel_sauce_id,1, '0.75', '0.75', 'Salted Caramel Drizzle'),
    (ord10, extra_scoop_id,  1, '2.50', '2.50', 'Extra Scoop'),
    (ord10, choc_chips_id,   1, '0.75', '0.75', 'Chocolate Chips'),
    (ord10, almonds_id,      1, '0.75', '0.75', 'Chopped Almonds');

  -- ── ORDER 11: Frank — delivered delivery #2, 60 days ago ──────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tip_amount, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    frank_id, 'delivered', 'delivery',
    '{"street":"555 Broadway","city":"New York","state":"NY","zip":"10002"}',
    '18.50', '3.00', '1.67', '23.17', 18,
    'pi_test_0011', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days' + INTERVAL '48 minutes',
    NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'
  ) RETURNING id INTO ord11;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord11, choc_id,         1, '4.75', '4.75', 'Double Chocolate Fudge'),
    (ord11, cookie_dough_id, 1, '5.25', '5.25', 'Cookie Dough Carnival'),
    (ord11, rocky_road_id,   1, '5.25', '5.25', 'Rocky Road Adventure'),
    (ord11, sugar_cone_id,   1, '0.50', '0.50', 'Sugar Cone'),
    (ord11, hot_fudge_id,    1, '0.75', '0.75', 'Hot Fudge'),
    (ord11, oreos_id,        1, '0.75', '0.75', 'Crushed Oreos'),
    (ord11, extra_scoop_id,  1, '2.50', '2.50', 'Extra Scoop');

  -- ── ORDER 12: Grace — confirmed pickup, 2 days ago ────────────────────────
  INSERT INTO orders (
    user_id, status, order_type,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at,
    created_at, updated_at
  ) VALUES (
    grace_id, 'confirmed', 'pickup',
    '9.75', '0.88', '10.63', 0,
    'pi_test_0012', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  ) RETURNING id INTO ord12;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord12, strawberry_id,   1, '4.50', '4.50', 'Strawberry Fields Forever'),
    (ord12, vanilla_id,      1, '4.50', '4.50', 'Vanilla Bean Dream'),
    (ord12, cup_id,          2, '0.00', '0.00', 'Cup'),
    (ord12, sprinkles_id,    1, '0.50', '0.50', 'Rainbow Sprinkles'),
    (ord12, whipped_id,      1, '0.50', '0.50', 'Whipped Cream');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord12, 'pending', 'confirmed', admin_id, NOW() - INTERVAL '2 days' + INTERVAL '3 minutes');

  -- ── ORDER 13: Henry — delivered pickup, 35 days ago ──────────────────────
  INSERT INTO orders (
    user_id, status, order_type,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at, delivered_at,
    created_at, updated_at
  ) VALUES (
    henry_id, 'delivered', 'pickup',
    '10.00', '0.90', '10.90', 10,
    'pi_test_0013', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days' + INTERVAL '22 minutes',
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'
  ) RETURNING id INTO ord13;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord13, mint_cc_id,      1, '4.75', '4.75', 'Mint Chocolate Chip'),
    (ord13, coffee_toffee_id,1, '5.25', '5.25', 'Coffee Toffee Crunch'),
    (ord13, cup_id,          2, '0.00', '0.00', 'Cup');

  -- ── ORDER 14: Henry — cancelled, 15 days ago ─────────────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, cancelled_at, cancellation_reason,
    created_at, updated_at
  ) VALUES (
    henry_id, 'cancelled', 'delivery',
    '{"street":"900 Willow Way","city":"New York","state":"NY","zip":"10005"}',
    '5.00', '0.45', '5.45', 0,
    'pi_test_0014', NOW() - INTERVAL '15 days' + INTERVAL '3 minutes',
    'Customer requested cancellation within edit window',
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  ) RETURNING id INTO ord14;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord14, vanilla_id, 1, '4.50', '4.50', 'Vanilla Bean Dream'),
    (ord14, cup_id,     1, '0.00', '0.00', 'Cup');

  INSERT INTO order_status_log (order_id, from_status, to_status, note, changed_at) VALUES
    (ord14, 'pending', 'cancelled', 'Customer cancelled via app', NOW() - INTERVAL '15 days' + INTERVAL '3 minutes');

  -- ── ORDER 15: Isabella — preparing delivery ───────────────────────────────
  INSERT INTO orders (
    user_id, status, order_type, delivery_address,
    subtotal, tax_amount, total, loyalty_points_earned,
    stripe_payment_intent_id, confirmed_at,
    created_at, updated_at
  ) VALUES (
    isabella_id, 'preparing', 'delivery',
    '{"street":"42 Sunset Blvd","city":"New York","state":"NY","zip":"10001"}',
    '11.25', '1.01', '12.26', 0,
    'pi_test_0015', NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '20 minutes'
  ) RETURNING id INTO ord15;

  INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, line_price, item_name_snapshot) VALUES
    (ord15, sal_caramel_id,   1, '5.00', '5.00', 'Salted Caramel Swirl'),
    (ord15, strawberry_id,    1, '4.50', '4.50', 'Strawberry Fields Forever'),
    (ord15, waffle_cone_id,   1, '1.00', '1.00', 'Waffle Cone'),
    (ord15, caramel_sauce_id, 1, '0.75', '0.75', 'Salted Caramel Drizzle');

  INSERT INTO order_status_log (order_id, from_status, to_status, changed_by_admin_id, changed_at) VALUES
    (ord15, 'pending',   'confirmed', admin_id, NOW() - INTERVAL '20 minutes'),
    (ord15, 'confirmed', 'preparing', admin_id, NOW() - INTERVAL '10 minutes');

  -- ── REVIEWS ──────────────────────────────────────────────────────────────
  INSERT INTO reviews (
    user_id, menu_item_id, order_id, rating, body,
    is_approved, points_awarded, created_at, updated_at
  ) VALUES
    (
      alice_id, vanilla_id, ord1, 5,
      'Perfect vanilla! Rich and creamy with real vanilla bean specks. My go-to order every time.',
      true, true, NOW() - INTERVAL '64 days', NOW() - INTERVAL '64 days'
    ),
    (
      alice_id, mint_cc_id, ord2, 5,
      'The mint is so refreshing without being toothpaste-y. Loved the chocolate chip ratio!',
      true, true, NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'
    ),
    (
      bob_id, choc_id, ord3, 4,
      'Super rich and fudgy. Would be 5 stars but the portion felt a tiny bit small.',
      true, true, NOW() - INTERVAL '49 days', NOW() - INTERVAL '49 days'
    ),
    (
      carol_id, sal_caramel_id, ord5, 5,
      'The salted caramel ribbon is INCREDIBLE. Sweet-salty balance is chef''s kiss.',
      true, true, NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'
    ),
    (
      carol_id, birthday_cake_id, ord6, 5,
      'Brought this to my niece''s party. Everyone loved it! The sprinkles make it so fun.',
      true, true, NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'
    ),
    (
      carol_id, vanilla_id, ord7, 4,
      'Classic and clean. Pairs perfectly with the caramel drizzle.',
      true, true, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
    ),
    (
      david_id, matcha_id, ord8, 5,
      'As someone who grew up with real matcha this is legit. Not too sweet, earthy and smooth.',
      true, true, NOW() - INTERVAL '39 days', NOW() - INTERVAL '39 days'
    ),
    (
      frank_id, pistachio_id, ord10, 5,
      'I''ve had pistachio ice cream all over the world and this is genuinely top tier.',
      true, true, NOW() - INTERVAL '99 days', NOW() - INTERVAL '99 days'
    ),
    (
      frank_id, cookie_dough_id, ord11, 4,
      'Cookie dough chunks are generous and the vanilla base is great. A little rich but that''s the point!',
      true, true, NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'
    ),
    (
      henry_id, coffee_toffee_id, ord13, 5,
      'Coffee and toffee is the combination I didn''t know I needed. Will be back for this one.',
      true, true, NOW() - INTERVAL '34 days', NOW() - INTERVAL '34 days'
    );

END $$;
--> statement-breakpoint

-- ─── FLAVOR SUBMISSIONS (community Scoop Lab ideas) ──────────────────────────
INSERT INTO flavor_submissions (user_id, name, description, status, vote_count, created_at)
SELECT u.id, fs.name, fs.description, fs.status::flavor_submission_status, fs.vote_count, NOW() - (fs.days_ago || ' days')::interval
FROM users u
JOIN (VALUES
  ('alice.johnson@example.com',   'Honeycomb Crunch',      'Vanilla ice cream with honeycomb toffee pieces and a drizzle of raw honey.', 'approved', 47, 20),
  ('bob.williams@example.com',    'Espresso Brownie Swirl','Dark espresso ice cream with warm brownie chunks folded in.',               'pending',  12, 5),
  ('carol.martinez@example.com',  'Rose Lychee Sorbet',    'Delicate rose water and fresh lychee sorbet — dairy-free and floral.',       'approved', 89, 35),
  ('david.chen@example.com',      'Ube Purple Yam',        'Filipino ube yam ice cream — naturally purple, sweet, and earthy.',          'on_menu',  156,60),
  ('frank.rodriguez@example.com', 'Bourbon Caramel Pecan', 'Caramel ice cream with bourbon notes and candied pecans.',                  'approved', 203,90)
) AS fs(email, name, description, status, vote_count, days_ago) ON u.email = fs.email
WHERE NOT EXISTS (SELECT 1 FROM flavor_submissions LIMIT 1);
