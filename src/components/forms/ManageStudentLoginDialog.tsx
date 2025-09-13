import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Settings, Key, UserX } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Student {
  id: number;
  name: string;
  email: string;
  user_id?: string;
}

interface ManageStudentLoginDialogProps {
  student: Student;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ManageStudentLoginDialog({ student, trigger, onSuccess }: ManageStudentLoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'assistant'>('student');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (open && student.user_id) {
      fetchUserRole();
    }
  }, [open, student.user_id]);

  const fetchUserRole = async () => {
    if (!student.user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', student.user_id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data) {
        setUserRole(data.role as 'student' | 'assistant');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleUpdateRole = async () => {
    if (!student.user_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: userRole })
        .eq('user_id', student.user_id);

      if (error) {
        toast.error('Failed to update role');
        return;
      }

      toast.success('Role updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!student.user_id || !newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-faculty-password', {
        body: {
          userId: student.user_id,
          newPassword: newPassword,
        },
      });

      if (error) {
        toast.error('Failed to reset password');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Password reset successfully for ${student.name}!`, {
        description: `New password: ${newPassword} (Share this securely with the student)`,
        duration: 10000,
      });

      setNewPassword('');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async () => {
    if (!student.user_id) return;

    setLoading(true);
    try {
      // Remove user_id from student record
      const { error: studentError } = await supabase
        .from('students')
        .update({ user_id: null })
        .eq('id', student.id);

      if (studentError) {
        toast.error('Failed to remove login access');
        return;
      }

      // Remove user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', student.user_id);

      if (roleError) {
        console.error('Error removing user role:', roleError);
      }

      toast.success('Login access removed successfully');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to remove login access');
    } finally {
      setLoading(false);
    }
  };

  if (!student.user_id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Manage Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Student Login</DialogTitle>
          <DialogDescription>
            Manage login credentials for <strong>{student.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Management */}
          <div className="space-y-3">
            <h4 className="font-medium">Role Management</h4>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={userRole} onValueChange={(value: 'student' | 'assistant') => setUserRole(value)}>
                <SelectTrigger className="col-span-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateRole} disabled={loading} size="sm">
                Update
              </Button>
            </div>
          </div>

          {/* Password Reset */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Reset Password
            </h4>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                New Password
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewPassword(generateRandomPassword())}
                  size="sm"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div />
              <div className="col-span-3">
                <Button onClick={handleResetPassword} disabled={loading || !newPassword.trim()}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </div>
          </div>

          {/* Remove Access */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-destructive flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Remove Login Access
            </h4>
            <p className="text-sm text-muted-foreground">
              This will remove the student's ability to log into the system. They will lose access to their account and all associated data.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  Remove Access
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Login Access</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove login access for <strong>{student.name}</strong>? 
                    This action will prevent them from logging into the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveAccess} className="bg-destructive hover:bg-destructive/90">
                    Remove Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}