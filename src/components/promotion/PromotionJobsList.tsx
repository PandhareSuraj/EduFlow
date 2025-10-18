import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePromotion } from '@/hooks/usePromotion';
import { PromotionResultsDialog } from './PromotionResultsDialog';
import { Play, RotateCcw, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PromotionJobsList = () => {
  const { promotionJobs, isLoading, processPromotion, rollbackPromotion, isProcessing, isRollingBack } =
    usePromotion();
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'execute' | 'rollback'; jobId: string } | null>(null);

  const handleExecute = () => {
    if (confirmAction && confirmAction.type === 'execute') {
      processPromotion(confirmAction.jobId);
      setConfirmAction(null);
    }
  };

  const handleRollback = () => {
    if (confirmAction && confirmAction.type === 'rollback') {
      rollbackPromotion(confirmAction.jobId);
      setConfirmAction(null);
    }
  };

  const exportToCSV = (job: any) => {
    const filters = job.filters || {};
    
    toast({
      title: 'Export Started',
      description: 'Preparing promotion data export...',
    });

    // Create basic job info CSV
    const headers = ['Job ID', 'Job Name', 'Status', 'Total Students', 'Success Count', 'Failed Count', 'Started At', 'Completed At'];
    const row = [
      job.id,
      job.job_name,
      job.status,
      job.total_students || 0,
      job.success_count || 0,
      job.failed_count || 0,
      job.started_at ? format(new Date(job.started_at), 'yyyy-MM-dd HH:mm:ss') : '-',
      job.completed_at ? format(new Date(job.completed_at), 'yyyy-MM-dd HH:mm:ss') : '-',
    ];

    const csvContent = [
      headers.join(','),
      row.map(cell => `"${cell}"`).join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promotion_${job.id.substring(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Promotion report downloaded',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      preview: { variant: 'outline', label: 'Preview' },
      running: { variant: 'default', label: 'Running' },
      completed: { variant: 'default', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' },
      rolled_back: { variant: 'secondary', label: 'Rolled Back' },
    };

    const config = variants[status] || variants.preview;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotion History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : promotionJobs && promotionJobs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotionJobs.map((job: any) => (
                <TableRow key={job.id}>
                  <TableCell>
                    {job.academic_years?.year_code || 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {job.total_students ? (
                      <div className="text-sm">
                        <div>Total: {job.total_students}</div>
                        <div className="text-muted-foreground">
                          Success: {job.success_count || 0} / Failed: {job.failed_count || 0}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.status === 'preview' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmAction({ type: 'execute', jobId: job.id })}
                          disabled={isProcessing}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Execute
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {job.filters && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportToCSV(job)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Export
                        </Button>
                      )}
                      {job.status === 'completed' && job.can_rollback && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmAction({ type: 'rollback', jobId: job.id })}
                          disabled={isRollingBack}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No promotion jobs found
          </div>
        )}

        <PromotionResultsDialog
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
        />

        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.type === 'execute' ? 'Execute Promotion?' : 'Rollback Promotion?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.type === 'execute' ? (
                  <>
                    This will promote all eligible students to the next year/semester.
                    This action can be rolled back within 24 hours if needed.
                    <br /><br />
                    <strong>Are you sure you want to proceed?</strong>
                  </>
                ) : (
                  <>
                    This will reverse the promotion and restore all students to their previous
                    year/semester. This action cannot be undone.
                    <br /><br />
                    <strong>Are you sure you want to rollback this promotion?</strong>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction?.type === 'execute' ? handleExecute : handleRollback}
              >
                {confirmAction?.type === 'execute' ? 'Execute Promotion' : 'Confirm Rollback'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
