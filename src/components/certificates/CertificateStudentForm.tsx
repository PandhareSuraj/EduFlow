import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CertificateStudent {
  id?: string;
  full_name: string;
  mother_name?: string | null;
  father_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  date_of_birth_words?: string | null;
  place_of_birth?: string | null;
  nationality?: string | null;
  religion?: string | null;
  caste?: string | null;
  blood_group?: string | null;
  course?: string | null;
  class?: string | null;
  register_no?: string | null;
  college_code?: string | null;
  academic_year?: string | null;
  date_of_admission?: string | null;
  date_of_leaving?: string | null;
  subjects?: string | null;
  previous_exam_details?: string | null;
  conduct?: string | null;
  character?: string | null;
  exam_appeared?: boolean | null;
  exam_name?: string | null;
  exam_session?: string | null;
  result?: string | null;
  seat_no?: string | null;
  remarks?: string | null;
  tc_no?: string | null;
  bonafide_no?: string | null;
  domicile_no?: string | null;
  taluka?: string | null;
  district?: string | null;
  state?: string | null;
  residence_years?: string | null;
  mother_tongue?: string | null;
  sub_caste?: string | null;
  previous_school?: string | null;
  study_progress?: string | null;
  leaving_reason?: string | null;
  studying_since?: string | null;
  general_register_no?: string | null;
}

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(150),
  mother_name: z.string().trim().max(150).optional().or(z.literal("")),
  father_name: z.string().trim().max(150).optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  date_of_birth_words: z.string().trim().max(200).optional().or(z.literal("")),
  place_of_birth: z.string().trim().max(150).optional().or(z.literal("")),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  religion: z.string().trim().max(100).optional().or(z.literal("")),
  caste: z.string().trim().max(100).optional().or(z.literal("")),
  blood_group: z.string().trim().max(10).optional().or(z.literal("")),
  course: z.string().trim().max(150).optional().or(z.literal("")),
  class: z.string().trim().max(100).optional().or(z.literal("")),
  register_no: z.string().trim().max(100).optional().or(z.literal("")),
  college_code: z.string().trim().max(50).optional().or(z.literal("")),
  academic_year: z.string().trim().max(50).optional().or(z.literal("")),
  date_of_admission: z.string().optional().or(z.literal("")),
  date_of_leaving: z.string().optional().or(z.literal("")),
  subjects: z.string().trim().max(500).optional().or(z.literal("")),
  previous_exam_details: z.string().trim().max(500).optional().or(z.literal("")),
  conduct: z.string().trim().max(100).optional().or(z.literal("")),
  character: z.string().trim().max(100).optional().or(z.literal("")),
  exam_name: z.string().trim().max(150).optional().or(z.literal("")),
  exam_session: z.string().trim().max(100).optional().or(z.literal("")),
  result: z.string().max(20).optional().or(z.literal("")),
  seat_no: z.string().trim().max(50).optional().or(z.literal("")),
  remarks: z.string().trim().max(500).optional().or(z.literal("")),
  tc_no: z.string().trim().max(50).optional().or(z.literal("")),
  bonafide_no: z.string().trim().max(50).optional().or(z.literal("")),
  domicile_no: z.string().trim().max(50).optional().or(z.literal("")),
  taluka: z.string().trim().max(100).optional().or(z.literal("")),
  district: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  residence_years: z.string().trim().max(20).optional().or(z.literal("")),
  mother_tongue: z.string().trim().max(100).optional().or(z.literal("")),
  sub_caste: z.string().trim().max(100).optional().or(z.literal("")),
  previous_school: z.string().trim().max(300).optional().or(z.literal("")),
  study_progress: z.string().trim().max(150).optional().or(z.literal("")),
  leaving_reason: z.string().trim().max(300).optional().or(z.literal("")),
  studying_since: z.string().trim().max(300).optional().or(z.literal("")),
  general_register_no: z.string().trim().max(50).optional().or(z.literal("")),
});

const emptyForm: CertificateStudent = {
  full_name: "",
  mother_name: "",
  father_name: "",
  gender: "",
  date_of_birth: "",
  date_of_birth_words: "",
  place_of_birth: "",
  nationality: "Indian",
  religion: "",
  caste: "",
  blood_group: "",
  course: "",
  class: "",
  register_no: "",
  college_code: "",
  academic_year: "",
  date_of_admission: "",
  date_of_leaving: "",
  subjects: "",
  previous_exam_details: "",
  conduct: "",
  character: "",
  exam_appeared: true,
  exam_name: "",
  exam_session: "",
  result: "",
  seat_no: "",
  remarks: "",
  tc_no: "",
  bonafide_no: "",
  domicile_no: "",
  taluka: "",
  district: "",
  state: "Maharashtra",
  residence_years: "",
  mother_tongue: "",
  sub_caste: "",
  previous_school: "",
  study_progress: "Good",
  leaving_reason: "",
  studying_since: "",
  general_register_no: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: CertificateStudent | null;
  onSaved: () => void;
}

