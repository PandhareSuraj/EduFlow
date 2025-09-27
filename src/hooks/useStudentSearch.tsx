import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const COURSES_REL_HINT = "students_course_id_fkey";

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
    const raw = term ?? "";
    const safe = raw.replace(/[,;]/g, " ").replace(/[^\x20-\x7E]/g, "").trim();

    // Minimum length to avoid noise
    if (safe.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const like = `%${safe}%`;
      const orFilter = [
        `student_id.ilike.${like}`,
        `name.ilike.${like}`,
        `email.ilike.${like}`,
        `mobile_number.ilike.${like}`,
      ].join(",");

      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          student_id,
          name,
          email,
          mobile_number,
          year,
          semester,
          status,
          courses!${COURSES_REL_HINT}(name)
        `)
        .or(orFilter)
        .eq("status", "active")
        .order("student_id")
        .limit(50);

      if (error) throw error;

      const formattedResults: StudentSearchResult[] =
        data?.map((student: any) => ({
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          mobile_number: student.mobile_number,
          course_name: student.courses?.name || "N/A",
          year: student.year,
          semester: student.semester,
          status: student.status,
        })) || [];

      // Sort results by relevance against safe term
      const termLower = safe.toLowerCase();
      const sortedResults = formattedResults.sort((a, b) => {
        if (a.student_id.toLowerCase() === termLower) return -1;
        if (b.student_id.toLowerCase() === termLower) return 1;
        if (a.student_id.toLowerCase().startsWith(termLower)) return -1;
        if (b.student_id.toLowerCase().startsWith(termLower)) return 1;
        if (a.name.toLowerCase().startsWith(termLower)) return -1;
        if (b.name.toLowerCase().startsWith(termLower)) return 1;
        return 0;
      });

      setResults(sortedResults);
    } catch (supError: any) {
      console.error("Student search failed:", supError);
      // Show toast only for real network/service errors
      const msg = String(supError?.message || "");
      const code = String(supError?.code || "");
      const isParsingOrEmbedding =
        code.startsWith("PGRST") ||
        msg.includes("parse logic tree") ||
        msg.includes("Could not embed");

      if (!isParsingOrEmbedding) {
        toast({
          title: "Search Error",
          description: "Failed to search students. Please try again.",
          variant: "destructive",
        });
      }
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