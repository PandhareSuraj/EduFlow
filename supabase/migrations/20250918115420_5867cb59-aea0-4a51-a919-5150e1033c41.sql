-- Create table for personal Google Drive integration
CREATE TABLE public.personal_google_drive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  drive_folder_id TEXT,
  quota_used BIGINT NOT NULL DEFAULT 0,
  quota_limit BIGINT NOT NULL DEFAULT 16106127360, -- 15GB
  connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_google_drive ENABLE ROW LEVEL SECURITY;

-- Create policies for personal Google Drive
CREATE POLICY "Users can manage their own Google Drive settings"
ON public.personal_google_drive
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create unique constraint on user_id
CREATE UNIQUE INDEX idx_personal_google_drive_user_id 
ON public.personal_google_drive(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_personal_google_drive_updated_at
BEFORE UPDATE ON public.personal_google_drive
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();