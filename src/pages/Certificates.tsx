import { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FileText, Award, Plus, Search, Loader2, Pencil, Trash2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useBranding } from "@/hooks/useBranding";
import {
  CertificateStudentForm,
  type CertificateStudent,
} from "@/components/certificates/CertificateStudentForm";
import {
  generateTransferCertificatePDF,
  type CertificateCollege,
} from "@/components/certificates/pdf/TransferCertificatePDF";
import { generateBonafideCertificatePDF } from "@/components/certificates/pdf/BonafideCertificatePDF";
import { generateDomicileCertificatePDF } from "@/components/certificates/pdf/DomicileCertificatePDF";
import type { CertificateLang } from "@/components/certificates/pdf/pdfUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Certificates() {
  usePageTitle("Certificates");
  const { toast } = useToast();
  const branding = useBranding();

  const [students, setStudents] = useState<CertificateStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CertificateStudent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [language, setLanguage] = useState<CertificateLang>("en");

  const debouncedSearch = useDebounce(searchTerm, 300);

  const college: CertificateCollege = {
    name: branding.collegeName,
    code: branding.collegeCode,
    address: branding.address,
    phone: branding.phone,
    email: branding.email,
    website: branding.website,
    logoUrl: branding.logoUrl,
    signatureTitle: branding.signatureTitle,
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("certificate_students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setStudents((data as CertificateStudent[]) || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to load certificate records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        (s.register_no || "").toLowerCase().includes(q) ||
        (s.course || "").toLowerCase().includes(q)
    );
  }, [students, debouncedSearch]);

  const stats = useMemo(
    () => ({
      total: students.length,
      tc: students.filter((s) => s.tc_no && s.tc_no.trim() !== "").length,
      bonafide: students.filter((s) => s.bonafide_no && s.bonafide_no.trim() !== "").length,
    }),
    [students]
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("certificate_students").delete().eq("id", deleteId);
      if (error) throw error;
      toast({ title: "Deleted", description: "Record removed" });
      setStudents((prev) => prev.filter((s) => s.id !== deleteId));
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const handleTC = async (s: CertificateStudent) => {
    try {
      await generateTransferCertificatePDF(s, college);
      toast({ title: "TC generated", description: "Download started" });
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to generate TC", variant: "destructive" });
    }
  };

  const handleBonafide = async (s: CertificateStudent) => {
    try {
      await generateBonafideCertificatePDF(s, college);
      toast({ title: "Bonafide generated", description: "Download started" });
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to generate Bonafide", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground">
            Manage student records and generate Transfer (TC) & Bonafide certificates
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">TC Issued</p>
                <p className="text-3xl font-bold text-success">{stats.tc}</p>
              </div>
              <FileText className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bonafide Issued</p>
                <p className="text-3xl font-bold text-warning">{stats.bonafide}</p>
              </div>
              <Award className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, register no, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Student Records ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No records yet. Click "Add Student" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Register No</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.register_no || "-"}</TableCell>
                    <TableCell>{s.course || "-"}</TableCell>
                    <TableCell>{s.class || "-"}</TableCell>
                    <TableCell>{s.academic_year || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => handleTC(s)}>
                          <FileDown className="mr-1 h-3.5 w-3.5" />
                          TC
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBonafide(s)}>
                          <Award className="mr-1 h-3.5 w-3.5" />
                          Bonafide
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(s.id!)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CertificateStudentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        onSaved={fetchStudents}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The student record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
