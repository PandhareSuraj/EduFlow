import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TutorialVideo {
  id: string;
  page_identifier: string;
  page_title: string;
  video_url: string;
  video_id: string;
  description: string | null;
  is_active: boolean;
}

/**
 * Custom hook to fetch tutorial video for a specific page
 * Returns video data, loading state, error, and refetch function
 */
export function useVideoTutorial(pageIdentifier: string) {
  const { data: video, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['tutorial-video', pageIdentifier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorial_videos')
        .select('*')
        .eq('page_identifier', pageIdentifier)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as TutorialVideo | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { video, loading, error, refetch };
}
