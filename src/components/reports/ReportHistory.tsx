import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";

interface ReportHistoryItem {
  id: string;
  name: string;
  type: string;
  format: string;
  size: string;
  generatedAt: Date;
  downloadUrl?: string;
}

interface ReportHistoryProps {
  reports?: ReportHistoryItem[];
}

const defaultReports: ReportHistoryItem[] = [
  {
    id: "1",
    name: "Student Enrollment Report",
    type: "Student",
    format: "PDF",
    size: "2.3 MB",
    generatedAt: new Date(2024, 0, 22)
  },
  {
    id: "2", 
    name: "Fees Collection Summary",
    type: "Financial",
    format: "Excel",
    size: "1.8 MB",
    generatedAt: new Date(2024, 0, 21)
  },
  {
    id: "3",
    name: "Attendance Report",
    type: "Attendance", 
    format: "PDF",
    size: "3.1 MB",
    generatedAt: new Date(2024, 0, 20)
  },
  {
    id: "4",
    name: "Exam Results Analysis",
    type: "Academic",
    format: "Excel", 
    size: "2.7 MB",
    generatedAt: new Date(2024, 0, 19)
  }
];

export const ReportHistory = ({ reports = defaultReports }: ReportHistoryProps) => {
  const handleDownload = (report: ReportHistoryItem) => {
    // In a real implementation, this would trigger a download from the server
    console.log('Downloading report:', report.name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Generated Reports</CardTitle>
        <CardDescription>Your latest report downloads and exports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{report.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Generated on {format(report.generatedAt, 'PPP')} • {report.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{report.type}</Badge>
                <Badge variant="secondary">{report.format}</Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDownload(report)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};