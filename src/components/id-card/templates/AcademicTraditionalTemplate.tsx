import { QrCode, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Student {
  id: string;
  name: string;
  course: string;
  batch: string;
  phone: string;
  admissionDate: string;
  validUpto: string;
  photo?: string | null;
}

interface CollegeInfo {
  name: string;
  address?: string;
  logo_url?: string;
  signature_url?: string;
  signature_title?: string;
}

interface AcademicTraditionalTemplateProps {
  student: Student;
  college: CollegeInfo;
}

export function AcademicTraditionalTemplate({ student, college }: AcademicTraditionalTemplateProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white border-4 border-double border-primary/40 rounded-lg overflow-hidden shadow-card print:shadow-none print:border-foreground">
      {/* Traditional Header with Crest */}
      <div className="bg-gradient-to-b from-primary to-primary-glow text-white p-4 relative">
        <div className="flex items-center justify-center mb-2">
          {college.logo_url ? (
            <img src={college.logo_url} alt="College Crest" className="w-12 h-12 object-contain" />
          ) : (
            <Shield className="w-12 h-12 text-white" />
          )}
        </div>
        <h1 className="text-center text-lg font-bold tracking-wide">{college.name}</h1>
        {college.address && <p className="text-center text-sm opacity-90 mt-1">{college.address}</p>}
        
        {/* Decorative Elements */}
        <div className="flex justify-center mt-2">
          <div className="w-20 h-px bg-white/50"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full mx-2 mt-[-4px]"></div>
          <div className="w-20 h-px bg-white/50"></div>
        </div>
        
        <p className="text-center text-xs font-semibold mt-2 tracking-widest">STUDENT IDENTIFICATION</p>
      </div>

      {/* Main Content */}
      <div className="p-5 bg-white">
        {/* Student Photo and Core Info */}
        <div className="flex items-start space-x-4 mb-5">
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="w-20 h-24 rounded border-2 border-primary/40 shadow-md">
                {student.photo ? (
                  <AvatarImage 
                    src={student.photo} 
                    alt={student.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-lg rounded font-semibold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Corner decoration */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-primary/40"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-primary/40"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-primary/40"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-primary/40"></div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="border border-border/50 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase font-medium">Student Name</p>
              <p className="font-bold text-sm text-foreground">{student.name}</p>
            </div>
            
            <div className="border border-border/50 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase font-medium">Registration No.</p>
              <p className="font-mono text-sm font-bold text-primary">{student.id}</p>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border/50 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase font-medium">Course of Study</p>
              <p className="text-sm font-medium text-foreground">{student.course}</p>
            </div>
            <div className="border border-border/50 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase font-medium">Academic Year</p>
              <p className="text-sm font-medium text-foreground">{student.batch}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border/50 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase font-medium">Date of Issue</p>
              <p className="text-sm font-medium text-foreground">{new Date(student.admissionDate).toLocaleDateString()}</p>
            </div>
            <div className="border border-border/50 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase font-medium">Valid Until</p>
              <p className="text-sm font-medium text-foreground">{new Date(student.validUpto).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Authentication Section */}
        <div className="flex justify-between items-end pt-3 border-t border-border/50">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-primary/30 rounded flex items-center justify-center mb-2">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Authentication Code</p>
          </div>
          
          <div className="text-center">
            <div className="w-24 text-center">
              {college.signature_url ? (
                <div className="w-24 h-10 mb-1 flex items-end justify-center">
                  <img src={college.signature_url} alt="Official Signature" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-10 border-b-2 border-primary/40 mb-1"></div>
              )}
              <p className="text-xs text-muted-foreground font-medium">
                {college.signature_title || 'Registrar'}
              </p>
              <p className="text-xs text-muted-foreground">Official Seal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Footer */}
      <div className="bg-primary/5 px-4 py-3 text-center border-t-2 border-primary/20">
        <p className="text-xs text-foreground font-medium">
          This document serves as official identification for the named student
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Property of {college.name} - Return if found
        </p>
      </div>
    </div>
  );
}