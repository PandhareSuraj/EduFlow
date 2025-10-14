-- Add API key and dev mode columns to SMS configurations
ALTER TABLE public.sms_configurations 
  ADD COLUMN IF NOT EXISTS api_key_encrypted text,
  ADD COLUMN IF NOT EXISTS dev_mode boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.sms_configurations.api_key_encrypted IS 'Encrypted SMS provider API key stored in database';
COMMENT ON COLUMN public.sms_configurations.dev_mode IS 'When true, bypasses SMS provider and returns dev_otp';