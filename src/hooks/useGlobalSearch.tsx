import { useState, useEffect, useMemo, useCallback } from 'react';
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

  const searchDatabase = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const searchPattern = `%${term}%`;
      const searchResults: SearchResult[] = [];

      // Get user's college ID first
      const { data: userCollegeId } = await supabase.rpc('get_user_college');
      
      if (!userCollegeId) {
        console.error('No college ID found for user');
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Search students with college filtering
      const studentsQuery = supabase
        .from('students')
        .select('id, name, email, student_id, course_id, mobile_number')
        .or(`name.ilike.${searchPattern},student_id.ilike.${searchPattern},email.ilike.${searchPattern},mobile_number.ilike.${searchPattern}`)
        .eq('college_id', userCollegeId)
        .limit(5);

      // Search courses with college filtering
      const coursesQuery = supabase
        .from('courses')
        .select('id, name, code')
        .or(`name.ilike.${searchPattern},code.ilike.${searchPattern}`)
        .eq('college_id', userCollegeId)
        .limit(5);

      // Search faculty (only for admin/teacher roles) with college filtering
      let facultyQuery = null;
      if (userRole && ['admin', 'teacher', 'super_admin'].includes(userRole)) {
        facultyQuery = supabase
          .from('faculty')
          .select('id, name, email, department')
          .or(`name.ilike.${searchPattern},email.ilike.${searchPattern},department.ilike.${searchPattern}`)
          .eq('college_id', userCollegeId)
          .limit(5);
      }

      // Execute queries in parallel
      const [studentsResponse, coursesResponse, facultyResponse] = await Promise.all([
        studentsQuery,
        coursesQuery,
        facultyQuery
      ]);

      // Process students
      if (studentsResponse?.data && !studentsResponse.error) {
        studentsResponse.data.forEach((student: any) => {
          searchResults.push({
            id: student.id.toString(),
            type: 'student',
            title: student.name,
            subtitle: `ID: ${student.student_id}${student.mobile_number ? ` • ${student.mobile_number}` : ''}`,
            route: `/students?search=${student.student_id}`
          });
        });
      } else if (studentsResponse?.error) {
        console.error('Students search error:', studentsResponse.error);
      }

      // Process courses
      if (coursesResponse?.data && !coursesResponse.error) {
        coursesResponse.data.forEach((course: any) => {
          searchResults.push({
            id: course.id.toString(),
            type: 'course',
            title: course.name,
            subtitle: `Code: ${course.code}`,
            route: `/courses?highlight=${course.id}`
          });
        });
      } else if (coursesResponse?.error) {
        console.error('Courses search error:', coursesResponse.error);
      }

      // Process faculty
      if (facultyResponse?.data && !facultyResponse.error) {
        facultyResponse.data.forEach((faculty: any) => {
          searchResults.push({
            id: faculty.id,
            type: 'faculty',
            title: faculty.name,
            subtitle: `${faculty.department} • ${faculty.email}`,
            route: `/faculty?highlight=${faculty.id}`
          });
        });
      } else if (facultyResponse?.error) {
        console.error('Faculty search error:', facultyResponse.error);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  const debouncedSearch = useMemo(
    () => debounce(searchDatabase, 300),
    [searchDatabase]
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