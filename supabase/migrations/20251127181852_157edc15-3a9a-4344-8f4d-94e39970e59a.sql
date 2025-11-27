-- Add poster_url column to events table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'events' 
                   AND column_name = 'poster_url') THEN
        ALTER TABLE public.events ADD COLUMN poster_url TEXT;
    END IF;
END $$;

-- Create storage policies for event posters
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload event posters'
    ) THEN
        CREATE POLICY "Users can upload event posters"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'college-assets' AND (storage.foldername(name))[1] = 'event-posters');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Anyone can view event posters'
    ) THEN
        CREATE POLICY "Anyone can view event posters"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'college-assets' AND (storage.foldername(name))[1] = 'event-posters');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their event posters'
    ) THEN
        CREATE POLICY "Users can update their event posters"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'college-assets' AND (storage.foldername(name))[1] = 'event-posters');
    END IF;
END $$;