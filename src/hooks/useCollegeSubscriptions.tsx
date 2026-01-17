import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AMCPlan } from './useAMCPlans';

export interface CollegeSubscription {
  id: string;
  college_id: string;
  plan_id: string | null;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  custom_base_fee: number | null;
  custom_per_student: number | null;
  custom_per_user: number | null;
  discount_percentage: number;
  discount_reason: string | null;
  status: string;
  renewal_reminder_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  college?: {
    id: string;
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    subscription_status: string | null;
  };
  plan?: AMCPlan;
}

export interface CollegeWithStats {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  student_count: number;
  user_count: number;
  subscription?: CollegeSubscription;
}

export interface AssignPlanData {
  college_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  auto_renew?: boolean;
  custom_base_fee?: number | null;
  custom_per_student?: number | null;
  custom_per_user?: number | null;
  discount_percentage?: number;
  discount_reason?: string;
  notes?: string;
}

export function useCollegeSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<CollegeSubscription[]>([]);
  const [collegesWithStats, setCollegesWithStats] = useState<CollegeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'college_subscriptions' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'colleges' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch colleges with subscription info
      const { data: colleges, error: collegesError } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (collegesError) throw collegesError;

      // Fetch subscriptions
      const { data: subs, error: subsError } = await supabase
        .from('college_subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Fetch student counts
      const { data: studentCounts, error: studentsError } = await supabase
        .from('students')
        .select('college_id')
        .not('college_id', 'is', null);

      if (studentsError) throw studentsError;

      // Fetch user counts
      const { data: userCounts, error: usersError } = await supabase
        .from('user_roles')
        .select('college_id')
        .not('college_id', 'is', null);

      if (usersError) throw usersError;

      // Build counts maps
      const studentCountMap = new Map<string, number>();
      (studentCounts || []).forEach(s => {
        const current = studentCountMap.get(s.college_id) || 0;
        studentCountMap.set(s.college_id, current + 1);
      });

      const userCountMap = new Map<string, number>();
      (userCounts || []).forEach(u => {
        const current = userCountMap.get(u.college_id!) || 0;
        userCountMap.set(u.college_id!, current + 1);
      });

      // Build subscription map
      const subscriptionMap = new Map<string, CollegeSubscription>();
      (subs || []).forEach(sub => {
        subscriptionMap.set(sub.college_id, sub as CollegeSubscription);
      });

      // Combine data
      const collegesWithData: CollegeWithStats[] = (colleges || []).map(college => ({
        ...college,
        student_count: studentCountMap.get(college.id) || 0,
        user_count: userCountMap.get(college.id) || 0,
        subscription: subscriptionMap.get(college.id),
      }));

      setCollegesWithStats(collegesWithData);
      setSubscriptions(subs as CollegeSubscription[] || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignPlan = async (data: AssignPlanData) => {
    try {
      // Check if subscription exists
      const existing = subscriptions.find(s => s.college_id === data.college_id);

      if (existing) {
        // Update existing subscription
        const { error } = await supabase
          .from('college_subscriptions')
          .update({
            plan_id: data.plan_id,
            start_date: data.start_date,
            end_date: data.end_date,
            auto_renew: data.auto_renew ?? true,
            custom_base_fee: data.custom_base_fee,
            custom_per_student: data.custom_per_student,
            custom_per_user: data.custom_per_user,
            discount_percentage: data.discount_percentage ?? 0,
            discount_reason: data.discount_reason,
            notes: data.notes,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('college_subscriptions')
          .insert([{
            college_id: data.college_id,
            plan_id: data.plan_id,
            start_date: data.start_date,
            end_date: data.end_date,
            auto_renew: data.auto_renew ?? true,
            custom_base_fee: data.custom_base_fee,
            custom_per_student: data.custom_per_student,
            custom_per_user: data.custom_per_user,
            discount_percentage: data.discount_percentage ?? 0,
            discount_reason: data.discount_reason,
            notes: data.notes,
            status: 'active',
          }]);

        if (error) throw error;
      }

      // Update college subscription status
      const { error: collegeError } = await supabase
        .from('colleges')
        .update({ subscription_status: 'active' })
        .eq('id', data.college_id);

      if (collegeError) throw collegeError;

      toast({
        title: "Success",
        description: "Subscription assigned successfully",
      });

      fetchData();
      return true;
    } catch (error) {
      console.error('Error assigning plan:', error);
      toast({
        title: "Error",
        description: "Failed to assign subscription",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSubscription = async (subscriptionId: string, updates: Partial<CollegeSubscription>) => {
    try {
      const { error } = await supabase
        .from('college_subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
      return false;
    }
  };

  const renewSubscription = async (subscriptionId: string, newEndDate: string, paymentInfo?: {
    amount: number;
    payment_reference?: string;
    notes?: string;
  }) => {
    try {
      const subscription = subscriptions.find(s => s.id === subscriptionId);
      if (!subscription) throw new Error('Subscription not found');

      // Update subscription
      const { error: subError } = await supabase
        .from('college_subscriptions')
        .update({
          end_date: newEndDate,
          status: 'active',
          renewal_reminder_sent: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (subError) throw subError;

      // Record renewal history
      const { error: historyError } = await supabase
        .from('subscription_renewals')
        .insert([{
          subscription_id: subscriptionId,
          college_id: subscription.college_id,
          previous_plan_id: subscription.plan_id,
          new_plan_id: subscription.plan_id,
          previous_end_date: subscription.end_date,
          new_end_date: newEndDate,
          amount_paid: paymentInfo?.amount,
          renewal_type: 'manual',
          payment_reference: paymentInfo?.payment_reference,
          notes: paymentInfo?.notes,
        }]);

      if (historyError) throw historyError;

      toast({
        title: "Success",
        description: "Subscription renewed successfully",
      });

      fetchData();
      return true;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to renew subscription",
        variant: "destructive",
      });
      return false;
    }
  };

  const getExpiringSubscriptions = (days: number): CollegeWithStats[] => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return collegesWithStats.filter(college => {
      if (!college.subscription) return false;
      const endDate = new Date(college.subscription.end_date);
      return endDate <= futureDate && college.subscription.status === 'active';
    });
  };

  const getOverdueSubscriptions = (): CollegeWithStats[] => {
    const today = new Date();
    
    return collegesWithStats.filter(college => {
      if (!college.subscription) return false;
      const endDate = new Date(college.subscription.end_date);
      return endDate < today && college.subscription.status === 'active';
    });
  };

  return {
    subscriptions,
    collegesWithStats,
    loading,
    fetchData,
    assignPlan,
    updateSubscription,
    renewSubscription,
    getExpiringSubscriptions,
    getOverdueSubscriptions,
  };
}
