import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  if (!job?.results) return null;

  const results = job.results;
  const details = results.details || [];

  const eligible = details.filter((d: any) => d.status === 'eligible' || d.status === 'graduating');
  const notEligible = details.filter((d: any) => d.status === 'not_eligible');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promotion Results</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">{results.total}</div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </div>
          <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {results.eligible}
            </div>
            <div className="text-sm text-muted-foreground">Eligible</div>
          </div>
          <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {results.failed}
            </div>
            <div className="text-sm text-muted-foreground">Not Eligible</div>
          </div>
        </div>

        <Tabs defaultValue="eligible">
          <TabsList>
            <TabsTrigger value="eligible">
              Eligible ({eligible.length})
            </TabsTrigger>
            <TabsTrigger value="not-eligible">
              Not Eligible ({notEligible.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eligible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligible.map((detail: any) => (
                  <TableRow key={detail.student_id}>
                    <TableCell>{detail.student_name}</TableCell>
                    <TableCell>{detail.from}</TableCell>
                    <TableCell>{detail.to}</TableCell>
                    <TableCell>
                      {detail.status === 'graduating' ? (
                        <Badge variant="secondary">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Graduating
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Eligible
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="not-eligible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Reasons</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notEligible.map((detail: any) => (
                  <TableRow key={detail.student_id}>
                    <TableCell>{detail.student_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {detail.reasons?.map((reason: string, idx: number) => (
                          <Badge key={idx} variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
