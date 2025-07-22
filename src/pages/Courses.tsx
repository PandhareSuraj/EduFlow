import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit, Eye, Users } from "lucide-react";
import { AddCourseDialog } from "@/components/forms/AddCourseDialog";

const courses = [
  {
    id: 1,
    name: "Radiology Technician",
    code: "RT",
    duration: "2 Years",
    fees: "₹75,000",
    students: 45,
    status: "Active",
    description: "Medical imaging and diagnostic procedures"
  },
  {
    id: 2,
    name: "DMLT",
    code: "DMLT",
    duration: "2 Years", 
    fees: "₹65,000",
    students: 38,
    status: "Active",
    description: "Diploma in Medical Laboratory Technology"
  },
  {
    id: 3,
    name: "PGDMLT",
    code: "PGDMLT",
    duration: "1 Year",
    fees: "₹45,000",
    students: 22,
    status: "Active",
    description: "Post Graduate Diploma in Medical Laboratory Technology"
  },
  {
    id: 4,
    name: "Hospital Management",
    code: "HM",
    duration: "1 Year",
    fees: "₹55,000",
    students: 18,
    status: "Active",
    description: "Healthcare administration and management"
  }
];

export default function Courses() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage college courses and programs</p>
        </div>
        <AddCourseDialog />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search courses..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <CardDescription>{course.code} • {course.duration}</CardDescription>
                </div>
                <Badge variant="secondary">{course.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{course.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Course Fees</p>
                  <p className="text-lg font-bold text-primary">{course.fees}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {course.students} students
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