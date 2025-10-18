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
import { usePromotion } from '@/hooks/usePromotion';
import { PromotionResultsDialog } from './PromotionResultsDialog';
import { Play, RotateCcw, Eye } from 'lucide-react';

export const PromotionJobsList = () => {
  const { promotionJobs, isLoading, processPromotion, rollbackPromotion } =
    usePromotion();
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'default', label: 'Processing' },
      completed: { variant: 'default', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' },
      dry_run: { variant: 'outline', label: 'Preview' },
      rolling_back: { variant: 'secondary', label: 'Rolling Back' },
      rolled_back: { variant: 'secondary', label: 'Rolled Back' },
    };

    const config = variants[status] || variants.pending;
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
                          Promoted: {job.promoted_students || 0}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {job.status === 'dry_run' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processPromotion(job.id)}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Execute
                        </Button>
                      )}
                      {job.results && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      )}
                      {job.status === 'completed' && job.can_rollback && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rollbackPromotion(job.id)}
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
      </CardContent>
    </Card>
  );
};
