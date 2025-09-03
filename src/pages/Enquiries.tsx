import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Phone, Mail, MessageSquare, Loader2 } from "lucide-react";
import { AddEnquiryDialog } from "@/components/forms/AddEnquiryDialog";
import { ViewEnquiryDialog, EditEnquiryDialog } from "@/components/forms/EnquiryDialogs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  source: string;
  status: string;
  followUpDate: string;
  assignedTo: string;
  createdDate: string;
  notes?: string;
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enquiriesData = (data || []).map(enquiry => ({
        id: enquiry.id,
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email || '',
        course: enquiry.course,
        source: enquiry.source,
        status: enquiry.status,
        followUpDate: enquiry.follow_up_date ? new Date(enquiry.follow_up_date).toLocaleDateString() : 'Not Set',
        assignedTo: enquiry.assigned_to || 'Not Assigned',
        createdDate: new Date(enquiry.created_at).toLocaleDateString(),
        notes: enquiry.notes || ''
      }));

      setEnquiries(enquiriesData);
      setFilteredEnquiries(enquiriesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch enquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    let filtered = enquiries;

    if (searchTerm) {
      filtered = filtered.filter(enquiry =>
        enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.phone.includes(searchTerm) ||
        enquiry.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEnquiries(filtered);
  }, [enquiries, searchTerm]);

  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status.toLowerCase() === 'new').length,
    contacted: enquiries.filter(e => e.status.toLowerCase() === 'contacted').length,
    converted: enquiries.filter(e => e.status.toLowerCase() === 'converted').length
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enquiries & Leads</h1>
          <p className="text-muted-foreground">Manage admission enquiries and follow-ups</p>
        </div>
        <AddEnquiryDialog onSuccess={fetchEnquiries} />
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
              <Input 
                placeholder="Search enquiries..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
          {loading ? (
            <div className="flex justify-center items-center min-h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                {filteredEnquiries.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>{enquiry.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {enquiry.phone}
                        </div>
                        {enquiry.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {enquiry.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{enquiry.course}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{enquiry.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        enquiry.status === 'new' ? 'default' :
                        enquiry.status === 'contacted' ? 'secondary' :
                        enquiry.status === 'interested' ? 'outline' :
                        'default'
                      }>
                        {enquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{enquiry.followUpDate}</TableCell>
                    <TableCell>{enquiry.assignedTo}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <ViewEnquiryDialog enquiry={enquiry} />
                        <EditEnquiryDialog 
                          enquiry={enquiry}
                          onSuccess={fetchEnquiries}
                          trigger={
                            <Button size="sm">Follow Up</Button>
                          }
                        />
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