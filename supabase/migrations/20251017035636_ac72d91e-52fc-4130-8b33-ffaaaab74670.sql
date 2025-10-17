-- Create tutorial videos table for storing page-specific tutorial video links
CREATE TABLE public.tutorial_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_identifier text NOT NULL UNIQUE,
  page_title text NOT NULL,
  video_url text NOT NULL,
  video_id text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  CONSTRAINT valid_youtube_url CHECK (video_url ~* '^https://(www\.)?youtube\.com/watch\?v=|^https://youtu\.be/')
);

-- Enable RLS
ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all videos
CREATE POLICY "Super admin full access" ON public.tutorial_videos
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- All authenticated users can view active videos
CREATE POLICY "Users can view active videos" ON public.tutorial_videos
  FOR SELECT USING (
    is_active = true AND (
      college_id IS NULL OR 
      college_id = get_user_college()
    )
  );

-- Indexes for performance
CREATE INDEX idx_tutorial_videos_page ON public.tutorial_videos(page_identifier);
CREATE INDEX idx_tutorial_videos_college ON public.tutorial_videos(college_id);
CREATE INDEX idx_tutorial_videos_active ON public.tutorial_videos(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_tutorial_videos_updated_at
  BEFORE UPDATE ON public.tutorial_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();