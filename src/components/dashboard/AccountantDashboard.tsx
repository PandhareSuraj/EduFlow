import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  IndianRupee, 
  CreditCard, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Calendar,
  FileText,
  DollarSign,
  PieChart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";

interface AccountantStats {
  monthlyRevenue: string;
  pendingFees: number;
  paidFees: number;
  totalCollections: string;
  defaulterStudents: number;
  collectionRate: number;
}

interface RecentTransaction {
  id: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: string;
}

interface FeeAlert {
  id: string;
  type: 'overdue' | 'due_soon' | 'defaulter';
  title: string;
  description: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export function AccountantDashboard() {
  const [stats, setStats] = useState<AccountantStats>({
    monthlyRevenue: "₹0",
    pendingFees: 0,
    paidFees: 0,
    totalCollections: "₹0",
    defaulterStudents: 0,
    collectionRate: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [feeAlerts, setFeeAlerts] = useState<FeeAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountantData();
  }, []);

  const fetchAccountantData = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Fetch fee-related data
      const [
        monthlyPaymentsResult,
        pendingFeesResult,
        paidFeesResult,
        totalCollectionsResult,
        recentPaymentsResult,
        overdueFeesResult
      ] = await Promise.all([
        // Monthly revenue
        supabase.from('fee_payments')
          .select('amount')
          .gte('payment_date', firstDayOfMonth.toISOString().split('T')[0])
          .lte('payment_date', lastDayOfMonth.toISOString().split('T')[0]),
        
        // Pending fees count
        supabase.from('student_fees')
          .select('id', { count: 'exact' })
          .in('status', ['pending', 'partial']),
        
        // Paid fees count
        supabase.from('student_fees')
          .select('id', { count: 'exact' })
          .eq('status', 'paid'),
        
        // Total collections (all time)
        supabase.from('fee_payments')
          .select('amount'),
        
        // Recent transactions
        supabase.from('fee_payments')
          .select(`
            id,
            amount,
            payment_method,
            payment_date,
            students!student_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Overdue fees
        supabase.from('student_fees')
          .select('due_date, student_id')
          .in('status', ['pending', 'partial'])
          .lt('due_date', new Date().toISOString().split('T')[0])
      ]);

      // Calculate stats
      const monthlyRevenue = monthlyPaymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const totalCollections = totalCollectionsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      const pendingCount = pendingFeesResult.count || 0;
      const paidCount = paidFeesResult.count || 0;
      const totalFees = pendingCount + paidCount;
      const collectionRate = totalFees > 0 ? Math.round((paidCount / totalFees) * 100) : 0;

      // Process recent transactions
      const transactions: RecentTransaction[] = (recentPaymentsResult.data || []).map(payment => ({
        id: payment.id,
        studentName: payment.students?.name || 'Unknown',
        amount: payment.amount || 0,
        paymentMethod: payment.payment_method || 'cash',
        date: new Date(payment.payment_date).toLocaleDateString(),
        status: 'completed'
      }));

      // Generate fee alerts
      const alerts: FeeAlert[] = [];
      
      const overdueCount = overdueFeesResult.data?.length || 0;
      if (overdueCount > 0) {
        alerts.push({
          id: 'overdue-fees',
          type: 'overdue',
          title: 'Overdue Fee Payments',
          description: `${overdueCount} students have overdue payments`,
          count: overdueCount,
          severity: 'high'
        });
      }

      // Check for fees due in next 7 days
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: dueSoonFees } = await supabase
        .from('student_fees')
        .select('id')
        .in('status', ['pending', 'partial'])
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0]);

      const dueSoonCount = dueSoonFees?.length || 0;
      if (dueSoonCount > 0) {
        alerts.push({
          id: 'due-soon',
          type: 'due_soon',
          title: 'Fees Due Soon',
          description: `${dueSoonCount} payments due in next 7 days`,
          count: dueSoonCount,
          severity: 'medium'
        });
      }

      if (collectionRate < 70) {
        alerts.push({
          id: 'low-collection',
          type: 'defaulter',
          title: 'Low Collection Rate',
          description: `Collection rate is ${collectionRate}%`,
          count: 1,
          severity: 'high'
        });
      }

      setStats({
        monthlyRevenue: `₹${monthlyRevenue.toLocaleString()}`,
        pendingFees: pendingCount,
        paidFees: paidCount,
        totalCollections: `₹${totalCollections.toLocaleString()}`,
        defaulterStudents: overdueCount,
        collectionRate
      });

      setRecentTransactions(transactions);
      setFeeAlerts(alerts);

    } catch (error) {
      console.error('Error fetching accountant dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'card': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'upi': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'bank_transfer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleAlertClick = (alert: FeeAlert) => {
    switch (alert.type) {
      case 'overdue':
      case 'due_soon':
      case 'defaulter':
        window.location.href = '/fees';
        break;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-header rounded-lg p-4 sm:p-6 text-white shadow-header">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
          Financial Management Dashboard
        </h1>
        <p className="text-white/90 text-sm sm:text-base">
          Monitor fee collections, payments, and financial analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monthly Revenue"
          value={loading ? "..." : stats.monthlyRevenue}
          icon={IndianRupee}
          trend={{ value: 15, isPositive: true }}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
        />
        <StatsCard
          title="Collection Rate"
          value={loading ? "..." : `${stats.collectionRate}%`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          className={stats.collectionRate >= 80 ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900" : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"}
        />
        <StatsCard
          title="Pending Fees"
          value={loading ? "..." : stats.pendingFees.toString()}
          icon={CreditCard}
          trend={{ value: -5, isPositive: false }}
          className={stats.pendingFees > 0 ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900" : ""}
        />
        <StatsCard
          title="Defaulter Students"
          value={loading ? "..." : stats.defaulterStudents.toString()}
          icon={Users}
          trend={{ value: -12, isPositive: false }}
          className={stats.defaulterStudents > 0 ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900" : ""}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <QuickActions userRole="accountant" className="lg:col-span-1" />
        
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent transactions</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{transaction.studentName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                        {transaction.paymentMethod.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{transaction.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-success">₹{transaction.amount.toLocaleString()}</p>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Alerts and Analytics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Fee Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Fee Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feeAlerts.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">All fees are up to date!</p>
              </div>
            ) : (
              feeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${getSeverityColor(alert.severity)}`}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge variant="secondary">{alert.count}</Badge>
                  </div>
                  <p className="text-sm opacity-90">{alert.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Collections</span>
                <span className="text-lg font-bold text-success">{stats.totalCollections}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Paid Fees</span>
                <span className="text-sm text-muted-foreground">{stats.paidFees} records</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Fees</span>
                <span className="text-sm text-muted-foreground">{stats.pendingFees} records</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.collectionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Collection Rate</span>
                <span className="font-medium">{stats.collectionRate}%</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/reports'}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Financial Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}