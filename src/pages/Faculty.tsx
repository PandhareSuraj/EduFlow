import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Edit, Eye, Mail, Phone, Filter, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddFacultyDialog } from "@/components/forms/AddFacultyDialog";
import { ViewFacultyDialog, EditFacultyDialog } from "@/components/forms/FacultyDialogs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: string;
  status: string;
  qualification?: string;
  address?: string;
}

export default function Faculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { toast } = useToast();

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      const facultyData: Faculty[] = (data || []).map(member => ({
        id: member.id,
        name: member.name,
        designation: member.designation,
        department: member.department,
        email: member.email,
        phone: member.phone,
        subjects: Array.isArray(member.subjects) ? member.subjects : [],
        experience: member.experience || '',
        status: member.status,
        qualification: member.qualification,
        address: member.address
      }));

      setFaculty(facultyData);
      setFilteredFaculty(facultyData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch faculty data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    let filtered = faculty;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredFaculty(filtered);
  }, [faculty, searchTerm, departmentFilter, statusFilter]);

  const departments = [...new Set(faculty.map(member => member.department))];
  const statuses = [...new Set(faculty.map(member => member.status))];
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty & Staff</h1>
          <p className="text-muted-foreground">Manage teaching staff and faculty members</p>
        </div>
        <AddFacultyDialog onSuccess={fetchFaculty} />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search faculty..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredFaculty.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No faculty members found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.designation}</CardDescription>
                </div>
                <Badge variant="secondary">{member.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm"><strong>Department:</strong> {member.department}</p>
                <p className="text-sm"><strong>Experience:</strong> {member.experience}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Subjects:</p>
                <div className="flex flex-wrap gap-1">
                  {member.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {member.phone}
                </div>
              </div>

              <div className="flex gap-2">
                <ViewFacultyDialog faculty={member} />
                <EditFacultyDialog faculty={member} />
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}