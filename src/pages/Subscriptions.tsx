import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAMCPlans, AMCPlan } from '@/hooks/useAMCPlans';
import { useCollegeSubscriptions, CollegeWithStats, AssignPlanData } from '@/hooks/useCollegeSubscriptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, addYears, differenceInDays } from 'date-fns';
import { 
  Building2, 
  Calendar, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  IndianRupee
} from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Subscriptions() {
  const { userRole } = useAuth();
  const { plans, loading: plansLoading, calculatePlanCost } = useAMCPlans();
  const { 
    collegesWithStats, 
    loading: subsLoading, 
    assignPlan, 
    renewSubscription,
    getExpiringSubscriptions,
    getOverdueSubscriptions
  } = useCollegeSubscriptions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<CollegeWithStats | null>(null);
  const [assignFormData, setAssignFormData] = useState<Partial<AssignPlanData>>({
    plan_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    auto_renew: true,
    discount_percentage: 0,
  });
  const [renewFormData, setRenewFormData] = useState({
    new_end_date: '',
    amount: 0,
    payment_reference: '',
    notes: '',
  });

  const loading = plansLoading || subsLoading;

  const expiringThisMonth = useMemo(() => getExpiringSubscriptions(30), [collegesWithStats]);
  const overdueSubscriptions = useMemo(() => getOverdueSubscriptions(), [collegesWithStats]);

  const filteredColleges = useMemo(() => {
    return collegesWithStats.filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           college.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active') return matchesSearch && college.subscription?.status === 'active';
      if (statusFilter === 'expired') return matchesSearch && college.subscription?.status === 'expired';
      if (statusFilter === 'trial') return matchesSearch && college.subscription_status === 'trial';
      if (statusFilter === 'no_subscription') return matchesSearch && !college.subscription;
      
      return matchesSearch;
    });
  }, [collegesWithStats, searchQuery, statusFilter]);

  const getStatusBadge = (college: CollegeWithStats) => {
    if (!college.subscription) {
      return <Badge variant="outline">No Subscription</Badge>;
    }
    
    const endDate = new Date(college.subscription.end_date);
    const today = new Date();
    const daysRemaining = differenceInDays(endDate, today);
    
    if (daysRemaining < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysRemaining <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const handleOpenAssign = (college: CollegeWithStats) => {
    setSelectedCollege(college);
    if (college.subscription) {
      setAssignFormData({
        plan_id: college.subscription.plan_id || '',
        start_date: college.subscription.start_date,
        end_date: college.subscription.end_date,
        auto_renew: college.subscription.auto_renew,
        discount_percentage: college.subscription.discount_percentage,
        discount_reason: college.subscription.discount_reason || '',
        custom_base_fee: college.subscription.custom_base_fee,
        custom_per_student: college.subscription.custom_per_student,
        custom_per_user: college.subscription.custom_per_user,
        notes: college.subscription.notes || '',
      });
    } else {
      setAssignFormData({
        plan_id: plans[0]?.id || '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
        auto_renew: true,
        discount_percentage: 0,
      });
    }
    setIsAssignDialogOpen(true);
  };

  const handleOpenRenew = (college: CollegeWithStats) => {
    if (!college.subscription) return;
    
    setSelectedCollege(college);
    const currentEndDate = new Date(college.subscription.end_date);
    const newEndDate = addYears(currentEndDate, 1);
    
    const plan = plans.find(p => p.id === college.subscription?.plan_id);
    const estimatedCost = plan ? calculatePlanCost(plan, college.student_count, college.user_count) : 0;
    
    setRenewFormData({
      new_end_date: format(newEndDate, 'yyyy-MM-dd'),
      amount: estimatedCost,
      payment_reference: '',
      notes: '',
    });
    setIsRenewDialogOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege || !assignFormData.plan_id) return;
    
    await assignPlan({
      college_id: selectedCollege.id,
      plan_id: assignFormData.plan_id,
      start_date: assignFormData.start_date!,
      end_date: assignFormData.end_date!,
      auto_renew: assignFormData.auto_renew,
      custom_base_fee: assignFormData.custom_base_fee,
      custom_per_student: assignFormData.custom_per_student,
      custom_per_user: assignFormData.custom_per_user,
      discount_percentage: assignFormData.discount_percentage,
      discount_reason: assignFormData.discount_reason,
      notes: assignFormData.notes,
    });
    
    setIsAssignDialogOpen(false);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege?.subscription) return;
    
    await renewSubscription(selectedCollege.subscription.id, renewFormData.new_end_date, {
      amount: renewFormData.amount,
      payment_reference: renewFormData.payment_reference,
      notes: renewFormData.notes,
    });
    
    setIsRenewDialogOpen(false);
  };

  const selectedPlan = useMemo(() => {
    return plans.find(p => p.id === assignFormData.plan_id);
  }, [plans, assignFormData.plan_id]);

  const estimatedCost = useMemo(() => {
    if (!selectedPlan || !selectedCollege) return 0;
    return calculatePlanCost(selectedPlan, selectedCollege.student_count, selectedCollege.user_count);
  }, [selectedPlan, selectedCollege, calculatePlanCost]);

  if (userRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only super admins can access subscriptions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage college subscriptions and renewals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collegesWithStats.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collegesWithStats.filter(c => c.subscription?.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring This Month</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{expiringThisMonth.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueSubscriptions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">All Colleges</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="no_subscription">No Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map(college => {
                    const plan = plans.find(p => p.id === college.subscription?.plan_id);
                    return (
                      <TableRow key={college.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{college.name}</p>
                            <p className="text-sm text-muted-foreground">{college.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {plan?.name || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>{college.student_count}</TableCell>
                        <TableCell>{college.user_count}</TableCell>
                        <TableCell>
                          {college.subscription?.end_date 
                            ? format(new Date(college.subscription.end_date), 'dd MMM yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(college)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenAssign(college)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              {college.subscription ? 'Edit' : 'Assign'}
                            </Button>
                            {college.subscription && (
                              <Button 
                                size="sm"
                                onClick={() => handleOpenRenew(college)}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Renew
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredColleges.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No colleges found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions Expiring Within 30 Days</CardTitle>
              <CardDescription>These colleges need renewal attention</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringThisMonth.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subscriptions expiring soon.</p>
              ) : (
                <div className="space-y-4">
                  {expiringThisMonth.map(college => {
                    const daysLeft = differenceInDays(
                      new Date(college.subscription!.end_date), 
                      new Date()
                    );
                    return (
                      <div key={college.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{college.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Expires in {daysLeft} days ({format(new Date(college.subscription!.end_date), 'dd MMM yyyy')})
                          </p>
                        </div>
                        <Button onClick={() => handleOpenRenew(college)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew Now
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Subscriptions</CardTitle>
              <CardDescription>These subscriptions have expired and need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueSubscriptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No overdue subscriptions.</p>
              ) : (
                <div className="space-y-4">
                  {overdueSubscriptions.map(college => {
                    const daysOverdue = Math.abs(differenceInDays(
                      new Date(college.subscription!.end_date), 
                      new Date()
                    ));
                    return (
                      <div key={college.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50/50 rounded-lg">
                        <div>
                          <p className="font-medium">{college.name}</p>
                          <p className="text-sm text-red-600">
                            Expired {daysOverdue} days ago ({format(new Date(college.subscription!.end_date), 'dd MMM yyyy')})
                          </p>
                        </div>
                        <Button variant="destructive" onClick={() => handleOpenRenew(college)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew Urgently
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign/Edit Subscription Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCollege?.subscription ? 'Edit Subscription' : 'Assign Subscription'}
            </DialogTitle>
            <DialogDescription>
              {selectedCollege?.name} - {selectedCollege?.student_count} students, {selectedCollege?.user_count} users
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAssignSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Select Plan</Label>
                <Select
                  value={assignFormData.plan_id}
                  onValueChange={(value) => setAssignFormData({ ...assignFormData, plan_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.filter(p => p.is_active).map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.base_fee)}/{plan.billing_cycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={assignFormData.start_date}
                    onChange={(e) => setAssignFormData({ ...assignFormData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={assignFormData.end_date}
                    onChange={(e) => setAssignFormData({ ...assignFormData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={assignFormData.discount_percentage || 0}
                    onChange={(e) => setAssignFormData({ 
                      ...assignFormData, 
                      discount_percentage: Number(e.target.value) 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Reason</Label>
                  <Input
                    value={assignFormData.discount_reason || ''}
                    onChange={(e) => setAssignFormData({ 
                      ...assignFormData, 
                      discount_reason: e.target.value 
                    })}
                    placeholder="Early bird, bulk, etc."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div>
                  <Label>Auto Renew</Label>
                  <p className="text-sm text-muted-foreground">Automatically renew subscription</p>
                </div>
                <Switch
                  checked={assignFormData.auto_renew}
                  onCheckedChange={(checked) => setAssignFormData({ ...assignFormData, auto_renew: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={assignFormData.notes || ''}
                  onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              {selectedPlan && (
                <div className="p-4 border rounded-lg bg-primary/5">
                  <p className="text-sm font-medium mb-2">Estimated Cost</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(estimatedCost * (1 - (assignFormData.discount_percentage || 0) / 100))}
                  </p>
                  {assignFormData.discount_percentage && assignFormData.discount_percentage > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(estimatedCost)}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedCollege?.subscription ? 'Update Subscription' : 'Assign Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Renew Subscription Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>
              {selectedCollege?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRenewSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>New End Date</Label>
                <Input
                  type="date"
                  value={renewFormData.new_end_date}
                  onChange={(e) => setRenewFormData({ ...renewFormData, new_end_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Amount (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={renewFormData.amount}
                  onChange={(e) => setRenewFormData({ ...renewFormData, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Reference</Label>
                <Input
                  value={renewFormData.payment_reference}
                  onChange={(e) => setRenewFormData({ ...renewFormData, payment_reference: e.target.value })}
                  placeholder="Transaction ID, cheque number, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={renewFormData.notes}
                  onChange={(e) => setRenewFormData({ ...renewFormData, notes: e.target.value })}
                  placeholder="Renewal notes..."
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenewDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <RefreshCw className="h-4 w-4 mr-2" />
                Confirm Renewal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
