import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  count?: number;
}

export const PromotionValidation = () => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validatePromotionReadiness();
  }, []);

  const validatePromotionReadiness = async () => {
    try {
      const validationIssues: ValidationIssue[] = [];

      // Check if academic year exists
      const { data: academicYears } = await supabase
        .from('academic_years')
        .select('id')
        .eq('is_current', true);

      if (!academicYears || academicYears.length === 0) {
        validationIssues.push({
          type: 'error',
          message: 'No current academic year set. Please set a current academic year before promoting students.',
        });
      }

      // Check for students without course assignments
      const { count: studentsWithoutCourse } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .is('course_id', null)
        .eq('status', 'active');

      if (studentsWithoutCourse && studentsWithoutCourse > 0) {
        validationIssues.push({
          type: 'warning',
          message: `${studentsWithoutCourse} active students are not assigned to any course.`,
          count: studentsWithoutCourse,
        });
      }

      // Check for students without attendance records
      const { data: studentsWithoutAttendance } = await supabase
        .from('students')
        .select('id')
        .eq('status', 'active');

      if (studentsWithoutAttendance) {
        const studentIds = studentsWithoutAttendance.map(s => s.id);
        const { data: attendanceRecords } = await supabase
          .from('attendance_records')
          .select('student_id')
          .in('student_id', studentIds);

        const studentsWithAttendance = new Set(attendanceRecords?.map(r => r.student_id) || []);
        const missingCount = studentIds.filter(id => !studentsWithAttendance.has(id)).length;

        if (missingCount > 0) {
          validationIssues.push({
            type: 'warning',
            message: `${missingCount} students have no attendance records.`,
            count: missingCount,
          });
        }
      }

      // Check for pending fee structures
      const { count: unpublishedFeeStructures } = await supabase
        .from('fee_structures')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', false);

      if (unpublishedFeeStructures && unpublishedFeeStructures > 0) {
        validationIssues.push({
          type: 'info',
          message: `${unpublishedFeeStructures} fee structures are not published yet.`,
          count: unpublishedFeeStructures,
        });
      }

      // Check for ongoing promotions
      const { count: ongoingPromotions } = await supabase
        .from('promotion_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'running');

      if (ongoingPromotions && ongoingPromotions > 0) {
        validationIssues.push({
          type: 'warning',
          message: `${ongoingPromotions} promotion job(s) are currently in progress.`,
          count: ongoingPromotions,
        });
      }

      setIssues(validationIssues);
    } catch (error) {
      console.error('Validation error:', error);
      setIssues([{
        type: 'error',
        message: 'Failed to validate promotion readiness. Please refresh the page.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Validating system readiness...</div>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>All Clear!</AlertTitle>
        <AlertDescription>
          System is ready for student promotion. No validation issues found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          System Validation
          <Badge variant="secondary">{issues.length} issue(s) found</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue, index) => (
          <Alert
            key={index}
            variant={issue.type === 'error' ? 'destructive' : 'default'}
          >
            {issue.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            {issue.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            {issue.type === 'info' && <Info className="h-4 w-4" />}
            <AlertTitle>
              {issue.type === 'error' ? 'Error' : issue.type === 'warning' ? 'Warning' : 'Info'}
            </AlertTitle>
            <AlertDescription>{issue.message}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
