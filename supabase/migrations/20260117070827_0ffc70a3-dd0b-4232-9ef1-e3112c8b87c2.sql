-- AMC Plans (Flexible subscription tiers)
CREATE TABLE IF NOT EXISTS amc_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_fee NUMERIC NOT NULL DEFAULT 0,
  per_student_fee NUMERIC NOT NULL DEFAULT 0,
  per_user_fee NUMERIC NOT NULL DEFAULT 0,
  max_students INTEGER,
  max_users INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  billing_cycle TEXT DEFAULT 'annual',
  discount_percentage NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- College Subscriptions (Link colleges to plans)
CREATE TABLE IF NOT EXISTS college_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES amc_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  custom_base_fee NUMERIC,
  custom_per_student NUMERIC,
  custom_per_user NUMERIC,
  discount_percentage NUMERIC DEFAULT 0,
  discount_reason TEXT,
  status TEXT DEFAULT 'active',
  renewal_reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(college_id)
);

-- Subscription Renewals History
CREATE TABLE IF NOT EXISTS subscription_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES college_subscriptions(id) ON DELETE SET NULL,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  previous_plan_id UUID REFERENCES amc_plans(id),
  new_plan_id UUID REFERENCES amc_plans(id),
  previous_end_date DATE,
  new_end_date DATE,
  amount_paid NUMERIC,
  renewal_type TEXT DEFAULT 'manual',
  payment_reference TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add subscription columns to colleges table
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS trial_ends_at DATE;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE amc_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_renewals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for amc_plans (super_admin only for write, read for all authenticated)
CREATE POLICY "Anyone can view active AMC plans"
ON amc_plans FOR SELECT
USING (is_active = true OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Super admins can manage AMC plans"
ON amc_plans FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
));

-- RLS Policies for college_subscriptions
CREATE POLICY "Super admins can manage all subscriptions"
ON college_subscriptions FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "College admins can view their subscription"
ON college_subscriptions FOR SELECT
USING (college_id IN (
  SELECT ur.college_id FROM user_roles ur WHERE ur.user_id = auth.uid()
));

-- RLS Policies for subscription_renewals
CREATE POLICY "Super admins can manage all renewals"
ON subscription_renewals FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "College admins can view their renewals"
ON subscription_renewals FOR SELECT
USING (college_id IN (
  SELECT ur.college_id FROM user_roles ur WHERE ur.user_id = auth.uid()
));

-- Insert default AMC plans
INSERT INTO amc_plans (name, description, base_fee, per_student_fee, per_user_fee, max_students, max_users, features, billing_cycle, sort_order) VALUES
('Starter', 'Perfect for small institutions getting started', 10000, 50, 200, 200, 10, '["students", "faculty", "courses", "attendance", "fees"]', 'annual', 1),
('Standard', 'Ideal for growing colleges with moderate needs', 25000, 75, 400, 500, 25, '["students", "faculty", "courses", "attendance", "fees", "exams", "library", "reports"]', 'annual', 2),
('Premium', 'Complete solution for established institutions', 50000, 100, 500, 1000, 50, '["students", "faculty", "courses", "attendance", "fees", "exams", "library", "reports", "hostel", "transport", "placements", "events"]', 'annual', 3),
('Enterprise', 'Unlimited access with custom features and support', 100000, 80, 400, NULL, NULL, '["students", "faculty", "courses", "attendance", "fees", "exams", "library", "reports", "hostel", "transport", "placements", "events", "api_access", "priority_support", "custom_branding"]', 'annual', 4)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_college_id ON college_subscriptions(college_id);
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_plan_id ON college_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_status ON college_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_end_date ON college_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_college_id ON subscription_renewals(college_id);
CREATE INDEX IF NOT EXISTS idx_amc_plans_is_active ON amc_plans(is_active);