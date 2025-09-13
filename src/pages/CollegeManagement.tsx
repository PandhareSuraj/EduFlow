import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Users, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface College {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  status: string;
  created_at: string;
  created_by: string | null;
}

export default function CollegeManagement() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    if (userRole === 'super_admin') {
      fetchColleges();
    }
  }, [userRole]);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('colleges')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "College created successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        website: ''
      });
      fetchColleges();
    } catch (error) {
      console.error('Error creating college:', error);
      toast({
        title: "Error",
        description: "Failed to create college",
        variant: "destructive",
      });
    }
  };

  const deleteCollege = async (collegeId: string) => {
    if (!confirm('Are you sure you want to delete this college? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('id', collegeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "College deleted successfully",
      });

      fetchColleges();
    } catch (error) {
      console.error('Error deleting college:', error);
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive",
      });
    }
  };

  if (userRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only super admins can access college management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">College Management</h1>
          <p className="text-muted-foreground">Manage multiple college instances</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New College
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New College</DialogTitle>
              <DialogDescription>
                Add a new college to the system. Each college will have its own isolated data.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter college name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">College Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Enter unique college code"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter college address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create College</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {colleges.map((college) => (
          <Card key={college.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {college.name}
              </CardTitle>
              <CardDescription>Code: {college.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {college.address && (
                  <p className="text-muted-foreground">📍 {college.address}</p>
                )}
                {college.phone && (
                  <p className="text-muted-foreground">📞 {college.phone}</p>
                )}
                {college.email && (
                  <p className="text-muted-foreground">✉️ {college.email}</p>
                )}
                {college.website && (
                  <p className="text-muted-foreground">
                    🌐 <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {college.website}
                    </a>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(college.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/user-management?college=${college.id}`)}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteCollege(college.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {colleges.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No colleges found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first college instance.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First College
          </Button>
        </div>
      )}
    </div>
  );
}