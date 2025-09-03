import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { AddDepartmentDialog } from "./AddDepartmentDialog";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function DepartmentManagement() {
  const { departments, loading, updateDepartment, deleteDepartment } = useDepartments();
  const [editingDept, setEditingDept] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", description: "" });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleEdit = (dept: any) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!editingDept || !editForm.name.trim()) return;
    
    setUpdating(true);
    const success = await updateDepartment(editingDept.id, {
      name: editForm.name.trim(),
      code: editForm.code.trim() || undefined,
      description: editForm.description.trim() || undefined,
    });
    
    if (success) {
      setEditDialogOpen(false);
      setEditingDept(null);
    }
    setUpdating(false);
  };

  const handleDelete = async (dept: any) => {
    await deleteDepartment(dept.id);
  };

  if (loading) {
    return <div className="text-center py-4">Loading departments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">College Departments</h4>
        <AddDepartmentDialog />
      </div>
      
      {departments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No departments found.</p>
          <p className="text-sm">Add your first department to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {departments.map((dept) => (
            <div key={dept.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{dept.name}</h4>
                  {dept.code && (
                    <Badge variant="secondary" className="text-xs">{dept.code}</Badge>
                  )}
                </div>
                {dept.description && (
                  <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(dept)}
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
                      <AlertDialogTitle>Delete Department</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{dept.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(dept)}>
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

      {/* Edit Department Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the department information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Department Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Department name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Department Code</Label>
              <Input
                id="edit-code"
                value={editForm.code}
                onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Department code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Department description"
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
              disabled={updating || !editForm.name.trim()}
            >
              {updating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}