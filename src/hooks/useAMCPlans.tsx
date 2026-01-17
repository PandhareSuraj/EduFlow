import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AMCPlan {
  id: string;
  name: string;
  description: string | null;
  base_fee: number;
  per_student_fee: number;
  per_user_fee: number;
  max_students: number | null;
  max_users: number | null;
  features: string[];
  billing_cycle: string;
  discount_percentage: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  base_fee: number;
  per_student_fee: number;
  per_user_fee: number;
  max_students?: number | null;
  max_users?: number | null;
  features?: string[];
  billing_cycle?: string;
  discount_percentage?: number;
  is_active?: boolean;
  sort_order?: number;
}

export function useAMCPlans() {
  const [plans, setPlans] = useState<AMCPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();

    const channel = supabase
      .channel('amc-plans-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'amc_plans' },
        () => fetchPlans()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('amc_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const typedData = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
      })) as AMCPlan[];

      setPlans(typedData);
    } catch (error) {
      console.error('Error fetching AMC plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AMC plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: CreatePlanData) => {
    try {
      const { data, error } = await supabase
        .from('amc_plans')
        .insert([{
          ...planData,
          features: planData.features || []
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "AMC plan created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating AMC plan:', error);
      toast({
        title: "Error",
        description: "Failed to create AMC plan",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePlan = async (id: string, updates: Partial<CreatePlanData>) => {
    try {
      const { data, error } = await supabase
        .from('amc_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "AMC plan updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating AMC plan:', error);
      toast({
        title: "Error",
        description: "Failed to update AMC plan",
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('amc_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AMC plan deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting AMC plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete AMC plan",
        variant: "destructive",
      });
      return false;
    }
  };

  const togglePlanStatus = async (id: string, isActive: boolean) => {
    return updatePlan(id, { is_active: isActive });
  };

  const calculatePlanCost = (plan: AMCPlan, studentCount: number, userCount: number): number => {
    const baseCost = plan.base_fee + (studentCount * plan.per_student_fee) + (userCount * plan.per_user_fee);
    const discount = (baseCost * plan.discount_percentage) / 100;
    return baseCost - discount;
  };

  return {
    plans,
    loading,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    calculatePlanCost,
  };
}
