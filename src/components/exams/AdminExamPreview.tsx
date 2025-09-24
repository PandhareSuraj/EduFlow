import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Play, AlertCircle } from "lucide-react";
import { StudentExamInterface } from "./StudentExamInterface";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  name: string;
  course_id: number;
  exam_date: string;
  total_marks: number;
  total_questions?: number;
  exam_type?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  duration_minutes?: number;
  instructions?: string;
  passing_marks?: number;
}

interface AdminExamPreviewProps {
  exam: Exam;
  onClose?: () => void;
}

export function AdminExamPreview({ exam, onClose }: AdminExamPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'info' | 'live'>('info');
  const { toast } = useToast();

  const handleStartPreview = () => {
    setPreviewMode('live');
    toast({
      title: "Preview Mode",
      description: "You are now previewing this exam as a student would see it",
    });
  };

  const handleClosePreview = () => {
    setIsOpen(false);
    setPreviewMode('info');
    onClose?.();
  };

  const examForInterface = {
    id: exam.id,
    name: exam.name,
    instructions: exam.instructions || "This is an admin preview of the exam. No answers will be saved.",
    duration_minutes: exam.duration_minutes || 60,
    total_questions: exam.total_questions || 30,
    total_marks: exam.total_marks,
    passing_marks: exam.passing_marks || 50
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {exam.name}
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Admin Preview
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Preview this exam as students will experience it
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {previewMode === 'info' && (
                <Button onClick={handleStartPreview}>
                  <Play className="h-4 w-4 mr-1" />
                  Start Live Preview
                </Button>
              )}
              <Button variant="outline" onClick={handleClosePreview}>
                Close Preview
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {previewMode === 'info' ? (
            <div className="space-y-6">
              {/* Exam Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Admin Preview Mode</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  This is a preview mode for administrators. You can see exactly what students will experience during the exam. 
                  No answers will be saved and this won't affect any exam statistics.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Exam Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exam Name:</span>
                      <span className="font-medium">{exam.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Questions:</span>
                      <span className="font-medium">{exam.total_questions || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Marks:</span>
                      <span className="font-medium">{exam.total_marks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{exam.duration_minutes || 60} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passing Marks:</span>
                      <span className="font-medium">{exam.passing_marks || 50}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exam Type:</span>
                      <span className="font-medium">{exam.exam_type?.toUpperCase() || 'MCQ'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Exam Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={exam.status === 'completed' ? 'default' : 'outline'}>
                        {exam.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exam Date:</span>
                      <span className="font-medium">{new Date(exam.exam_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Instructions</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    {exam.instructions || "No specific instructions provided for this exam."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <StudentExamInterface
                exam={examForInterface}
                studentId={-1} // Admin preview uses -1 as student ID
                onExamComplete={() => {
                  toast({
                    title: "Preview Complete",
                    description: "Admin preview session completed",
                  });
                  setPreviewMode('info');
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}