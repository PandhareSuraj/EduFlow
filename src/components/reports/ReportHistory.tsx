import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ReportHistoryItem {
  id: string;
  name: string;
  report_type: string;
  export_format: string;
  size_bytes?: number;
  generated_at: string;
  file_url?: string;
  filters?: any;
}

interface ReportHistoryProps {
  onRegenerateReport?: (filters: any, format: string) => void;
}

export const ReportHistory = ({ onRegenerateReport }: ReportHistoryProps) => {
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportHistory();
  }, []);

  const fetchReportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching report history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getCategoryFromType = (reportType: string) => {
    const typeMap: Record<string, string> = {
      'student': 'Student',
      'fees': 'Financial',
      'attendance': 'Attendance',
      'exams': 'Academic',
      'faculty': 'Faculty'
    };
    return typeMap[reportType] || 'General';
  };
  const handleDownload = (report: ReportHistoryItem) => {
    if (report.file_url) {
      // Download existing file
      window.open(report.file_url, '_blank');
    } else if (onRegenerateReport && report.filters) {
      // Regenerate report using saved filters
      onRegenerateReport(report.filters, report.export_format.toLowerCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Generated Reports</CardTitle>
        <CardDescription>Your latest report downloads and exports</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading report history...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reports generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on {format(new Date(report.generated_at), 'PPP')} • {formatFileSize(report.size_bytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{getCategoryFromType(report.report_type)}</Badge>
                  <Badge variant="secondary">{report.export_format}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownload(report)}
                    title={report.file_url ? "Download file" : "Regenerate report"}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};