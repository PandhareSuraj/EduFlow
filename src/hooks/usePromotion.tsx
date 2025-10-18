import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePromotion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotionJobs, isLoading } = useQuery({
    queryKey: ['promotion-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotion_jobs')
        .select(`
          *,
          academic_years(year_code)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const initiatePromotion = useMutation({
    mutationFn: async (params: {
      academic_year_id: string;
      course_ids?: number[];
      year?: number;
      semester?: number;
      criteria?: {
        min_attendance_percentage?: number;
        min_marks_percentage?: number;
        check_fee_payment?: boolean;
      };
      dry_run?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('initiate-promotion', {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promotion-jobs'] });
      toast({
        title: 'Success',
        description: data.message,
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

  const processPromotion = useMutation({
    mutationFn: async (job_id: string) => {
      const { data, error } = await supabase.functions.invoke('process-promotion', {
        body: { job_id },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promotion-jobs'] });
      toast({
        title: 'Success',
        description: `Promotion completed: ${data.results.promoted} students promoted`,
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

  const rollbackPromotion = useMutation({
    mutationFn: async (job_id: string) => {
      const { data, error } = await supabase.functions.invoke('rollback-promotion', {
        body: { job_id },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promotion-jobs'] });
      toast({
        title: 'Success',
        description: data.message,
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
    promotionJobs,
    isLoading,
    initiatePromotion: initiatePromotion.mutate,
    processPromotion: processPromotion.mutate,
    rollbackPromotion: rollbackPromotion.mutate,
    isInitiating: initiatePromotion.isPending,
    isProcessing: processPromotion.isPending,
    isRollingBack: rollbackPromotion.isPending,
  };
};
