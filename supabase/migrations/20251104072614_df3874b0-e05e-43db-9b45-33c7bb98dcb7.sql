-- Create push_subscriptions table for storing user notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  device_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subscription)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Updated at trigger
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();