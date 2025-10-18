import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { format } from 'date-fns';

interface PromotionResultsDialogProps {
  open: boolean;
  onClose: () => void;
  job: any;
}

export const PromotionResultsDialog = ({
  open,
  onClose,
  job,
}: PromotionResultsDialogProps) => {
  if (!job) return null;

  // For now, show basic job stats since we don't have detailed results in the schema yet
  const stats = {
    total: job.total_students || 0,
    success: job.success_count || 0,
    failed: job.failed_count || 0,
    skipped: job.skipped_count || 0,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Promotion Job Results</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.success}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {stats.failed}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {stats.skipped}
              </div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Job Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Job Name:</span>
                <div className="font-medium">{job.job_name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium capitalize">{job.status}</div>
              </div>
              {job.started_at && (
                <div>
                  <span className="text-muted-foreground">Started:</span>
                  <div className="font-medium">
                    {format(new Date(job.started_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              )}
              {job.completed_at && (
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <div className="font-medium">
                    {format(new Date(job.completed_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>View Detailed History</AlertTitle>
            <AlertDescription>
              For detailed student-level results, check the Student Academic History section
              or export the job data.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};
