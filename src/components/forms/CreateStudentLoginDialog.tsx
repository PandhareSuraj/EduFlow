import { useState } from 'react';
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
import { UserPlus } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  user_id?: string;
}

interface CreateStudentLoginDialogProps {
  student: Student;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateStudentLoginDialog({ student, trigger, onSuccess }: CreateStudentLoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: student.email,
    password: '',
    role: 'student' as const,
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      // Call edge function to create student user account
      const { data, error } = await supabase.functions.invoke('create-student-user', {
        body: {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          full_name: student.name,
          student_id: student.id,
        },
      });

      if (error) {
        console.error('Error creating student login:', error);
        toast.error(error.message || 'Failed to create student login');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Update the student record with the new user_id
      if (data?.user_id) {
        const { error: updateError } = await supabase
          .from('students')
          .update({ user_id: data.user_id })
          .eq('id', student.id);

        if (updateError) {
          console.error('Error updating student user_id:', updateError);
          toast.error('Login created but failed to link to student record');
          return;
        }
      }

      toast.success(`Login created successfully for ${student.name}!`, {
        description: `Password: ${formData.password} (Share this securely with the student)`,
        duration: 10000,
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating student login:', error);
      toast.error('Failed to create student login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Create Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Student Login</DialogTitle>
          <DialogDescription>
            Create login credentials for <strong>{student.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="col-span-3 bg-muted"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter temporary password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleChange('password', generateRandomPassword())}
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> This is a temporary password. Please share it securely with the student and ask them to change it after first login.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Login'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}