export function CertificateStudentForm({ open, onOpenChange, student, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<CertificateStudent>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(student ? { ...emptyForm, ...student } : emptyForm);
    }
  }, [open, student]);

  const set = (key: keyof CertificateStudent, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Validation error",
        description: parsed.error.errors[0]?.message || "Please check the form",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: any = { ...form };
      // Normalize empty strings to null for nullable/date fields
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      delete payload.id;

      if (student?.id) {
        const { error } = await supabase
          .from("certificate_students")
          .update(payload)
          .eq("id", student.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Student record updated" });
      } else {
        const { error } = await supabase.from("certificate_students").insert(payload);
        if (error) throw error;
        toast({ title: "Added", description: "Student record added" });
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to save record",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof CertificateStudent, type = "text") => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student?.id ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Identity</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Full Name *", "full_name")}
              {field("Mother's Name", "mother_name")}
              {field("Father's / Guardian Name", "father_name")}
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Personal</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Date of Birth", "date_of_birth", "date")}
              {field("Date of Birth (in words)", "date_of_birth_words")}
              {field("Place of Birth", "place_of_birth")}
              {field("Nationality", "nationality")}
              {field("Mother Tongue", "mother_tongue")}
              {field("Religion", "religion")}
              {field("Caste", "caste")}
              {field("Sub-Caste", "sub_caste")}
              {field("Blood Group", "blood_group")}
              {field("Taluka", "taluka")}
              {field("District", "district")}
              {field("State", "state")}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Academic</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Course / Branch", "course")}
              {field("Class", "class")}
              {field("Register No / PRN", "register_no")}
              {field("College Code", "college_code")}
              {field("Academic Year", "academic_year")}
              {field("Date of Admission", "date_of_admission", "date")}
              {field("Date of Leaving", "date_of_leaving", "date")}
              {field("Progress in Studies", "study_progress")}
              {field("General Register No.", "general_register_no")}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="previous_school">Previous School &amp; Class</Label>
                <Textarea
                  id="previous_school"
                  value={form.previous_school ?? ""}
                  onChange={(e) => set("previous_school", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="studying_since">Class studied in &amp; since when</Label>
                <Textarea
                  id="studying_since"
                  value={form.studying_since ?? ""}
                  onChange={(e) => set("studying_since", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="leaving_reason">Reason for Leaving School</Label>
                <Textarea
                  id="leaving_reason"
                  value={form.leaving_reason ?? ""}
                  onChange={(e) => set("leaving_reason", e.target.value)}
                  placeholder="e.g. On request of student / parent"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="subjects">Subjects</Label>
                <Textarea
                  id="subjects"
                  value={form.subjects ?? ""}
                  onChange={(e) => set("subjects", e.target.value)}
                  placeholder="e.g. English (Com.), S.L., Major, Minor..."
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="previous_exam_details">Previous Exam Details</Label>
                <Textarea
                  id="previous_exam_details"
                  value={form.previous_exam_details ?? ""}
                  onChange={(e) => set("previous_exam_details", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Certificate Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Conduct", "conduct")}
              {field("Character", "character")}
              <div className="space-y-1.5">
                <Label>Exam Appeared</Label>
                <Select
                  value={form.exam_appeared ? "yes" : "no"}
                  onValueChange={(v) => set("exam_appeared", v === "yes")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Appeared</SelectItem>
                    <SelectItem value="no">Not Appeared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {field("Exam Name", "exam_name")}
              {field("Exam Session (Summer/Winter)", "exam_session")}
              <div className="space-y-1.5">
                <Label>Result</Label>
                <Select value={form.result ?? ""} onValueChange={(v) => set("result", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {field("Seat No", "seat_no")}
              {field("T.C. No", "tc_no")}
              {field("Bonafide No", "bonafide_no")}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={form.remarks ?? ""}
                  onChange={(e) => set("remarks", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Domicile Details
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              The Domicile certificate uses "Place of Birth" (from the Personal
              section) as the Village / Town.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Domicile No", "domicile_no")}
              {field("Taluka", "taluka")}
              {field("District", "district")}
              {field("State", "state")}
              {field("Years of Residence", "residence_years")}
            </div>

          </section>
        </div>


        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {student?.id ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
