import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import { useAMCRevenue } from "@/hooks/useAMCRevenue";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AMCRevenue() {
  const { data, loading, refetch } = useAMCRevenue();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const handleRecordPayment = (collegeId: string) => {
    // TODO: Open payment dialog
    console.log('Recording payment for college:', collegeId);
  };

  const handleGenerateInvoice = (collegeId: string) => {
    // TODO: Generate invoice
    console.log('Generating invoice for college:', collegeId);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AMC Revenue Management</h1>
          <p className="text-muted-foreground">Track and manage Annual Maintenance Contract revenue</p>
        </div>
        <Button onClick={() => refetch()}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.totalRevenue || 0)}
          icon={DollarSign}
          trend={{ value: 15.2, isPositive: true }}
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(data?.monthlyRevenue || 0)}
          icon={TrendingUp}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatsCard
          title="Outstanding"
          value={formatCurrency(data?.outstanding || 0)}
          icon={Calendar}
          trend={{ value: -12.3, isPositive: false }}
        />
        <StatsCard
          title="Colleges"
          value={data?.totalColleges || 0}
          icon={DollarSign}
        />
      </div>

      {/* College-wise AMC Table */}
      <Card>
        <CardHeader>
          <CardTitle>College-wise AMC Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>AMC Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.colleges?.map((college) => (
                <TableRow key={college.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{college.name}</div>
                      <div className="text-sm text-muted-foreground">{college.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>{college.studentCount}</TableCell>
                  <TableCell>{college.userCount}</TableCell>
                  <TableCell>{formatCurrency(college.calculatedAmount)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        college.paymentStatus === 'paid' ? 'default' : 
                        college.paymentStatus === 'overdue' ? 'destructive' : 'secondary'
                      }
                    >
                      {college.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {college.dueDate ? formatDate(college.dueDate) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecordPayment(college.id)}
                      >
                        Record Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleGenerateInvoice(college.id)}
                      >
                        Invoice
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}