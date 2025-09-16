-- Create ID card templates table
CREATE TABLE public.id_card_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add columns to colleges table for ID card settings
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS id_card_template_id uuid REFERENCES public.id_card_templates(id);
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS signature_url text;
ALTER TABLE public.colleges ADD COLUMN IF NOT EXISTS signature_title text DEFAULT 'Authorized Signature';

-- Create college assets storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('college-assets', 'college-assets', true);

-- Create storage policies for college assets
CREATE POLICY "College assets are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'college-assets');

CREATE POLICY "Admins can upload college assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'college-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update college assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'college-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete college assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'college-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for id_card_templates
ALTER TABLE public.id_card_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" 
ON public.id_card_templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.id_card_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default ID card templates
INSERT INTO public.id_card_templates (name, code, description, config) VALUES
('Classic Corporate', 'classic_corporate', 'Clean corporate design with professional blue theme', 
 '{"layout": "standard", "colorScheme": "blue", "features": ["photo", "qr", "signature"]}'),
('Modern Minimal', 'modern_minimal', 'Minimalist design with clean typography', 
 '{"layout": "minimal", "colorScheme": "gradient", "features": ["photo", "qr", "signature"]}'),
('Academic Traditional', 'academic_traditional', 'Traditional university-style with formal borders', 
 '{"layout": "formal", "colorScheme": "navy", "features": ["photo", "crest", "signature"]}'),
('Contemporary Card', 'contemporary_card', 'Modern card with rounded corners and dynamic colors', 
 '{"layout": "modern", "colorScheme": "dynamic", "features": ["photo", "qr", "signature"]}'),
('Professional Badge', 'professional_badge', 'Badge-style design with security focus', 
 '{"layout": "badge", "colorScheme": "security", "features": ["photo", "barcode", "signature"]}');

-- Add photo_url column to students table if it doesn't exist
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url text;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_id_card_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_id_card_templates_updated_at
BEFORE UPDATE ON public.id_card_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_id_card_templates_updated_at();