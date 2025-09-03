import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReportFilters {
  reportType?: string;
  courseId?: string | 'all';
  dateRange?: {
    from: Date;
    to: Date;
  };
  semester?: number;
  status?: string;
}

export interface ReportData {
  students: any[];
  courses: any[];
  fees: any[];
  attendance: any[];
  exams: any[];
  faculty: any[];
  enquiries: any[];
}

export const useReportData = () => {
  const [data, setData] = useState<ReportData>({
    students: [],
    courses: [],
    fees: [],
    attendance: [],
    exams: [],
    faculty: [],
    enquiries: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async (filters: ReportFilters = {}) => {
    setLoading(true);
    try {
      const promises = [];

      // Fetch students data
      let studentsQuery = supabase
        .from('students')
        .select(`
          *,
          courses!students_course_id_fkey(name, code),
          student_fees!student_fees_student_id_fkey(status, balance_amount, total_amount, paid_amount)
        `);

      if (filters.courseId && filters.courseId !== 'all') {
        studentsQuery = studentsQuery.eq('course_id', parseInt(filters.courseId));
      }

      promises.push(studentsQuery);

      // Fetch courses data
      promises.push(
        supabase.from('courses').select('*').eq('status', 'active')
      );

      // Fetch fees data
      let feesQuery = supabase
        .from('fee_payments')
        .select(`
          *,
          students!fee_payments_student_id_fkey(name, student_id),
          student_fees!fee_payments_student_fee_id_fkey(total_amount)
        `);

      if (filters.dateRange) {
        feesQuery = feesQuery
          .gte('payment_date', filters.dateRange.from.toISOString().split('T')[0])
          .lte('payment_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      promises.push(feesQuery);

      // Fetch attendance data
      let attendanceQuery = supabase
        .from('attendance_sessions')
        .select(`
          *,
          courses!attendance_sessions_course_id_fkey(name, code)
        `);

      if (filters.dateRange) {
        attendanceQuery = attendanceQuery
          .gte('session_date', filters.dateRange.from.toISOString().split('T')[0])
          .lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      promises.push(attendanceQuery);

      // Fetch exams data
      let examsQuery = supabase
        .from('exams')
        .select(`
          *,
          courses!exams_course_id_fkey(name, code),
          results!results_exam_id_fkey(
            student_id,
            marks_obtained,
            total_marks,
            percentage,
            grade,
            students!results_student_id_fkey(name, student_id)
          )
        `);

      if (filters.dateRange) {
        examsQuery = examsQuery
          .gte('exam_date', filters.dateRange.from.toISOString().split('T')[0])
          .lte('exam_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      promises.push(examsQuery);

      // Fetch faculty data
      promises.push(
        supabase.from('faculty').select('*').eq('status', 'active')
      );

      // Fetch enquiries data
      let enquiriesQuery = supabase.from('enquiries').select('*');

      if (filters.dateRange) {
        enquiriesQuery = enquiriesQuery
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString());
      }

      promises.push(enquiriesQuery);

      const results = await Promise.all(promises);

      setData({
        students: results[0].data || [],
        courses: results[1].data || [],
        fees: results[2].data || [],
        attendance: results[3].data || [],
        exams: results[4].data || [],
        faculty: results[5].data || [],
        enquiries: results[6].data || []
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    fetchData,
    refreshData: () => fetchData()
  };
};