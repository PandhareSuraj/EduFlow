import { useState, useEffect } from "react";
import { Settings, UserX, Key, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Faculty {
  id: string;
  name: string;
  email: string;
  user_id?: string;
}

interface ManageFacultyLoginDialogProps {
  faculty: Faculty;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ManageFacultyLoginDialog({ faculty, trigger, onSuccess }: ManageFacultyLoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "teacher" | "clerk" | "librarian" | "accountant" | "auditor" | "assistant" | "super_admin" | "student">("teacher");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open && faculty.user_id) {
      fetchUserRole();
    }
  }, [open, faculty.user_id]);

  const fetchUserRole = async () => {
    if (!faculty.user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', faculty.user_id)
        .single();

      if (error) throw error;
      setUserRole(data.role as typeof userRole);
    } catch (error: any) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleRoleUpdate = async () => {
    if (!faculty.user_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: userRole as any })
        .eq('user_id', faculty.user_id);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `${faculty.name}'s role has been updated to ${userRole}`,
      });
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive"
      });
      return;
    }

    if (!faculty.user_id) {
      toast({
        title: "Error",
        description: "No user account found for this faculty member",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use edge function to reset password
      const { data, error } = await supabase.functions.invoke('reset-faculty-password', {
        body: {
          userId: faculty.user_id,
          newPassword: newPassword
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to reset password');
      }

      toast({
        title: "Password Reset Successfully",
        description: `New password for ${faculty.name}: ${newPassword}. Please share securely.`,
      });
      
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogin = async () => {
    if (!faculty.user_id) return;

    setLoading(true);
    try {
      // Remove user_id from faculty record
      const { error: facultyError } = await supabase
        .from('faculty')
        .update({ user_id: null })
        .eq('id', faculty.id);

      if (facultyError) throw facultyError;

      // Remove user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', faculty.user_id);

      if (roleError) throw roleError;

      toast({
        title: "Login Access Removed",
        description: `Login access has been removed for ${faculty.name}`,
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove login access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Manage Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Login Access</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{faculty.name}</p>
                <p className="text-sm text-muted-foreground">{faculty.email}</p>
              </div>
              <Badge variant="default">Has Login</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Current Role</Label>
              <Select value={userRole} onValueChange={(value) => setUserRole(value as "admin" | "teacher" | "clerk" | "librarian" | "accountant" | "auditor" | "assistant" | "super_admin" | "student")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="librarian">Librarian</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="auditor">Auditor (View Only)</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleRoleUpdate}
                disabled={loading}
                className="w-full mt-2"
                variant="outline"
              >
                Update Role
              </Button>
            </div>

            <div>
              <Label htmlFor="password">Reset Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomPassword}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handlePasswordReset}
                disabled={loading || !newPassword.trim()}
                className="w-full mt-2"
                variant="outline"
              >
                Generate & Share Password
              </Button>
            </div>

            <div className="border-t pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <UserX className="mr-2 h-4 w-4" />
                    Remove Login Access
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Login Access</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove login access for {faculty.name}? 
                      This will disable their ability to log into the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveLogin} disabled={loading}>
                      Remove Access
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}