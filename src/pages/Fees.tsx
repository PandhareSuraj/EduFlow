import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, CreditCard, AlertCircle, Download } from "lucide-react";

const feeRecords = [
  {
    id: "ST001",
    studentName: "Aarti Sharma",
    course: "DMLT",
    totalFees: 65000,
    paidAmount: 40000,
    pendingAmount: 25000,
    lastPayment: "2024-01-15",
    status: "Pending",
    installment: "2/3"
  },
  {
    id: "ST002",
    studentName: "Rohit Patil",
    course: "Radiology Technician",
    totalFees: 75000,
    paidAmount: 75000,
    pendingAmount: 0,
    lastPayment: "2024-01-20",
    status: "Paid",
    installment: "3/3"
  },
  {
    id: "ST003",
    studentName: "Priya Kumar",
    course: "PGDMLT",
    totalFees: 45000,
    paidAmount: 15000,
    pendingAmount: 30000,
    lastPayment: "2023-12-10",
    status: "Overdue",
    installment: "1/3"
  },
  {
    id: "ST004",
    studentName: "Amit Desai",
    course: "Hospital Management",
    totalFees: 55000,
    paidAmount: 35000,
    pendingAmount: 20000,
    lastPayment: "2024-01-10",
    status: "Pending",
    installment: "2/3"
  }
];

export default function Fees() {
  const totalCollection = feeRecords.reduce((sum, record) => sum + record.paidAmount, 0);
  const totalPending = feeRecords.reduce((sum, record) => sum + record.pendingAmount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fees Management</h1>
          <p className="text-muted-foreground">Track student fees and payments</p>
        </div>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Collect Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalCollection.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round((totalCollection / (totalCollection + totalPending)) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search by student name or ID..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Fees Records</CardTitle>
          <CardDescription>Complete overview of student fee payments and pending amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Total Fees</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.course}</TableCell>
                  <TableCell>₹{record.totalFees.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">₹{record.paidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-orange-600">₹{record.pendingAmount.toLocaleString()}</TableCell>
                  <TableCell>{record.installment}</TableCell>
                  <TableCell>
                    <Badge variant={
                      record.status === 'Paid' ? 'default' : 
                      record.status === 'Overdue' ? 'destructive' : 'secondary'
                    }>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      {record.pendingAmount > 0 && (
                        <Button size="sm">Pay</Button>
                      )}
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