import { useState, useEffect, useMemo, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Edit, Eye, Mail, Phone, Filter, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddFacultyDialog } from "@/components/forms/AddFacultyDialog";
import { ViewFacultyDialog, EditFacultyDialog } from "@/components/forms/FacultyDialogs";
import { CreateFacultyLoginDialog } from "@/components/forms/CreateFacultyLoginDialog";
import { ManageFacultyLoginDialog } from "@/components/forms/ManageFacultyLoginDialog";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/useDepartments";
import { useDebounce } from "@/hooks/useDebounce";

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
  user_id?: string;
}

export default function Faculty() {
  usePageTitle("Faculty");
  
  const { departments } = useDepartments();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchFaculty = async () => {
    try {
      setLoading(true);
    const { data, error } = await supabase
        .from('faculty')
        .select('*, user_id')
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
        address: member.address,
        user_id: member.user_id
      }));

      setFaculty(facultyData);
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

  // Debounce search for performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Memoized filtered faculty
  const filteredFaculty = useMemo(() => {
    let filtered = faculty;

    if (debouncedSearch) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.designation.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        member.department.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    return filtered;
  }, [faculty, debouncedSearch, departmentFilter, statusFilter]);

  // Memoized unique statuses
  const statuses = useMemo(() => 
    [...new Set(faculty.map(member => member.status).filter(status => status && status.trim() !== ""))],
    [faculty]
  );
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty & Staff</h1>
          <p className="text-muted-foreground">Manage teaching staff and faculty members</p>
        </div>
        <PermissionWrapper permission="FACULTY_CREATE">
          <AddFacultyDialog onSuccess={fetchFaculty} />
        </PermissionWrapper>
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
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
                <div className="flex gap-1">
                  <Badge variant="secondary">{member.status}</Badge>
                  {member.user_id ? (
                    <Badge variant="default" className="text-xs">Has Login</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">No Login</Badge>
                  )}
                </div>
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

              <div className="flex gap-2 flex-wrap">
                <ViewFacultyDialog faculty={member} />
                <EditFacultyDialog faculty={member} onSuccess={fetchFaculty} />
                {member.user_id ? (
                  <ManageFacultyLoginDialog faculty={member} onSuccess={fetchFaculty} />
                ) : (
                  <CreateFacultyLoginDialog faculty={member} onSuccess={fetchFaculty} />
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}