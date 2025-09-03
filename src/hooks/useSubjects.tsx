import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  course_id: number;
  college_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch subjects",
          variant: "destructive",
        });
        return;
      }

      setSubjects((data as Subject[]) || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      setCourses((data as Course[]) || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const addSubject = async (subjectData: {
    name: string;
    code: string;
    description?: string;
    credits?: number;
    course_id: number;
  }) => {
    try {
      // The college_id will be auto-populated by the database trigger
      const { data, error } = await supabase
        .from('subjects')
        .insert([subjectData])
        .select()
        .single();

      if (error) {
        console.error('Error adding subject:', error);
        let errorMessage = "Failed to add subject";
        
        // Provide more specific error messages
        if (error.code === '42501') {
          errorMessage = "You don't have permission to add subjects";
        } else if (error.code === '23505') {
          errorMessage = "A subject with this code already exists";
        } else if (error.message?.includes('RLS')) {
          errorMessage = "Access denied - check your permissions";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      setSubjects(prev => [...prev, data as Subject]);
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to add subject. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subject:', error);
        toast({
          title: "Error",
          description: "Failed to update subject",
          variant: "destructive",
        });
        return false;
      }

      setSubjects(prev => 
        prev.map(subject => subject.id === id ? (data as Subject) : subject)
      );
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subject:', error);
        toast({
          title: "Error",
          description: "Failed to delete subject",
          variant: "destructive",
        });
        return false;
      }

      setSubjects(prev => prev.filter(subject => subject.id !== id));
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
  }, []);

  return {
    subjects,
    courses,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    refetch: fetchSubjects,
  };
}