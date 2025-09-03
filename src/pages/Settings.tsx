import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Database as DatabaseIcon, Mail, Globe, Users, Edit, Trash2 } from "lucide-react";
import { DatabaseManagementDialog } from '@/components/database/DatabaseManagementDialog';
import { RoleGuard } from '@/components/permissions/RoleGuard';
import { DepartmentManagement } from '@/components/forms/DepartmentManagement';
import { SubjectManagement } from '@/components/forms/SubjectManagement';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];
type UserWithRole = {
  email: string;
  full_name: string;
  role: AppRole;
  user_id: string;
};

export default function Settings() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users and their roles
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
        toast({
          title: "Error",
          description: "Failed to fetch user roles",
          variant: "destructive",
        });
        return;
      }

      // Then get profiles for those users
      const userIds = userRoles?.map(ur => ur.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return;
      }

      // Combine user roles with profile data
      const usersWithRoles: UserWithRole[] = userRoles.map((userRole) => {
        const profile = profiles?.find(p => p.id === userRole.user_id);
        return {
          user_id: userRole.user_id,
          email: 'Email not available', // We'll show email as not available for now
          full_name: profile?.full_name || 'Unknown',
          role: userRole.role
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating role:', error);
        toast({
          title: "Error",
          description: "Failed to update role",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Role Updated",
        description: "User role has been updated successfully",
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const getRoleDescription = (role: AppRole) => {
    const descriptions = {
      admin: "Full System Access",
      teacher: "Attendance, Study materials, Marks",
      clerk: "Admissions, Fees, Reports",
      librarian: "Book management",
      accountant: "Fees, Salary, Expenses",
      assistant: "Basic access"
    };
    return descriptions[role] || "Unknown permissions";
  };

  const getRoleStats = () => {
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<AppRole, number>);

    return [
      { role: "admin", count: roleStats.admin || 0, description: "Full System Access" },
      { role: "teacher", count: roleStats.teacher || 0, description: "Teaching & Assessment" },
      { role: "clerk", count: roleStats.clerk || 0, description: "Administrative Tasks" },
      { role: "librarian", count: roleStats.librarian || 0, description: "Library Management" },
      { role: "accountant", count: roleStats.accountant || 0, description: "Financial Management" },
      { role: "assistant", count: roleStats.assistant || 0, description: "Basic Operations" },
    ];
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "All settings have been updated successfully",
    });
  };

  const handleConnectIntegration = (service: string) => {
    toast({
      title: "Integration",
      description: `Connecting to ${service}...`,
    });
  };

  const handleCreateBackup = () => {
    toast({
      title: "Backup Created",
      description: "Creating backup... This may take a few minutes.",
    });
  };

  const handleRestoreBackup = () => {
    toast({
      title: "Restore Backup",
      description: "Opening restore selection dialog",
    });
  };

  const handleDownloadBackup = (date: string) => {
    const element = document.createElement('a');
    const content = `Backup created on ${date}\nSystem data and configurations included.`;
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `backup_${date.replace(/[^0-9]/g, '')}.txt`;
    element.click();
    
    toast({
      title: "Download Started",
      description: `Downloading backup from ${date}`,
    });
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your system preferences and configuration</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                College Information
              </CardTitle>
              <CardDescription>Basic information about your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="college-name">College Name</Label>
                  <Input id="college-name" defaultValue="KK Patil Paramedical College" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college-code">College Code</Label>
                  <Input id="college-code" defaultValue="KKPPC" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principal-name">Principal Name</Label>
                  <Input id="principal-name" defaultValue="Dr. Kiran Patil" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-number">Contact Number</Label>
                  <Input id="contact-number" defaultValue="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="college-address">College Address</Label>
                <Textarea id="college-address" defaultValue="Sangamner, Ahmednagar District, Maharashtra - 422605" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://kkpatilcollege.edu.in" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Year Settings</CardTitle>
              <CardDescription>Configure academic year and session details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academic-year">Current Academic Year</Label>
                  <Select defaultValue="2023-24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-24">2023-24</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-start">Session Start Date</Label>
                  <Input id="session-start" type="date" defaultValue="2023-07-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-end">Session End Date</Label>
                  <Input id="session-end" type="date" defaultValue="2024-06-30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working-days">Working Days per Week</Label>
                  <Select defaultValue="6">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Days</SelectItem>
                      <SelectItem value="6">6 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Roles & Permissions
              </CardTitle>
              <CardDescription>Manage user access levels and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role Statistics */}
              <div className="space-y-4">
                <h4 className="font-medium">Role Distribution</h4>
                {loading ? (
                  <div className="text-center py-4">Loading roles...</div>
                ) : (
                  getRoleStats().map((role, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{role.role}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{role.count} users</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Individual Users */}
              <div className="space-y-4">
                <h4 className="font-medium">Individual Users</h4>
                {loading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No users found</div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.user_id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{user.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">Current role: {user.role}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {userRole === 'admin' && (
                            <Select
                              value={user.role}
                              onValueChange={(newRole: AppRole) => handleUpdateRole(user.user_id, newRole)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="clerk">Clerk</SelectItem>
                                <SelectItem value="librarian">Librarian</SelectItem>
                                <SelectItem value="accountant">Accountant</SelectItem>
                                <SelectItem value="assistant">Assistant</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {userRole !== 'admin' && (
                            <span className="text-sm px-2 py-1 rounded-full bg-muted">
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Management */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Management
              </CardTitle>
              <CardDescription>Manage departments for your college</CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subject Management */}
        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subject Management
              </CardTitle>
              <CardDescription>Manage subjects across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS alerts for important events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send WhatsApp messages to students and parents</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fee Reminder Alerts</Label>
                    <p className="text-sm text-muted-foreground">Automatic reminders for pending fees</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Low attendance warnings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Attempts</Label>
                    <p className="text-sm text-muted-foreground">Max failed login attempts before lockout</p>
                  </div>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Password Policy</Label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Minimum 8 characters</p>
                  <p>• At least 1 uppercase letter</p>
                  <p>• At least 1 number</p>
                  <p>• At least 1 special character</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>Connect with external services and APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { service: "SMS Gateway", status: "Connected", description: "Send SMS notifications" },
                { service: "WhatsApp Business API", status: "Not Connected", description: "WhatsApp messaging" },
                { service: "Email Service", status: "Connected", description: "Email notifications" },
                { service: "Payment Gateway", status: "Not Connected", description: "Online fee payments" },
                { service: "Google Drive", status: "Connected", description: "Document storage" }
              ].map((integration, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{integration.service}</h4>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      integration.status === 'Connected' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {integration.status}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConnectIntegration(integration.service)}
                    >
                      {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Data Backup & Recovery
              </CardTitle>
              <CardDescription>Manage your data backups and recovery options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Schedule regular data backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Frequency</Label>
                    <p className="text-sm text-muted-foreground">How often to create backups</p>
                  </div>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Recent Backups</h4>
                {[
                  { date: "2024-01-22 02:00 AM", size: "45.2 MB", status: "Success" },
                  { date: "2024-01-21 02:00 AM", size: "44.8 MB", status: "Success" },
                  { date: "2024-01-20 02:00 AM", size: "44.1 MB", status: "Success" }
                ].map((backup, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-muted-foreground">{backup.size}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {backup.status}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadBackup(backup.date)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={handleCreateBackup}>Create Backup Now</Button>
                <Button variant="outline" onClick={handleRestoreBackup}>Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Management - Super Admin Only */}
        <TabsContent value="database" className="space-y-6">
          <RoleGuard allowedRoles={['super_admin']}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5" />
                  Database Management
                </CardTitle>
                <CardDescription>
                  Safely clean college data while preserving user accounts and system structure. 
                  Only super administrators can access this functionality.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Database Cleaning Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Analyze data before cleaning</li>
                    <li>• Export full data backup</li>
                    <li>• Selective module cleaning</li>
                    <li>• User accounts preservation</li>
                    <li>• College structure integrity</li>
                    <li>• Complete audit trail</li>
                  </ul>
                </div>
                
                <DatabaseManagementDialog 
                  trigger={
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <DatabaseIcon className="h-4 w-4" />
                      Open Database Management
                    </Button>
                  } 
                />
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Safety Features</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        All operations include multiple confirmation steps, data analysis previews, 
                        and automatic backup suggestions to ensure safe data management.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RoleGuard>
        </TabsContent>
      </Tabs>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          className="shadow-elegant"
          onClick={handleSaveSettings}
        >
          Save All Settings
        </Button>
      </div>
    </div>
  );
}