import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Users, Edit, Trash2, RefreshCw, Eye } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface UserRoleData {
  user_id: string;
  role: string;
  college_id: string | null;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  college_id: string | null;
  college_name: string | null;
  created_at: string;
}

interface College {
  id: string;
  name: string;
  code: string;
}

const ROLE_COLORS = {
  'super_admin': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'admin': 'bg-gradient-to-r from-blue-500 to-indigo-500',
  'teacher': 'bg-gradient-to-r from-green-500 to-emerald-500',
  'clerk': 'bg-gradient-to-r from-yellow-500 to-orange-500',
  'librarian': 'bg-gradient-to-r from-teal-500 to-cyan-500',
  'accountant': 'bg-gradient-to-r from-red-500 to-rose-500',
  'assistant': 'bg-gradient-to-r from-gray-500 to-slate-500',
  'student': 'bg-gradient-to-r from-violet-500 to-purple-500',
};

export default function UserManagement() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [users, setUsers] = useState<User[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<string>(searchParams.get('college') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    college_id: ''
  });

  useEffect(() => {
    if (userRole === 'super_admin') {
      fetchData();
    }
  }, [userRole]);

  const fetchData = async () => {
    try {
      // Fetch colleges
      const { data: collegesData, error: collegesError } = await supabase
        .from('colleges')
        .select('id, name, code')
        .order('name');

      if (collegesError) throw collegesError;
      setColleges(collegesData || []);

      // Fetch users with college information
      const { data: usersData, error: usersError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          college_id,
          created_at
        `)
        .order('created_at', { ascending: false }) as { data: UserRoleData[] | null, error: any };

      if (usersError) throw usersError;

      // Get college names separately
      const collegeMap = new Map(collegesData?.map(c => [c.id, c.name]) || []);

      // Get user emails from auth metadata (might not work with admin client limitations)
      let authUsers: any = null;
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (!error) {
          authUsers = data;
        }
      } catch (e) {
        console.log('Auth admin access not available, using fallback');
      }

      // Combine user data
      const combinedUsers: User[] = (usersData || []).map((user: UserRoleData) => {
        const authUser = authUsers?.users?.find((au: any) => au.id === user.user_id);
        return {
          id: user.user_id,
          email: authUser?.email || 'N/A',
          role: user.role,
          college_id: user.college_id,
          college_name: user.college_id ? collegeMap.get(user.college_id) || null : null,
          created_at: user.created_at
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('create-general-user', {
        body: {
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
          college_id: formData.college_id || null
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsDialogOpen(false);
      setFormData({ email: '', password: '', role: '', college_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // First delete from user_roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Filter users based on selected college and search query
  const filteredUsers = users.filter(user => {
    const matchesCollege = selectedCollege === 'all' || user.college_id === selectedCollege;
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.college_name && user.college_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCollege && matchesSearch;
  });

  const getUserStats = () => {
    const stats = {
      total: users.length,
      byRole: {} as Record<string, number>,
      byCollege: {} as Record<string, number>
    };

    users.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      const collegeName = user.college_name || 'No College';
      stats.byCollege[collegeName] = (stats.byCollege[collegeName] || 0) + 1;
    });

    return stats;
  };

  if (userRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only super admins can access user management.</p>
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

  const stats = getUserStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users across all colleges</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with specific role and college assignment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave empty for auto-generated"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="clerk">Clerk</SelectItem>
                        <SelectItem value="librarian">Librarian</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="college">College</Label>
                    <Select value={formData.college_id} onValueChange={(value) => setFormData({ ...formData, college_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name} ({college.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        {Object.entries(stats.byRole).slice(0, 3).map(([role, count]) => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{role}s</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={selectedCollege} onValueChange={setSelectedCollege}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {colleges.map((college) => (
              <SelectItem key={college.id} value={college.id}>
                {college.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-white ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || 'bg-gray-500'}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.college_name || 'No College'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchQuery || selectedCollege !== 'all' 
                        ? 'No users found matching your criteria' 
                        : 'No users found'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}