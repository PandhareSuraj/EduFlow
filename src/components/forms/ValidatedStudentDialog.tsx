import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedForm, ValidatedFormField } from "@/components/ui/validated-form";
import { FormSchemas } from "@/lib/validationSchemas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCollege } from "@/contexts/CollegeContext";
import { useState, useEffect } from "react";

interface Course {
  id: number;
  name: string;
  code: string;
}

interface ValidatedStudentDialogProps {
  onStudentAdded?: () => void;
  trigger?: React.ReactNode;
}

export function ValidatedStudentDialog({ onStudentAdded, trigger }: ValidatedStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { toast } = useToast();
  const { college } = useCollege();

  // Load courses from Supabase
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, code')
          .eq('status', 'active')
          .order('name');

        if (error) {
          console.error('Error loading courses:', error);
          toast({
            title: "Error",
            description: "Failed to load courses",
            variant: "destructive",
          });
        } else {
          setCourses(data || []);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (open) {
      loadCourses();
    }
  }, [toast, open]);

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      // Check if email already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (existingStudent) {
        toast({
          title: "Error",
          description: "A student with this email already exists",
          variant: "destructive",
        });
        return;
      }

      // Insert student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          mobile_number: formData.mobile_number.replace(/\D/g, ''),
          course_id: parseInt(formData.course_id),
          year: formData.year || 1,
          semester: formData.semester || 1,
          college_id: college?.id,
          status: 'active',
          admission_date: formData.admission_date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (studentError) {
        console.error('Error inserting student:', studentError);
        toast({
          title: "Error",
          description: studentError.message || "Failed to add student. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Student ${formData.name} added successfully with ID: ${studentData.student_id}!`,
      });

      setOpen(false);
      onStudentAdded?.();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student (New)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <ValidatedForm
          schema={FormSchemas.addStudent}
          onSubmit={handleSubmit}
          resetOnSubmit={true}
          submitButtonText="Add Student"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            <ValidatedFormField name="name">
              {({ value, onChange, onValidationChange, error }) => (
                <ValidatedInput
                  id="name"
                  label="Full Name"
                  validationType="name"
                  value={value}
                  onChange={onChange}
                  onValidationChange={onValidationChange}
                  required
                />
              )}
            </ValidatedFormField>

            <ValidatedFormField name="email">
              {({ value, onChange, onValidationChange, error }) => (
                <ValidatedInput
                  id="email"
                  label="Email Address"
                  type="email"
                  validationType="email"
                  value={value}
                  onChange={onChange}
                  onValidationChange={onValidationChange}
                  required
                />
              )}
            </ValidatedFormField>

            <ValidatedFormField name="mobile_number">
              {({ value, onChange, onValidationChange, error }) => (
                <ValidatedInput
                  id="mobile_number"
                  label="Mobile Number"
                  validationType="phone"
                  value={value}
                  onChange={onChange}
                  onValidationChange={onValidationChange}
                  required
                  mask="phone"
                  formatValue
                />
              )}
            </ValidatedFormField>

            <ValidatedFormField name="course_id">
              {({ value, onChange, onValidationChange, error }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Course <span className="text-destructive">*</span>
                  </label>
                  <Select value={value} onValueChange={(val) => {
                    onChange(val);
                    onValidationChange(!!val, val ? undefined : "Please select a course");
                  }}>
                    <SelectTrigger className={error ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCourses ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading courses...</div>
                      ) : courses.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No courses available</div>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
              )}
            </ValidatedFormField>

            <div className="grid grid-cols-2 gap-4">
              <ValidatedFormField name="semester">
                {({ value, onChange, onValidationChange, error }) => (
                  <ValidatedInput
                    id="semester"
                    label="Semester"
                    type="number"
                    validationType="semester"
                    value={value?.toString() || "1"}
                    onChange={(val) => onChange(parseInt(val) || 1)}
                    onValidationChange={onValidationChange}
                    min={1}
                    max={10}
                  />
                )}
              </ValidatedFormField>

              <ValidatedFormField name="year">
                {({ value, onChange, onValidationChange, error }) => (
                  <ValidatedInput
                    id="year"
                    label="Year"
                    type="number"
                    validationType="year"
                    value={value?.toString() || "1"}
                    onChange={(val) => onChange(parseInt(val) || 1)}
                    onValidationChange={onValidationChange}
                    min={1}
                    max={6}
                  />
                )}
              </ValidatedFormField>
            </div>

            <ValidatedFormField name="admission_date">
              {({ value, onChange, onValidationChange, error }) => (
                <ValidatedInput
                  id="admission_date"
                  label="Admission Date"
                  type="date"
                  value={value || new Date().toISOString().split('T')[0]}
                  onChange={onChange}
                  onValidationChange={onValidationChange}
                />
              )}
            </ValidatedFormField>
          </div>
        </ValidatedForm>
      </DialogContent>
    </Dialog>
  );
}