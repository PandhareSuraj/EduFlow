import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { AddSubjectDialog } from "./AddSubjectDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function SubjectManagement() {
  const { subjects, courses, loading, updateSubject, deleteSubject } = useSubjects();
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    description: "",
    credits: 1,
    course_id: "",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const handleEdit = (subject: any) => {
    setEditingSubject(subject);
    setEditForm({
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      credits: subject.credits || 1,
      course_id: subject.course_id.toString(),
    });
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!editingSubject || !editForm.name.trim() || !editForm.code.trim()) return;
    
    setUpdating(true);
    const success = await updateSubject(editingSubject.id, {
      name: editForm.name.trim(),
      code: editForm.code.trim(),
      description: editForm.description.trim() || undefined,
      credits: editForm.credits,
      course_id: parseInt(editForm.course_id),
    });
    
    if (success) {
      setEditDialogOpen(false);
      setEditingSubject(null);
    }
    setUpdating(false);
  };

  const handleDelete = async (subject: any) => {
    await deleteSubject(subject.id);
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.name} (${course.code})` : 'Unknown Course';
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !courseFilter || subject.course_id.toString() === courseFilter;
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Subject Management</h4>
        <AddSubjectDialog />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No subjects found.</p>
          <p className="text-sm">
            {searchTerm || courseFilter 
              ? "Try adjusting your search or filter." 
              : "Add your first subject to get started."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="flex justify-between items-start p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{subject.name}</h4>
                  <Badge variant="secondary" className="text-xs">{subject.code}</Badge>
                  {subject.credits && (
                    <Badge variant="outline" className="text-xs">
                      {subject.credits} credits
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Course: {getCourseName(subject.course_id)}
                </p>
                {subject.description && (
                  <p className="text-sm text-muted-foreground">{subject.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(subject)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{subject.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(subject)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Subject Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the subject information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-course">Course *</Label>
              <Select
                value={editForm.course_id}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, course_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Subject Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Subject name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Subject Code *</Label>
              <Input
                id="edit-code"
                value={editForm.code}
                onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Subject code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credits">Credits</Label>
              <Input
                id="edit-credits"
                type="number"
                min="1"
                max="10"
                value={editForm.credits}
                onChange={(e) => setEditForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Subject description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubmit} 
              disabled={updating || !editForm.name.trim() || !editForm.code.trim()}
            >
              {updating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}