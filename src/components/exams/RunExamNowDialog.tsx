import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Clock, AlertCircle } from "lucide-react";
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

interface RunExamNowDialogProps {
  exam: Exam;
  onClose?: () => void;
}

export function RunExamNowDialog({ exam, onClose }: RunExamNowDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleStartExam = () => {
    setIsRunning(true);
    toast({
      title: "Admin Test Session",
      description: "Starting exam in test mode - bypassing scheduling restrictions",
    });
  };

  const handleCloseExam = () => {
    setIsOpen(false);
    setIsRunning(false);
    onClose?.();
    toast({
      title: "Test Session Ended",
      description: "Admin test session completed",
    });
  };

  const examForInterface = {
    id: exam.id,
    name: `${exam.name} (Admin Test)`,
    instructions: `ADMIN TEST MODE: ${exam.instructions || "This is an admin test session. You can run this exam regardless of its scheduled date/time."}`,
    duration_minutes: exam.duration_minutes || 60,
    total_questions: exam.total_questions || 30,
    total_marks: exam.total_marks,
    passing_marks: exam.passing_marks || 50
  };

  const isScheduledInFuture = new Date(exam.exam_date) > new Date();
  const isCompleted = exam.status === 'completed';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50">
          <Play className="h-4 w-4 mr-1" />
          Run Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {exam.name} - Admin Test Mode
              </DialogTitle>
              <DialogDescription>
                Run this exam immediately for testing purposes
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={handleCloseExam}>
              Close Test
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {!isRunning ? (
            <div className="space-y-6">
              {/* Admin Notice */}
              <Alert className="border-green-500 bg-green-50">
                <Play className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Admin Test Mode:</strong> This feature allows you to run any exam immediately, 
                  bypassing normal scheduling restrictions. This is perfect for testing exam functionality 
                  and experiencing what students will encounter.
                </AlertDescription>
              </Alert>

              {/* Exam Status Info */}
              {isScheduledInFuture && (
                <Alert className="border-blue-500 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    This exam is scheduled for <strong>{new Date(exam.exam_date).toLocaleDateString()}</strong>. 
                    Running it now will not affect the actual exam or its scheduling.
                  </AlertDescription>
                </Alert>
              )}

              {isCompleted && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    This exam has already been completed. Running it now allows you to review the exam 
                    experience without affecting any existing results.
                  </AlertDescription>
                </Alert>
              )}

              {/* Exam Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Exam Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{exam.duration_minutes || 60} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{exam.total_questions || 30}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Marks:</span>
                      <span className="font-medium">{exam.total_marks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passing Marks:</span>
                      <span className="font-medium">{exam.passing_marks || 50}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Full exam interface experience
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time timer functionality
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Question navigation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Answer selection and saving
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Test data (won't affect real results)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <Button size="lg" onClick={handleStartExam} className="px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Start Test Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <StudentExamInterface
                exam={examForInterface}
                studentId={-999} // Special ID for admin test sessions
                onExamComplete={handleCloseExam}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}