import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  FileText,
  Users,
  PieChart,
  Eye
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { useNavigate } from "react-router-dom";

interface AuditorStats {
  totalRevenue: number;
  totalPending: number;
  collectionRate: number;
  totalStudents: number;
  overdueCount: number;
  partialPayments: number;
}

interface RecentTransaction {
  id: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

export function AuditorDashboard() {
  const [stats, setStats] = useState<AuditorStats>({
    totalRevenue: 0,
    totalPending: 0,
    collectionRate: 0,
    totalStudents: 0,
    overdueCount: 0,
    partialPayments: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuditorData();
  }, []);

  const fetchAuditorData = async () => {
    try {
      setLoading(true);

      // Fetch fee summary data
      const { data: feeData, error: feeError } = await supabase
        .from('student_fee_summary')
        .select('*');

      if (feeError) throw feeError;

      // Calculate statistics
      const totalRevenue = feeData?.reduce((sum, r) => sum + (r.paid_amount || 0), 0) || 0;
      const totalPending = feeData?.reduce((sum, r) => sum + (r.balance_amount || 0), 0) || 0;
      const totalAmount = feeData?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
      const collectionRate = totalAmount > 0 ? (totalRevenue / totalAmount) * 100 : 0;
      const overdueCount = feeData?.filter(r => r.fee_status === 'overdue').length || 0;
      const partialPayments = feeData?.filter(r => r.fee_status === 'partial').length || 0;

      setStats({
        totalRevenue,
        totalPending,
        collectionRate,
        totalStudents: feeData?.length || 0,
        overdueCount,
        partialPayments
      });

      // Fetch recent payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('fee_payments')
        .select(`
          id,
          amount,
          payment_method,
          payment_date,
          student_fees!inner(
            students!inner(name)
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;

      const transactions: RecentTransaction[] = (paymentsData || []).map(p => ({
        id: p.id,
        studentName: (p.student_fees as any)?.students?.name || 'Unknown',
        amount: p.amount,
        paymentMethod: p.payment_method,
        paymentDate: p.payment_date,
        status: 'completed'
      }));

      setRecentTransactions(transactions);

    } catch (error: any) {
      console.error('Error fetching auditor data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'upi': return 'bg-blue-100 text-blue-800';
      case 'card': return 'bg-purple-100 text-purple-800';
      case 'bank_transfer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Financial overview and transaction monitoring (View Only)
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          View Only Access
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Collections"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
        />
        <StatsCard
          title="Pending Fees"
          value={`₹${stats.totalPending.toLocaleString('en-IN')}`}
          icon={Clock}
        />
        <StatsCard
          title="Collection Rate"
          value={`${stats.collectionRate.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Overdue Accounts"
          value={stats.overdueCount.toString()}
          icon={AlertTriangle}
        />
      </div>

      {/* Financial Summary & Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>Overview of fee collection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Students with Fees</span>
                <span className="font-medium">{stats.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Partial Payments</span>
                <Badge variant="secondary">{stats.partialPayments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overdue Accounts</span>
                <Badge variant="destructive">{stats.overdueCount}</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Collection Progress</span>
                <span className="text-sm text-muted-foreground">{stats.collectionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/reports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Detailed Reports
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest payment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent transactions
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.paymentDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{transaction.amount.toLocaleString('en-IN')}</p>
                      <Badge className={getPaymentMethodColor(transaction.paymentMethod)} variant="secondary">
                        {transaction.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => navigate('/fees')}
            >
              View All Fee Records
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Navigate to key financial sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/fees')}>
              <DollarSign className="mr-2 h-4 w-4" />
              Fee Records
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/students')}>
              <Users className="mr-2 h-4 w-4" />
              Student Records
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/reports')}>
              <FileText className="mr-2 h-4 w-4" />
              Financial Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
