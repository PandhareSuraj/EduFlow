import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FinancialStats {
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  monthlyTrend: number;
  defaultersCount: number;
  recentPayments: Array<{
    studentName: string;
    amount: number;
    date: string;
  }>;
}

export function FinancialInsightsWidget() {
  const [stats, setStats] = useState<FinancialStats>({
    totalCollected: 0,
    totalPending: 0,
    collectionRate: 0,
    monthlyTrend: 0,
    defaultersCount: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialStats();
  }, []);

  const fetchFinancialStats = async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all fee data in parallel
      const [
        paymentsThisMonth,
        paymentsLastMonth,
        pendingFees,
        recentPayments
      ] = await Promise.all([
        supabase
          .from('fee_payments')
          .select('amount')
          .gte('payment_date', monthStart.toISOString().split('T')[0]),
        supabase
          .from('fee_payments')
          .select('amount')
          .gte('payment_date', lastMonthStart.toISOString().split('T')[0])
          .lte('payment_date', lastMonthEnd.toISOString().split('T')[0]),
        supabase
          .from('student_fees')
          .select('total_amount, paid_amount, status')
          .in('status', ['pending', 'partial']),
        supabase
          .from('fee_payments')
          .select(`
            amount,
            payment_date,
            students!fee_payments_student_id_fkey(name)
          `)
          .order('payment_date', { ascending: false })
          .limit(5)
      ]);

      // Calculate totals
      const thisMonthTotal = paymentsThisMonth.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const lastMonthTotal = paymentsLastMonth.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const pendingTotal = pendingFees.data?.reduce((sum, f: any) => sum + ((f.total_amount || 0) - (f.paid_amount || 0)), 0) || 0;
      const defaultersCount = pendingFees.data?.length || 0;

      // Calculate collection rate and trend
      const totalExpected = thisMonthTotal + pendingTotal;
      const collectionRate = totalExpected > 0 ? Math.round((thisMonthTotal / totalExpected) * 100) : 0;
      const monthlyTrend = lastMonthTotal > 0 
        ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) 
        : 0;

      // Format recent payments
      const formattedPayments = (recentPayments.data || []).map((payment: any) => ({
        studentName: payment.students?.name || 'Unknown',
        amount: payment.amount,
        date: new Date(payment.payment_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }));

      setStats({
        totalCollected: thisMonthTotal,
        totalPending: pendingTotal,
        collectionRate,
        monthlyTrend,
        defaultersCount,
        recentPayments: formattedPayments
      });
    } catch (error) {
      console.error('Error fetching financial stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <IndianRupee className="mr-2 h-5 w-5" />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="h-4 bg-muted rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <IndianRupee className="mr-2 h-5 w-5 text-emerald-600" />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenue Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              {stats.monthlyTrend !== 0 && (
                <Badge 
                  variant={stats.monthlyTrend > 0 ? "default" : "destructive"} 
                  className="text-xs px-1"
                >
                  {stats.monthlyTrend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(stats.monthlyTrend)}%
                </Badge>
              )}
            </div>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalCollected)}</p>
            <p className="text-xs text-muted-foreground">Collected This Month</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <Badge variant="secondary" className="text-xs px-1">
                {stats.defaultersCount} students
              </Badge>
            </div>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(stats.totalPending)}</p>
            <p className="text-xs text-muted-foreground">Pending Amount</p>
          </div>
        </div>

        {/* Collection Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Collection Rate</span>
            <span className="text-sm font-bold">{stats.collectionRate}%</span>
          </div>
          <Progress 
            value={stats.collectionRate} 
            className="h-2"
          />
        </div>

        {/* Recent Payments */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Recent Payments
          </h4>
          <div className="space-y-2">
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent payments</p>
            ) : (
              stats.recentPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[100px]">{payment.studentName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
