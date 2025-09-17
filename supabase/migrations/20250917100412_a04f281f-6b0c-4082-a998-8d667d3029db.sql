-- Create SMS configuration table for API settings
CREATE TABLE public.sms_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  api_key_name text NOT NULL DEFAULT 'SMS_GATEWAY_API_KEY',
  sender_id text NOT NULL DEFAULT 'TESTIN',
  channel integer NOT NULL DEFAULT 2,
  dcs integer NOT NULL DEFAULT 0,
  flash_sms integer NOT NULL DEFAULT 0,
  route text NOT NULL DEFAULT 'clickhere',
  entity_id text,
  dlt_template_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS for SMS configurations
ALTER TABLE public.sms_configurations ENABLE ROW LEVEL SECURITY;

-- SMS configurations policies (super admin only)
CREATE POLICY "Super admins can manage SMS configurations" 
ON public.sms_configurations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create OTP verification table
CREATE TABLE public.otp_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  college_id uuid REFERENCES public.colleges(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for OTP verifications
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- OTP verifications policies
CREATE POLICY "Users can manage OTP verifications" 
ON public.otp_verifications 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add phone_verified field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_verifications 
  WHERE expires_at < now() OR created_at < now() - INTERVAL '1 hour';
END;
$$;

-- Create trigger for automatic updated_at on SMS configurations
CREATE TRIGGER update_sms_configurations_updated_at
  BEFORE UPDATE ON public.sms_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SMS configuration
INSERT INTO public.sms_configurations (
  sender_id,
  channel,
  dcs,
  flash_sms,
  route,
  entity_id,
  dlt_template_id
) VALUES (
  'TESTIN',
  2,
  0,
  0,
  'clickhere',
  'Registered-Entity-Id',
  'Registered-DLT-Template-Id'
) ON CONFLICT DO NOTHING;