import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PromotionProgressProps {
  jobId: string;
  onComplete?: () => void;
}

export const PromotionProgress = ({ jobId, onComplete }: PromotionProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('pending');
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    eligible: 0,
    failed: 0,
  });

  useEffect(() => {
    const fetchJobStatus = async () => {
      const { data: job } = await supabase
        .from('promotion_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (job) {
        setStatus(job.status);
        
        const totalStudents = job.total_students || 0;
        const successCount = job.success_count || 0;
        const failedCount = job.failed_count || 0;
        const processedCount = job.processed_count || 0;
        
        setStats({
          total: totalStudents,
          processed: processedCount,
          eligible: successCount,
          failed: failedCount,
        });

        if (totalStudents > 0) {
          const progressPercent = (successCount / totalStudents) * 100;
          setProgress(progressPercent);
        }

        if (job.status === 'completed' || job.status === 'failed') {
          onComplete?.();
        }
      }
    };

    // Initial fetch
    fetchJobStatus();

    // Set up polling for updates
    const interval = setInterval(fetchJobStatus, 2000);

    // Set up realtime subscription
    const channel = supabase
      .channel('promotion-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'promotion_jobs',
          filter: `id=eq.${jobId}`,
        },
        () => {
          fetchJobStatus();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [jobId, onComplete]);

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Processing promotion...';
      case 'completed':
        return 'Promotion completed successfully';
      case 'failed':
        return 'Promotion failed';
      case 'preview':
        return 'Preview mode - no changes made';
      default:
        return 'Waiting to start...';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Promotion Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{getStatusText()}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Students</div>
          </div>
          <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.processed}
            </div>
            <div className="text-xs text-muted-foreground">Processed</div>
          </div>
          <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.eligible}
            </div>
            <div className="text-xs text-muted-foreground">Eligible</div>
          </div>
          <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.failed}
            </div>
            <div className="text-xs text-muted-foreground">Not Eligible</div>
          </div>
        </div>

        {status === 'running' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing students... Please wait.</span>
          </div>
        )}

        {status === 'completed' && (
          <Badge variant="default" className="w-full justify-center py-2">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Promotion completed successfully!
          </Badge>
        )}

        {status === 'failed' && (
          <Badge variant="destructive" className="w-full justify-center py-2">
            <XCircle className="mr-2 h-4 w-4" />
            Promotion failed. Please check the logs.
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
