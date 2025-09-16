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
  searchTerm?: string;
  department?: string;
  year?: number;
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
      if (filters.status && filters.status !== 'all') {
        studentsQuery = studentsQuery.eq('status', filters.status);
      }
      if (filters.semester) {
        studentsQuery = studentsQuery.eq('semester', filters.semester);
      }
      if (filters.year) {
        studentsQuery = studentsQuery.eq('year', filters.year);
      }
      if (filters.searchTerm) {
        studentsQuery = studentsQuery.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,student_id.ilike.%${filters.searchTerm}%`);
      }

      promises.push(studentsQuery);

      // Fetch courses data
      promises.push(
        supabase.from('courses').select('*').eq('status', 'active')
      );

      // Fetch fees data with course filtering
      let feesQuery = supabase
        .from('fee_payments')
        .select(`
          *,
          students!fee_payments_student_id_fkey(name, student_id, course_id),
          student_fees!fee_payments_student_fee_id_fkey(total_amount)
        `);

      if (filters.dateRange) {
        feesQuery = feesQuery
          .gte('payment_date', filters.dateRange.from.toISOString().split('T')[0])
          .lte('payment_date', filters.dateRange.to.toISOString().split('T')[0]);
      }
      if (filters.searchTerm) {
        feesQuery = feesQuery.or(`receipt_number.ilike.%${filters.searchTerm}%,payment_method.ilike.%${filters.searchTerm}%`);
      }

      promises.push(feesQuery);

      // Fetch attendance data with course filtering
      let attendanceQuery = supabase
        .from('attendance_sessions')
        .select(`
          *,
          courses!attendance_sessions_course_id_fkey(name, code)
        `);

      if (filters.courseId && filters.courseId !== 'all') {
        attendanceQuery = attendanceQuery.eq('course_id', parseInt(filters.courseId));
      }
      if (filters.dateRange) {
        attendanceQuery = attendanceQuery
          .gte('session_date', filters.dateRange.from.toISOString().split('T')[0])
          .lte('session_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      promises.push(attendanceQuery);

      // Fetch exams data with course filtering
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

      if (filters.courseId && filters.courseId !== 'all') {
        examsQuery = examsQuery.eq('course_id', parseInt(filters.courseId));
      }
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

      // Fetch enquiries data with course filtering
      let enquiriesQuery = supabase.from('enquiries').select('*');

      if (filters.dateRange) {
        enquiriesQuery = enquiriesQuery
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString());
      }
      if (filters.status && filters.status !== 'all') {
        enquiriesQuery = enquiriesQuery.eq('status', filters.status);
      }
      if (filters.searchTerm) {
        enquiriesQuery = enquiriesQuery.or(`name.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,course.ilike.%${filters.searchTerm}%`);
      }

      promises.push(enquiriesQuery);

      const results = await Promise.all(promises);

      // Apply additional filtering for course-based data
      let filteredFees = results[2].data || [];
      let filteredEnquiries = results[6].data || [];

      if (filters.courseId && filters.courseId !== 'all') {
        // Filter fees by course through student relationship
        filteredFees = filteredFees.filter(fee => 
          fee.students?.course_id === parseInt(filters.courseId)
        );

        // Filter enquiries by course name match
        const courseName = results[1].data?.find(c => c.id === parseInt(filters.courseId))?.name;
        if (courseName) {
          filteredEnquiries = filteredEnquiries.filter(enquiry =>
            enquiry.course?.toLowerCase().includes(courseName.toLowerCase()) ||
            enquiry.course === courseName
          );
        }
      }

      setData({
        students: results[0].data || [],
        courses: results[1].data || [],
        fees: filteredFees,
        attendance: results[3].data || [],
        exams: results[4].data || [],
        faculty: results[5].data || [],
        enquiries: filteredEnquiries
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