import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  name: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface DeleteExamDialogProps {
  exam: Exam;
  onExamDeleted: () => void;
}

export function DeleteExamDialog({ exam, onExamDeleted }: DeleteExamDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First, get session IDs for this exam
      const { data: sessions } = await supabase
        .from('student_exam_sessions')
        .select('id')
        .eq('exam_id', exam.id);

      const sessionIds = sessions?.map(session => session.id) || [];

      // Delete related data
      await Promise.all([
        // Delete MCQ questions
        supabase.from('mcq_questions').delete().eq('exam_id', exam.id),
        // Delete student answers (if any)
        sessionIds.length > 0 
          ? supabase.from('student_answers').delete().in('session_id', sessionIds)
          : Promise.resolve(),
        // Delete exam sessions
        supabase.from('student_exam_sessions').delete().eq('exam_id', exam.id),
        // Delete results
        supabase.from('results').delete().eq('exam_id', exam.id)
      ]);

      // Then delete the exam itself
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', exam.id);

      if (error) throw error;

      toast({
        title: "Exam Deleted",
        description: `${exam.name} has been successfully deleted`,
      });

      setIsOpen(false);
      onExamDeleted();
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete exam",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = exam.status !== 'ongoing';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:bg-destructive/10"
          disabled={!canDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Exam
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{exam.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This will permanently delete:
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>The exam and its configuration</li>
              <li>All questions and answers</li>
              <li>Student exam sessions and results</li>
              <li>All associated data</li>
            </ul>
          </AlertDescription>
        </Alert>

        {exam.status === 'ongoing' && (
          <Alert className="border-yellow-500">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              Cannot delete an ongoing exam. Please wait for it to complete or cancel it first.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting || !canDelete}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}