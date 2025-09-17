import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAMCConfig } from './useAMCConfig';

interface AMCRevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  outstanding: number;
  totalColleges: number;
  colleges: CollegeAMCData[];
}

interface CollegeAMCData {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  userCount: number;
  calculatedAmount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
  lastPayment?: {
    date: string;
    amount: number;
  };
}

export function useAMCRevenue() {
  const [data, setData] = useState<AMCRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const { calculateAMC, config } = useAMCConfig();

  useEffect(() => {
    fetchAMCRevenue();
  }, [config]);

  const fetchAMCRevenue = async () => {
    try {
      setLoading(true);

      // Fetch all colleges with their student and user counts
      const { data: colleges, error: collegesError } = await supabase
        .from('colleges')
        .select(`
          id,
          name,
          code,
          status
        `);

      if (collegesError) throw collegesError;

      // Fetch student counts per college
      const { data: studentCounts, error: studentsError } = await supabase
        .from('students')
        .select('college_id')
        .eq('status', 'active');

      if (studentsError) throw studentsError;

      // Fetch user counts per college
      const { data: userCounts, error: usersError } = await supabase
        .from('user_roles')
        .select('college_id');

      if (usersError) throw usersError;

      // Fetch AMC payments
      const { data: payments, error: paymentsError } = await supabase
        .from('amc_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Process data
      const studentCountMap = studentCounts.reduce((acc, student) => {
        acc[student.college_id] = (acc[student.college_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const userCountMap = userCounts.reduce((acc, user) => {
        if (user.college_id) {
          acc[user.college_id] = (acc[user.college_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Get latest payment for each college
      const latestPayments = payments.reduce((acc, payment) => {
        if (!acc[payment.college_id] || new Date(payment.payment_date) > new Date(acc[payment.college_id].payment_date)) {
          acc[payment.college_id] = payment;
        }
        return acc;
      }, {} as Record<string, any>);

      const collegeAMCData: CollegeAMCData[] = colleges.map(college => {
        const studentCount = studentCountMap[college.id] || 0;
        const userCount = userCountMap[college.id] || 0;
        const calculatedAmount = calculateAMC(studentCount, userCount);
        const latestPayment = latestPayments[college.id];
        
        // Determine payment status
        let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
        if (latestPayment) {
          const paymentDate = new Date(latestPayment.payment_date);
          const now = new Date();
          const monthsDiff = (now.getFullYear() - paymentDate.getFullYear()) * 12 + (now.getMonth() - paymentDate.getMonth());
          
          if (latestPayment.status === 'completed' && monthsDiff < 12) {
            paymentStatus = 'paid';
          } else if (monthsDiff > 12) {
            paymentStatus = 'overdue';
          }
        }

        return {
          id: college.id,
          name: college.name,
          code: college.code,
          studentCount,
          userCount,
          calculatedAmount,
          paymentStatus,
          dueDate: latestPayment ? new Date(new Date(latestPayment.payment_date).setFullYear(new Date(latestPayment.payment_date).getFullYear() + 1)).toISOString().split('T')[0] : undefined,
          lastPayment: latestPayment ? {
            date: latestPayment.payment_date,
            amount: latestPayment.amount
          } : undefined
        };
      });

      // Calculate totals
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.payment_date);
          return p.status === 'completed' && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const outstanding = collegeAMCData
        .filter(c => c.paymentStatus !== 'paid')
        .reduce((sum, c) => sum + c.calculatedAmount, 0);

      setData({
        totalRevenue,
        monthlyRevenue,
        outstanding,
        totalColleges: colleges.length,
        colleges: collegeAMCData
      });
    } catch (error) {
      console.error('Error fetching AMC revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: fetchAMCRevenue
  };
}