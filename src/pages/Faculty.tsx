import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Edit, Eye, Mail, Phone } from "lucide-react";

const faculty = [
  {
    id: 1,
    name: "Dr. Rajesh Sharma",
    designation: "Head of Department",
    department: "Radiology",
    email: "rajesh.sharma@kkpatil.edu",
    phone: "+91 98765 43210",
    subjects: ["Medical Imaging", "Radiography"],
    experience: "15 years",
    status: "Active"
  },
  {
    id: 2,
    name: "Prof. Priya Patil",
    designation: "Assistant Professor",
    department: "Laboratory Technology",
    email: "priya.patil@kkpatil.edu",
    phone: "+91 98765 43211",
    subjects: ["Clinical Biochemistry", "Microbiology"],
    experience: "8 years",
    status: "Active"
  },
  {
    id: 3,
    name: "Dr. Amit Kumar",
    designation: "Associate Professor",
    department: "Hospital Management",
    email: "amit.kumar@kkpatil.edu",
    phone: "+91 98765 43212",
    subjects: ["Healthcare Administration", "Hospital Operations"],
    experience: "12 years",
    status: "Active"
  },
  {
    id: 4,
    name: "Mrs. Sunita Desai",
    designation: "Lecturer",
    department: "Laboratory Technology",
    email: "sunita.desai@kkpatil.edu",
    phone: "+91 98765 43213",
    subjects: ["Pathology", "Hematology"],
    experience: "6 years",
    status: "Active"
  }
];

export default function Faculty() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty & Staff</h1>
          <p className="text-muted-foreground">Manage teaching staff and faculty members</p>
        </div>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search faculty..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {faculty.map((member) => (
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
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}