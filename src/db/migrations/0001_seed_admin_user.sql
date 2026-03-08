-- Seed admin user for ScoopCraft application testing
-- Password: ScoopAdmin2026! (argon2id hash)
-- email_verified_at is set so login is not blocked by email verification gate

INSERT INTO users (
  email,
  password_hash,
  role,
  first_name,
  last_name,
  email_verified_at,
  created_at,
  updated_at
)
VALUES (
  'admin@scoopcraft.com',
  '$argon2id$v=19$m=19456,t=2,p=1$XX36f2/WmSjyfD5ZmXwZvw$wvq0/vrVrNbQn/crXt/uSmTyHcl0ua4JaUx+5J18WXY',
  'admin',
  'Admin',
  'ScoopCraft',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'admin',
  email_verified_at = COALESCE(users.email_verified_at, NOW()),
  updated_at = NOW();
