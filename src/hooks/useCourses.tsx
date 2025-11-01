import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  name: string;
  code: string;
  status: string;
  fee_structures?: {
    id: string;
    semester: number;
    total_fee: number;
    registration_fee: number;
    tuition_fee: number;
    lab_fee: number;
    library_fee: number;
    other_fees: number;
    due_date: string | null;
  }[];
}

export function useCourses() {
  const { toast } = useToast();

  const { data: courses = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      // Get user's college with better error handling
      const { data: collegeId, error: collegeError } = await supabase.rpc('get_user_college');
      
      // Don't fail completely if college lookup fails - just proceed without filtering
      const shouldFilterByCollege = !collegeError && collegeId;
      
      // Fetch courses
      let coursesQuery = supabase
        .from('courses')
        .select('id, name, code, status')
        .eq('status', 'active')
        .order('name');

      if (shouldFilterByCollege) {
        coursesQuery = coursesQuery.eq('college_id', collegeId);
      }

      const { data: courseRows, error: coursesError } = await coursesQuery;
      if (coursesError) throw coursesError;

      // Fetch fee structures for courses
      const courseIds = (courseRows || []).map((c: any) => c.id);
      let feeStructuresMap: Record<number, any[]> = {};

      if (courseIds.length > 0) {
        let feeQuery = supabase
          .from('fee_structures')
          .select('*')
          .in('course_id', courseIds);

        if (shouldFilterByCollege) {
          feeQuery = feeQuery.eq('college_id', collegeId);
        }

        const { data: feeRows, error: feeError } = await feeQuery;
        if (!feeError && feeRows) {
          feeRows.forEach((fee: any) => {
            if (!feeStructuresMap[fee.course_id]) {
              feeStructuresMap[fee.course_id] = [];
            }
            feeStructuresMap[fee.course_id].push(fee);
          });
        }
      }

      const coursesData = (courseRows || []).map((course: any) => ({
        ...course,
        fee_structures: feeStructuresMap[course.id] || [],
      }));

      return coursesData;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000
  });

  // Show error toast when there's an error
  if (courses === undefined && !loading) {
    toast({
      title: "Error",
      description: "Failed to fetch courses. Please refresh the page.",
      variant: "destructive"
    });
  }

  return { courses, loading, refetch };
}