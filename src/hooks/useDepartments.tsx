import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  college_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch departments",
          variant: "destructive",
        });
        return;
      }

      setDepartments((data as Department[]) || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (departmentData: {
    name: string;
    code?: string;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([departmentData])
        .select()
        .single();

      if (error) {
        console.error('Error adding department:', error);
        toast({
          title: "Error",
          description: "Failed to add department",
          variant: "destructive",
        });
        return false;
      }

      setDepartments(prev => [...prev, data as Department]);
      toast({
        title: "Success",
        description: "Department added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "Error",
        description: "Failed to add department",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating department:', error);
        toast({
          title: "Error",
          description: "Failed to update department",
          variant: "destructive",
        });
        return false;
      }

      setDepartments(prev => 
        prev.map(dept => dept.id === id ? (data as Department) : dept)
      );
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      // Soft delete by setting status to inactive
      const { error } = await supabase
        .from('departments')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) {
        console.error('Error deleting department:', error);
        toast({
          title: "Error",
          description: "Failed to delete department",
          variant: "destructive",
        });
        return false;
      }

      setDepartments(prev => prev.filter(dept => dept.id !== id));
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchDepartments,
  };
}