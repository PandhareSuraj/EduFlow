import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Eye,
  CreditCard,
  Loader2,
  Settings,
  Calculator,
  FileText
} from "lucide-react";
import { CollectFeeDialog } from "@/components/forms/CollectFeeDialog";
import { FeeStructureDialog } from "@/components/forms/FeeStructureDialog";
import { StudentFeeLedger } from "@/components/fees/StudentFeeLedger";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";

interface StudentFeeData {
  id: string;
  student_id: number;
  students: {
    student_id: string;
    name: string;
    email: string;
    mobile_number: string;
    courses: {
      name: string;
      code: string;
    } | null;
  } | null;
  original_amount: number;
  discount_amount: number;
  discount_percentage: number;
  discount_reason: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
  due_date: string;
  fee_payments: {
    amount: number;
    payment_date: string;
    payment_method: string;
    receipt_number: string;
  }[];
}

export default function Fees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeRecords, setFeeRecords] = useState<StudentFeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeeRecords = async () => {
    try {
      console.log('Fetching fee records with relationships...');
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          id,
          student_id,
          original_amount,
          discount_amount,
          discount_percentage,
          discount_reason,
          total_amount,
          paid_amount,
          balance_amount,
          status,
          due_date,
          students!student_fees_student_id_fkey (
            student_id,
            name,
            email,
            mobile_number,
            courses!students_course_id_fkey (
              name,
              code
            )
          ),
          fee_payments!fee_payments_student_fee_id_fkey (
            amount,
            payment_date,
            payment_method,
            receipt_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fee records:', error);
        toast({
          title: "Error",
          description: `Failed to load fee records: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Fee records data received:', data);
      setFeeRecords(data || []);
    } catch (error) {
      console.error('Error fetching fee records:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeRecords();
  }, []);

  // Filter records based on search term and status
  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = 
      record.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.students?.courses?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalCollection = feeRecords.reduce((sum, record) => sum + record.paid_amount, 0);
  const totalPending = feeRecords.reduce((sum, record) => sum + record.balance_amount, 0);
  const totalAmount = feeRecords.reduce((sum, record) => sum + record.total_amount, 0);
  const totalDiscounts = feeRecords.reduce((sum, record) => sum + (record.discount_amount || 0), 0);
  const collectionRate = totalAmount > 0 ? ((totalCollection / totalAmount) * 100).toFixed(1) : 0;

  const handleExportRecords = () => {
    const headers = [
      "Student ID", "Name", "Course", "Total Amount", "Paid Amount", 
      "Balance", "Status", "Due Date", "Last Payment", "Contact"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(record => [
        record.students?.student_id || 'N/A',
        record.students?.name || 'N/A',
        record.students?.courses?.code || 'N/A',
        record.total_amount,
        record.paid_amount,
        record.balance_amount,
        record.status,
        record.due_date,
        record.fee_payments?.[0]?.payment_date || 'No payments',
        record.students?.mobile_number || 'N/A'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fee_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">Manage student fee collections and payments</p>
        </div>
        <div className="flex gap-2">
          <StudentFeeLedger />
          <PermissionWrapper permission="FEES_STRUCTURE">
            <FeeStructureDialog
              trigger={
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Fee Structure
                </Button>
              }
              onSuccess={fetchFeeRecords}
            />
          </PermissionWrapper>
          <PermissionWrapper permission="FEES_COLLECT">
            <CollectFeeDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Collect Payment
                </Button>
              }
              onSuccess={fetchFeeRecords}
            />
          </PermissionWrapper>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCollection.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Total collected amount</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPending.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Amount yet to collect</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground">Fee collection efficiency</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDiscounts.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Total discounts given</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeRecords.length}</div>
            <p className="text-xs text-muted-foreground">Students with fee records</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Buttons */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students, ID, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={handleExportRecords}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            Track and manage student fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading fee records...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No fee records found matching your criteria." 
                  : "No fee records found. Students will appear here once fee structures are created."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
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
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.students?.student_id || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.students?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{record.students?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.students?.courses?.code || 'N/A'}</TableCell>
                    <TableCell>₹{(record.original_amount || record.total_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      {(record.discount_amount || 0) > 0 || (record.discount_percentage || 0) > 0 ? (
                        <div className="text-sm">
                          <div>₹{(record.discount_amount || 0).toLocaleString('en-IN')}</div>
                          {(record.discount_percentage || 0) > 0 && (
                            <div className="text-xs text-muted-foreground">({record.discount_percentage}%)</div>
                          )}
                          {record.discount_reason && (
                            <div className="text-xs text-muted-foreground">{record.discount_reason}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>₹{record.total_amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.paid_amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <span className={record.balance_amount > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                        ₹{record.balance_amount.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.due_date ? new Date(record.due_date).toLocaleDateString('en-IN') : 'No due date'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {record.balance_amount > 0 && (
                          <PermissionWrapper permission="FEES_COLLECT">
                            <CollectFeeDialog
                              studentId={record.student_id}
                              onSuccess={fetchFeeRecords}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </PermissionWrapper>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
