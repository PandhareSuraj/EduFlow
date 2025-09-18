-- Create Google Drive settings table for college-specific configurations
CREATE TABLE public.google_drive_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  drive_email TEXT NOT NULL,
  drive_folder_id TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  quota_used BIGINT DEFAULT 0,
  quota_limit BIGINT DEFAULT 16106127360, -- 15GB in bytes
  drive_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(college_id)
);

-- Enable RLS
ALTER TABLE public.google_drive_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view drive settings from their college" 
ON public.google_drive_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Admins can manage drive settings from their college" 
ON public.google_drive_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((college_id = get_user_college()) AND has_role(auth.uid(), 'admin'::app_role)))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR ((college_id = get_user_college()) AND has_role(auth.uid(), 'admin'::app_role)));

-- Add trigger for updated_at
CREATE TRIGGER update_google_drive_settings_updated_at
BEFORE UPDATE ON public.google_drive_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for audit fields
CREATE TRIGGER handle_google_drive_settings_audit
BEFORE INSERT OR UPDATE ON public.google_drive_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_audit_fields();

-- Add storage_type column to student_documents table
ALTER TABLE public.student_documents 
ADD COLUMN storage_type TEXT DEFAULT 'supabase' CHECK (storage_type IN ('supabase', 'google_drive')),
ADD COLUMN google_drive_file_id TEXT;

-- Create index for better performance
CREATE INDEX idx_student_documents_storage_type ON public.student_documents(storage_type);
CREATE INDEX idx_student_documents_google_drive_file_id ON public.student_documents(google_drive_file_id);