import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCollege } from "@/contexts/CollegeContext";
import { IndianRupee, Download, Eye, Search, FileText } from "lucide-react";

interface StudentFeeLedgerData {
  fee_record_id: string;
  student_id: number;
  student_number: string;
  student_name: string;
  course_name: string;
  semester: number;
  original_amount: number;
  discount_amount: number;
  discount_percentage: number;
  discount_reason: string;
  final_amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  fee_status: string;
  fee_created_at: string;
  payment_history: any; // This can be JSON from the database
}

interface StudentFeeLedgerProps {
  trigger?: React.ReactNode;
}

export function StudentFeeLedger({ trigger }: StudentFeeLedgerProps) {
  const [open, setOpen] = useState(false);
  const [ledgerData, setLedgerData] = useState<StudentFeeLedgerData[]>([]);
  const [filteredData, setFilteredData] = useState<StudentFeeLedgerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { college } = useCollege();

  useEffect(() => {
    if (open) {
      fetchLedgerData();
    }
  }, [open]);

  useEffect(() => {
    filterData();
  }, [ledgerData, searchTerm, statusFilter]);

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      if (!college?.id) {
        console.log('No college context available for fee ledger');
        setLedgerData([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('student_fee_ledger')
        .select('*')
        .eq('college_id', college.id)  // CRITICAL: Filter by college
        .order('fee_created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ledger data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch fee ledger data",
          variant: "destructive",
        });
        return;
      }

      setLedgerData(data || []);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = ledgerData;

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.fee_status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportLedger = () => {
    const headers = [
      'Student ID', 'Student Name', 'Course', 'Semester',
      'Original Amount', 'Discount Amount', 'Discount %', 'Discount Reason',
      'Final Amount', 'Paid Amount', 'Balance Amount', 'Status', 'Due Date'
    ].join(',');

    const csvData = filteredData.map(record => [
      record.student_number,
      record.student_name,
      record.course_name,
      record.semester,
      record.original_amount,
      record.discount_amount,
      record.discount_percentage,
      record.discount_reason || '',
      record.final_amount,
      record.paid_amount,
      record.balance_amount,
      record.fee_status,
      record.due_date
    ].join(',')).join('\n');

    const blob = new Blob([headers + '\n' + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-fee-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Fee Ledger
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Student Fee Ledger
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student name, ID, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportLedger} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Students</div>
                <div className="text-2xl font-bold">{filteredData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Original Amount</div>
                <div className="text-2xl font-bold">
                  ₹{filteredData.reduce((sum, record) => sum + record.original_amount, 0).toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Discounts</div>
                <div className="text-2xl font-bold">
                  ₹{filteredData.reduce((sum, record) => sum + record.discount_amount, 0).toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Outstanding Balance</div>
                <div className="text-2xl font-bold">
                  ₹{filteredData.reduce((sum, record) => sum + record.balance_amount, 0).toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading ledger data...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Original Fee</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Final Fee</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.fee_record_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.student_name}</div>
                          <div className="text-sm text-muted-foreground">{record.student_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.course_name}</TableCell>
                      <TableCell>{record.semester}</TableCell>
                      <TableCell>₹{record.original_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        {record.discount_amount > 0 || record.discount_percentage > 0 ? (
                          <div className="text-sm">
                            <div>₹{record.discount_amount.toLocaleString('en-IN')}</div>
                            {record.discount_percentage > 0 && (
                              <div className="text-muted-foreground">({record.discount_percentage}%)</div>
                            )}
                            {record.discount_reason && (
                              <div className="text-xs text-muted-foreground">{record.discount_reason}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>₹{record.final_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{record.paid_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{record.balance_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.fee_status)}>
                          {record.fee_status.charAt(0).toUpperCase() + record.fee_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(record.due_date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredData.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No fee records found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}