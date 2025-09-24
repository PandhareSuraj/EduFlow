import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useClassNames() {
  const [classNames, setClassNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      
      // Get class names from attendance_sessions
      const { data: sessionClasses, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('class_name')
        .eq('college_id', collegeId)
        .not('class_name', 'is', null)
        .not('class_name', 'eq', '');

      if (sessionError) throw sessionError;

      // Get class names from students
      const { data: studentClasses, error: studentError } = await supabase
        .from('students')
        .select('class')
        .eq('college_id', collegeId)
        .not('class', 'is', null)
        .not('class', 'eq', '');

      if (studentError) throw studentError;

      // Combine and deduplicate class names
      const allClassNames = [
        ...(sessionClasses?.map(s => s.class_name) || []),
        ...(studentClasses?.map(s => s.class) || [])
      ];

      const uniqueClassNames = [...new Set(allClassNames)]
        .filter(Boolean)
        .sort();

      setClassNames(uniqueClassNames);
    } catch (error) {
      console.error('Error fetching class names:', error);
      setClassNames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassNames();
  }, []);

  return { classNames, loading, refetch: fetchClassNames };
}