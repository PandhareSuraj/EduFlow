-- Allow admins to update their own college so template selection works
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'Admins can update their college'
  ) THEN
    CREATE POLICY "Admins can update their college"
    ON public.colleges
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role) AND id = get_user_college())
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND id = get_user_college());
  END IF;
END $$;