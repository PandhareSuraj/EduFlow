-- Add template and country code columns to SMS configurations
ALTER TABLE public.sms_configurations 
ADD COLUMN IF NOT EXISTS signup_otp_template text DEFAULT 'Welcome to {{APP_NAME}}! Your signup OTP is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share this code.',
ADD COLUMN IF NOT EXISTS login_otp_template text DEFAULT 'Your login OTP for {{APP_NAME}} is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Keep it confidential.',
ADD COLUMN IF NOT EXISTS general_otp_template text DEFAULT 'Your verification code is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share with anyone.',
ADD COLUMN IF NOT EXISTS default_country_code text DEFAULT '+91';