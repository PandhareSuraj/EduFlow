import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
}

interface DeleteStudentDialogProps {
  student: Student;
  onDelete?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteStudentDialog({ student, onDelete, trigger }: DeleteStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      // Check for related records first
      const { data: relatedData, error: checkError } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', student.id)
        .limit(1);

      if (checkError) throw checkError;

      if (relatedData && relatedData.length > 0) {
        toast({
          title: "Cannot Delete Student",
          description: "This student has attendance records. Please archive the student instead of deleting.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Proceed with deletion
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      
      setOpen(false);
      onDelete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Student
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This action cannot be undone. This will permanently delete the student record.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Student to be deleted:</p>
          <div className="bg-muted p-3 rounded-md">
            <p className="font-semibold">{student.name}</p>
            <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
            <p className="text-sm text-muted-foreground">Email: {student.email}</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}