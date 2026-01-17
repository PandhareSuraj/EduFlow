import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAMCPlans, AMCPlan, CreatePlanData } from '@/hooks/useAMCPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Users, 
  GraduationCap, 
  Check, 
  Star,
  Infinity,
  IndianRupee
} from 'lucide-react';

const AVAILABLE_FEATURES = [
  { id: 'students', label: 'Student Management', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty Management', icon: Users },
  { id: 'courses', label: 'Course Management', icon: CreditCard },
  { id: 'attendance', label: 'Attendance Tracking', icon: Check },
  { id: 'fees', label: 'Fee Management', icon: IndianRupee },
  { id: 'exams', label: 'Exam Management', icon: Check },
  { id: 'library', label: 'Library System', icon: Check },
  { id: 'reports', label: 'Reports & Analytics', icon: Check },
  { id: 'hostel', label: 'Hostel Management', icon: Check },
  { id: 'transport', label: 'Transport Management', icon: Check },
  { id: 'placements', label: 'Placement Cell', icon: Check },
  { id: 'events', label: 'Event Management', icon: Check },
  { id: 'api_access', label: 'API Access', icon: Check },
  { id: 'priority_support', label: 'Priority Support', icon: Star },
  { id: 'custom_branding', label: 'Custom Branding', icon: Check },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AMCPlans() {
  const { userRole } = useAuth();
  const { plans, loading, createPlan, updatePlan, deletePlan, togglePlanStatus } = useAMCPlans();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AMCPlan | null>(null);
  const [formData, setFormData] = useState<CreatePlanData>({
    name: '',
    description: '',
    base_fee: 0,
    per_student_fee: 0,
    per_user_fee: 0,
    max_students: null,
    max_users: null,
    features: [],
    billing_cycle: 'annual',
    discount_percentage: 0,
    is_active: true,
    sort_order: 0,
  });

  if (userRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only super admins can access AMC plans.</p>
        </div>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      base_fee: 0,
      per_student_fee: 0,
      per_user_fee: 0,
      max_students: null,
      max_users: null,
      features: [],
      billing_cycle: 'annual',
      discount_percentage: 0,
      is_active: true,
      sort_order: plans.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: AMCPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      base_fee: plan.base_fee,
      per_student_fee: plan.per_student_fee,
      per_user_fee: plan.per_user_fee,
      max_students: plan.max_students,
      max_users: plan.max_users,
      features: plan.features || [],
      billing_cycle: plan.billing_cycle,
      discount_percentage: plan.discount_percentage,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      await updatePlan(editingPlan.id, formData);
    } else {
      await createPlan(formData);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }
    await deletePlan(planId);
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...(prev.features || []), featureId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AMC Plans</h1>
          <p className="text-muted-foreground">Manage subscription tiers and pricing</p>
        </div>
        
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col ${
              index === 2 ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
            } ${!plan.is_active ? 'opacity-60' : ''}`}
          >
            {index === 2 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="flex justify-between items-start">
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(plan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl mt-2">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="text-center flex-grow">
              <div className="mb-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.base_fee)}</span>
                <span className="text-muted-foreground">/{plan.billing_cycle}</span>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <p className="flex items-center justify-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(plan.per_student_fee)}/student
                </p>
                <p className="flex items-center justify-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(plan.per_user_fee)}/user
                </p>
              </div>

              <div className="space-y-1 text-sm mb-4">
                <p className="flex items-center justify-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {plan.max_students ? `Up to ${plan.max_students} students` : (
                    <span className="flex items-center gap-1">
                      <Infinity className="h-4 w-4" /> Unlimited students
                    </span>
                  )}
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  {plan.max_users ? `Up to ${plan.max_users} users` : (
                    <span className="flex items-center gap-1">
                      <Infinity className="h-4 w-4" /> Unlimited users
                    </span>
                  )}
                </p>
              </div>

              {plan.discount_percentage > 0 && (
                <Badge variant="secondary" className="mb-4">
                  {plan.discount_percentage}% Discount
                </Badge>
              )}
              
              <div className="border-t pt-4">
                <p className="font-medium mb-2 text-sm">Included Features:</p>
                <ul className="space-y-1 text-left">
                  {(plan.features || []).slice(0, 6).map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                  {(plan.features || []).length > 6 && (
                    <li className="text-xs text-muted-foreground">
                      +{(plan.features || []).length - 6} more features
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => togglePlanStatus(plan.id, !plan.is_active)}
              >
                {plan.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No plans found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first AMC plan to start managing subscriptions.
          </p>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Plan
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update the plan details below.' : 'Configure a new subscription plan for colleges.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <Select
                    value={formData.billing_cycle}
                    onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the plan..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_fee">Base Fee (₹)</Label>
                  <Input
                    id="base_fee"
                    type="number"
                    min="0"
                    value={formData.base_fee}
                    onChange={(e) => setFormData({ ...formData, base_fee: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="per_student_fee">Per Student (₹)</Label>
                  <Input
                    id="per_student_fee"
                    type="number"
                    min="0"
                    value={formData.per_student_fee}
                    onChange={(e) => setFormData({ ...formData, per_student_fee: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="per_user_fee">Per User (₹)</Label>
                  <Input
                    id="per_user_fee"
                    type="number"
                    min="0"
                    value={formData.per_user_fee}
                    onChange={(e) => setFormData({ ...formData, per_user_fee: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_students">Max Students</Label>
                  <Input
                    id="max_students"
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    value={formData.max_students ?? ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      max_students: e.target.value ? Number(e.target.value) : null 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_users">Max Users</Label>
                  <Input
                    id="max_users"
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    value={formData.max_users ?? ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      max_users: e.target.value ? Number(e.target.value) : null 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Discount %</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Included Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-lg bg-muted/30">
                  {AVAILABLE_FEATURES.map(feature => (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        formData.features?.includes(feature.id) 
                          ? 'bg-primary/10 border border-primary' 
                          : 'bg-background border hover:bg-muted'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <Check className={`h-4 w-4 ${
                        formData.features?.includes(feature.id) ? 'text-primary' : 'text-transparent'
                      }`} />
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Enable this plan for new subscriptions</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
