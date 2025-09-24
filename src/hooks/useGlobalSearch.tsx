import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { debounce } from 'lodash';

export interface SearchResult {
  id: string;
  type: 'student' | 'course' | 'faculty';
  title: string;
  subtitle: string;
  route: string;
}

export function useGlobalSearch() {
  const { userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchDatabase = async (term: string) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const searchPattern = `%${term}%`;
      const searchResults: SearchResult[] = [];

      // Search students
      const studentsQuery = supabase
        .from('students')
        .select('id, name, email, student_id, course_id, courses(name)')
        .or(`name.ilike.${searchPattern},student_id.ilike.${searchPattern},email.ilike.${searchPattern}`)
        .limit(5);

      // Search courses  
      const coursesQuery = supabase
        .from('courses')
        .select('id, name, code')
        .or(`name.ilike.${searchPattern},code.ilike.${searchPattern}`)
        .limit(5);

      // Search faculty (only for admin/teacher roles)
      let facultyQuery = null;
      if (userRole && ['admin', 'teacher', 'super_admin'].includes(userRole)) {
        facultyQuery = supabase
          .from('faculty')
          .select('id, name, email, department')
          .or(`name.ilike.${searchPattern},email.ilike.${searchPattern},department.ilike.${searchPattern}`)
          .limit(5);
      }

      // Execute queries in parallel
      const [studentsResponse, coursesResponse, facultyResponse] = await Promise.all([
        studentsQuery,
        coursesQuery,
        facultyQuery
      ]);

      // Process students
      if (studentsResponse?.data) {
        studentsResponse.data.forEach((student: any) => {
          searchResults.push({
            id: student.id.toString(),
            type: 'student',
            title: student.name,
            subtitle: `ID: ${student.student_id} • ${student.courses?.name || 'No Course'}`,
            route: `/students?search=${student.student_id}`
          });
        });
      }

      // Process courses
      if (coursesResponse?.data) {
        coursesResponse.data.forEach((course: any) => {
          searchResults.push({
            id: course.id.toString(),
            type: 'course',
            title: course.name,
            subtitle: `Code: ${course.code}`,
            route: `/courses?highlight=${course.id}`
          });
        });
      }

      // Process faculty
      if (facultyResponse?.data) {
        facultyResponse.data.forEach((faculty: any) => {
          searchResults.push({
            id: faculty.id,
            type: 'faculty',
            title: faculty.name,
            subtitle: `${faculty.department} • ${faculty.email}`,
            route: `/faculty?highlight=${faculty.id}`
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(searchDatabase, 300),
    [userRole]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    clearSearch
  };
}