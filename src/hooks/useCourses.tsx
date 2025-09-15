import { useState, useEffect } from "react";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Get user's college
      const { data: collegeId, error: collegeError } = await supabase.rpc('get_user_college');
      if (collegeError) {
        throw new Error('Unable to fetch user college information');
      }

      // Fetch courses
      let coursesQuery = supabase
        .from('courses')
        .select('id, name, code, status')
        .eq('status', 'active')
        .order('name');

      if (collegeId) {
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

        if (collegeId) {
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

      setCourses(coursesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, loading, refetch: fetchCourses };
}