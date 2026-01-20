-- Add theme_config column to colleges table
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
  "preset": "professional_blue",
  "primary_color": "#2563EB",
  "secondary_color": "#0891B2",
  "accent_color": "#F59E0B",
  "sidebar_background": "#F1F5F9",
  "sidebar_text": "#1E293B"
}'::jsonb;

-- Create theme_presets table for Super Admin managed presets
CREATE TABLE IF NOT EXISTS theme_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  sidebar_background TEXT NOT NULL,
  sidebar_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on theme_presets
ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Everyone can read active presets
CREATE POLICY "Anyone can view active theme presets"
  ON theme_presets
  FOR SELECT
  USING (is_active = true);

-- Only super_admin can manage presets
CREATE POLICY "Super admin can manage theme presets"
  ON theme_presets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Insert default theme presets
INSERT INTO theme_presets (name, code, primary_color, secondary_color, accent_color, sidebar_background, sidebar_text, is_default, sort_order) VALUES
  ('Modern Purple', 'modern_purple', '#8B5CF6', '#3B82F6', '#F59E0B', '#F5F3FF', '#4C1D95', false, 1),
  ('Professional Blue', 'professional_blue', '#2563EB', '#0891B2', '#F59E0B', '#F1F5F9', '#1E293B', true, 2),
  ('Warm Orange', 'warm_orange', '#EA580C', '#DC2626', '#FACC15', '#FFF7ED', '#7C2D12', false, 3),
  ('Forest Green', 'forest_green', '#16A34A', '#15803D', '#FDE047', '#F0FDF4', '#14532D', false, 4),
  ('Elegant Gray', 'elegant_gray', '#374151', '#4B5563', '#6B7280', '#F9FAFB', '#111827', false, 5),
  ('Vibrant Pink', 'vibrant_pink', '#DB2777', '#9333EA', '#06B6D4', '#FDF2F8', '#831843', false, 6),
  ('Ocean Teal', 'ocean_teal', '#0D9488', '#0891B2', '#F472B6', '#F0FDFA', '#134E4A', false, 7)
ON CONFLICT (code) DO NOTHING;