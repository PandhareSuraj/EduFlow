import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Mail, Globe } from "lucide-react";

export default function Settings() {
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
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
              {[
                { role: "Admin", users: 2, permissions: "Full System Access" },
                { role: "Faculty", users: 8, permissions: "Student & Course Management" },
                { role: "Accountant", users: 1, permissions: "Fees & Financial Management" },
                { role: "Clerk", users: 3, permissions: "Data Entry & Basic Operations" }
              ].map((role, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{role.role}</h4>
                    <p className="text-sm text-muted-foreground">{role.permissions}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{role.users} users</span>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              ))}
              <Separator />
              <Button>Add New User</Button>
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
                    <Button variant="outline" size="sm">
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
                <Database className="h-5 w-5" />
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
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button>Create Backup Now</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button size="lg" className="shadow-elegant">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}