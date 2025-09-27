import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentSearchResult {
  id: number;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  course_name: string;
  year: number;
  semester: number;
  status: string;
}

export const useStudentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSelections, setRecentSelections] = useState<StudentSearchResult[]>([]);
  const { toast } = useToast();

  const searchStudents = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          name,
          email,
          mobile_number,
          year,
          semester,
          status,
          courses(name)
        `)
        .or(`student_id.ilike.%${term}%,name.ilike.%${term}%,email.ilike.%${term}%,mobile_number.ilike.%${term}%`)
        .eq('status', 'active')
        .order('student_id')
        .limit(50);

      if (error) throw error;

      const formattedResults: StudentSearchResult[] = data?.map(student => ({
        id: student.id,
        student_id: student.student_id,
        name: student.name,
        email: student.email,
        mobile_number: student.mobile_number,
        course_name: (student.courses as any)?.name || 'N/A',
        year: student.year,
        semester: student.semester,
        status: student.status
      })) || [];

      // Sort results by relevance
      const sortedResults = formattedResults.sort((a, b) => {
        // Exact student ID match gets highest priority
        if (a.student_id.toLowerCase() === term.toLowerCase()) return -1;
        if (b.student_id.toLowerCase() === term.toLowerCase()) return 1;
        
        // Student ID starts with term
        if (a.student_id.toLowerCase().startsWith(term.toLowerCase())) return -1;
        if (b.student_id.toLowerCase().startsWith(term.toLowerCase())) return 1;
        
        // Name starts with term
        if (a.name.toLowerCase().startsWith(term.toLowerCase())) return -1;
        if (b.name.toLowerCase().startsWith(term.toLowerCase())) return 1;
        
        return 0;
      });

      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStudents(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchStudents]);

  const addToRecentSelections = useCallback((student: StudentSearchResult) => {
    setRecentSelections(prev => {
      const filtered = prev.filter(s => s.id !== student.id);
      return [student, ...filtered].slice(0, 5); // Keep only 5 recent
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    recentSelections,
    addToRecentSelections,
    clearSearch
  };
};