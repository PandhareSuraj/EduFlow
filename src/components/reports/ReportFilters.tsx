import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

export interface FilterValues {
  reportType: string;
  courseId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  semester?: number;
  status?: string;
}

interface ReportFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  onGenerate: (format: 'pdf' | 'excel') => void;
  loading?: boolean;
}

export const ReportFilters = ({ onFiltersChange, onGenerate, loading }: ReportFiltersProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    reportType: '',
    courseId: 'all',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    }
  });
  
  const [courses, setCourses] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');
      
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const updateFilter = (key: keyof FilterValues, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const setDateRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (range) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    updateFilter('dateRange', { from, to });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Report Generator
        </CardTitle>
        <CardDescription>Select parameters to generate comprehensive reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={filters.reportType} onValueChange={(value) => updateFilter('reportType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student_enrollment">Student Enrollment</SelectItem>
                <SelectItem value="fees_collection">Fees Collection</SelectItem>
                <SelectItem value="attendance_summary">Attendance Summary</SelectItem>
                <SelectItem value="exam_results">Exam Results</SelectItem>
                <SelectItem value="enquiry_report">Enquiry Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select value={filters.courseId} onValueChange={(value) => updateFilter('courseId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select onValueChange={(value) => value === 'custom' ? setShowDatePicker(true) : setDateRange(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onGenerate('pdf')}
                disabled={loading || !filters.reportType}
              >
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onGenerate('excel')}
                disabled={loading || !filters.reportType}
              >
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {showDatePicker && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => date && updateFilter('dateRange', { ...filters.dateRange, from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => date && updateFilter('dateRange', { ...filters.dateRange, to: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Current Date Range Display */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
          <strong>Current Range:</strong> {format(filters.dateRange.from, "PPP")} to {format(filters.dateRange.to, "PPP")}
        </div>
      </CardContent>
    </Card>
  );
};