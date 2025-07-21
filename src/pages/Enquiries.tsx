import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Phone, Mail, MessageSquare } from "lucide-react";

const enquiries = [
  {
    id: "ENQ001",
    name: "Sneha Patil",
    phone: "+91 98765 12345",
    email: "sneha.patil@email.com",
    course: "DMLT",
    source: "Website",
    status: "New",
    followUpDate: "2024-01-25",
    assignedTo: "Priya Sharma",
    createdDate: "2024-01-20"
  },
  {
    id: "ENQ002", 
    name: "Rahul Kumar",
    phone: "+91 98765 12346",
    email: "rahul.kumar@email.com",
    course: "Radiology Technician",
    source: "Walk-in",
    status: "Contacted",
    followUpDate: "2024-01-26",
    assignedTo: "Amit Desai",
    createdDate: "2024-01-18"
  },
  {
    id: "ENQ003",
    name: "Kavita Sharma",
    phone: "+91 98765 12347", 
    email: "kavita.sharma@email.com",
    course: "Hospital Management",
    source: "Referral",
    status: "Interested",
    followUpDate: "2024-01-27",
    assignedTo: "Priya Sharma",
    createdDate: "2024-01-15"
  },
  {
    id: "ENQ004",
    name: "Manoj Patil",
    phone: "+91 98765 12348",
    email: "manoj.patil@email.com", 
    course: "PGDMLT",
    source: "Facebook",
    status: "Converted",
    followUpDate: "-",
    assignedTo: "Amit Desai",
    createdDate: "2024-01-10"
  }
];

const stats = {
  total: enquiries.length,
  new: enquiries.filter(e => e.status === 'New').length,
  contacted: enquiries.filter(e => e.status === 'Contacted').length,
  converted: enquiries.filter(e => e.status === 'Converted').length
};

export default function Enquiries() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enquiries & Leads</h1>
          <p className="text-muted-foreground">Manage admission enquiries and follow-ups</p>
        </div>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Add Enquiry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.contacted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search enquiries..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiries List</CardTitle>
          <CardDescription>Track and manage all admission enquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enquiry ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Follow Up</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{enquiry.id}</TableCell>
                  <TableCell>{enquiry.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {enquiry.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {enquiry.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{enquiry.course}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{enquiry.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      enquiry.status === 'New' ? 'default' :
                      enquiry.status === 'Contacted' ? 'secondary' :
                      enquiry.status === 'Interested' ? 'outline' :
                      'default'
                    }>
                      {enquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{enquiry.followUpDate}</TableCell>
                  <TableCell>{enquiry.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button size="sm">Follow Up</Button>
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