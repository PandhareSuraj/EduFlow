import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CurrentFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
}

export function useCurrentFaculty() {
  const [currentFaculty, setCurrentFaculty] = useState<CurrentFaculty | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrentFaculty = async () => {
      if (!user) {
        setCurrentFaculty(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('id, name, email, designation, department')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;
        setCurrentFaculty(data);
      } catch (error) {
        console.error('Error fetching current faculty:', error);
        setCurrentFaculty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentFaculty();
  }, [user]);

  return { currentFaculty, loading };
}