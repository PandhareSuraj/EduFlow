import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAcademicYears = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: academicYears, isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: currentAcademicYear } = useQuery({
    queryKey: ['current-academic-year'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_current', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: activeAcademicYears } = useQuery({
    queryKey: ['active-academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .in('status', ['draft', 'active'])
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createAcademicYear = useMutation({
    mutationFn: async (values: {
      year_code: string;
      start_date: string;
      end_date: string;
      is_current?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert(values)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: 'Success',
        description: 'Academic year created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAcademicYear = useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      const { data, error } = await supabase
        .from('academic_years')
        .update(values)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: 'Success',
        description: 'Academic year updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const setCurrentYear = useMutation({
    mutationFn: async (id: string) => {
      // First, unset all current years
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .neq('id', id);
      
      // Then set the new current year
      const { data, error } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: 'Success',
        description: 'Current academic year updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    academicYears,
    currentAcademicYear,
    activeAcademicYears,
    isLoading,
    createAcademicYear: createAcademicYear.mutate,
    updateAcademicYear: updateAcademicYear.mutate,
    setCurrentYear: setCurrentYear.mutate,
    isCreating: createAcademicYear.isPending,
    isUpdating: updateAcademicYear.isPending,
  };
};
