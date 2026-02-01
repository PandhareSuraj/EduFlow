import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Edit, Users, BookOpen, BarChart3, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddCourseDialog } from "@/components/forms/AddCourseDialog";
import { ViewCourseDialog, EditCourseDialog } from "@/components/forms/CourseDialogs";
import { ViewSubjectsDialog } from "@/components/forms/SubjectDialogs";
import { ViewExamsDialog } from "@/components/forms/ExamDialogs";
import { ViewResultsDialog } from "@/components/forms/ResultDialogs";
import { FeeStructureDialog } from "@/components/forms/FeeStructureDialog";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CardGridSkeleton } from "@/components/skeletons";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Course {
  id: number;
  name: string;
  code: string;
  duration_months: number;
  fees_per_semester: number | null;
  status: string;
  description: string | null;
  students?: { count: number }[];
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

export default function Courses() {
  usePageTitle("Courses");
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);

      // 1) Get user's college ID (null for super_admins)
      const { data: collegeId, error: collegeError } = await supabase.rpc('get_user_college');
      if (collegeError) {
        throw new Error('Unable to fetch user college information');
      }

      // 2) Fetch courses (filter by college when available)
      let coursesQuery = supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });

      if (collegeId) {
        coursesQuery = coursesQuery.eq('college_id', collegeId);
      }

      const { data: courseRows, error: coursesError } = await coursesQuery;
      if (coursesError) throw coursesError;

      // 3) Fetch student counts and fee structures separately
      const courseIds = (courseRows || []).map((c: any) => c.id);
      let countsMap: Record<number, number> = {};
      let feeStructuresMap: Record<number, any[]> = {};

      if (courseIds.length > 0) {
        // Fetch student counts
        let studentsQuery = supabase
          .from('students')
          .select('id, course_id')
          .in('course_id', courseIds);

        if (collegeId) {
          studentsQuery = studentsQuery.eq('college_id', collegeId);
        }

        const { data: studentsRows, error: studentsError } = await studentsQuery;
        if (studentsError) {
          console.warn('Warning: failed to fetch student counts', studentsError);
        } else {
          (studentsRows || []).forEach((s: any) => {
            const cid = s.course_id as number | null;
            if (cid != null) countsMap[cid] = (countsMap[cid] || 0) + 1;
          });
        }

        // Fetch fee structures
        let feeQuery = supabase
          .from('fee_structures')
          .select('*')
          .in('course_id', courseIds);

        if (collegeId) {
          feeQuery = feeQuery.eq('college_id', collegeId);
        }

        const { data: feeRows, error: feeError } = await feeQuery;
        if (feeError) {
          console.warn('Warning: failed to fetch fee structures', feeError);
        } else {
          (feeRows || []).forEach((fee: any) => {
            if (!feeStructuresMap[fee.course_id]) {
              feeStructuresMap[fee.course_id] = [];
            }
            feeStructuresMap[fee.course_id].push(fee);
          });
        }
      }

      const coursesData = (courseRows || []).map((course: any) => ({
        ...course,
        students: [{ count: countsMap[course.id] || 0 }],
        fee_structures: feeStructuresMap[course.id] || [],
      }));

      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch courses data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, statusFilter]);

  const statuses = [...new Set(courses.map(course => course.status).filter(status => status && status.trim() !== ""))];

  const formatDuration = (months: number) => {
    if (months < 12) return `${months} Months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} Year${years > 1 ? 's' : ''}`;
    return `${years} Year${years > 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
  };

  const formatFees = (fees: number | null) => {
    if (!fees) return "Not set";
    return `₹${fees.toLocaleString()}`;
  };

  const getTotalFeeFromStructures = (feeStructures: any[] = []) => {
    if (feeStructures.length === 0) return null;
    return feeStructures.reduce((total, structure) => total + (structure.total_fee || 0), 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage college courses and programs</p>
        </div>
        <PermissionWrapper permission="COURSES_CREATE">
          <AddCourseDialog onSuccess={fetchCourses} />
        </PermissionWrapper>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search courses by name, code, or description"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {loading ? (
        <CardGridSkeleton cards={6} columns={3} />
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No courses found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription>{course.code} • {formatDuration(course.duration_months)}</CardDescription>
                  </div>
                  <Badge variant="secondary">{course.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{course.description || "No description available"}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm font-medium">{formatDuration(course.duration_months)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fee Structure:</span>
                    <div className="flex items-center gap-2">
                      {course.fee_structures && course.fee_structures.length > 0 ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Set</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Not Set</span>
                        </>
                      )}
                    </div>
                  </div>
                  {course.fee_structures && course.fee_structures.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Fees:</span>
                      <span className="text-sm font-medium text-primary">
                        {formatFees(getTotalFeeFromStructures(course.fee_structures))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Students:</span>
                    <span className="text-sm font-medium">{course.students?.[0]?.count || 0}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <ViewCourseDialog course={course} />
                    <EditCourseDialog course={course} onSuccess={fetchCourses} />
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Fee Management</p>
                    <div className="flex gap-2 mb-3">
                      {course.fee_structures && course.fee_structures.length > 0 ? (
                        <FeeStructureDialog 
                          trigger={
                            <Button variant="outline" size="sm" className="flex-1">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Edit Fees
                            </Button>
                          }
                          editData={{
                            ...course.fee_structures[0],
                            course_id: course.id
                          }}
                          isEdit={true}
                          onSuccess={fetchCourses}
                        />
                      ) : (
                        <FeeStructureDialog 
                          trigger={
                            <Button variant="outline" size="sm" className="flex-1">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Set Fees
                            </Button>
                          }
                          onSuccess={fetchCourses}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Course Management</p>
                    <div className="grid grid-cols-1 gap-2">
                      <ViewSubjectsDialog course={course} />
                      <ViewExamsDialog course={course} />
                      <ViewResultsDialog course={course} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}