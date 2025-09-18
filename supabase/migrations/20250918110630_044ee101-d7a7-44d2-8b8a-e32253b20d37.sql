-- Add college-specific Google OAuth credentials to google_drive_settings table
ALTER TABLE public.google_drive_settings 
ADD COLUMN google_client_id_encrypted text,
ADD COLUMN google_client_secret_encrypted text,
ADD COLUMN oauth_setup_completed boolean DEFAULT false;

-- Update existing records to mark them as not having OAuth setup completed
UPDATE public.google_drive_settings 
SET oauth_setup_completed = false 
WHERE oauth_setup_completed IS NULL;