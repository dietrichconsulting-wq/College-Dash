-- Parent/Guardian Account Feature Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─── 1. Add missing columns to profiles ─────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS link_code text UNIQUE;

-- Subscription columns (fix pre-existing gap between code and schema)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end timestamptz;

-- ─── 2. Parent links junction table ─────────────────────────
CREATE TABLE IF NOT EXISTS parent_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  linked_at   timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_links(student_id);

ALTER TABLE parent_links ENABLE ROW LEVEL SECURITY;

-- ─── 3. Digest log (prevent duplicate weekly sends) ─────────
CREATE TABLE IF NOT EXISTS digest_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_key    text NOT NULL,
  sent_at     timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id, week_key)
);

CREATE INDEX IF NOT EXISTS idx_digest_log_parent ON digest_log(parent_id);

ALTER TABLE digest_log ENABLE ROW LEVEL SECURITY;

-- ─── 4. Generate link codes for existing student profiles ───
UPDATE profiles SET link_code = substr(md5(random()::text), 1, 6)
  WHERE account_type = 'student' AND link_code IS NULL;

-- ─── 5. Digest unsubscribe flag ──────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS digest_unsubscribed boolean NOT NULL DEFAULT false;
