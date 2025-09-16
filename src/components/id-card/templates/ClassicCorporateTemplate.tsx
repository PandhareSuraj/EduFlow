import { QrCode } from "lucide-react";
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

interface ClassicCorporateTemplateProps {
  student: Student;
  college: CollegeInfo;
}

export function ClassicCorporateTemplate({ student, college }: ClassicCorporateTemplateProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white border-2 border-primary/20 rounded-lg overflow-hidden shadow-card print:shadow-none print:border-primary print:border-2">
      {/* Header with College Info */}
      <div className="bg-gradient-primary text-white p-4 text-center relative">
        {college.logo_url && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <img src={college.logo_url} alt="College Logo" className="w-8 h-8 object-contain" />
          </div>
        )}
        <h2 className="text-lg font-bold uppercase tracking-wide">{college.name}</h2>
        {college.address && <p className="text-sm opacity-90">{college.address}</p>}
        <p className="text-xs opacity-80 font-medium">STUDENT IDENTITY CARD</p>
      </div>

      {/* Student Photo and Basic Info */}
      <div className="p-4 bg-white">
        <div className="flex items-start space-x-4 mb-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            <Avatar className="w-20 h-24 rounded border-2 border-primary/30">
              {student.photo ? (
                <AvatarImage 
                  src={student.photo} 
                  alt={student.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-lg rounded">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Student Details */}
          <div className="flex-1 space-y-2">
            <div className="border-b border-border pb-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Name</p>
              <p className="font-bold text-sm text-foreground">{student.name}</p>
            </div>
            
            <div className="border-b border-border pb-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Student ID</p>
              <p className="font-mono text-sm font-semibold text-primary">{student.id}</p>
            </div>
            
            <div className="border-b border-border pb-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Course</p>
              <p className="text-sm font-medium text-foreground">{student.course}</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Batch</p>
              <p className="text-sm font-medium text-foreground">{student.batch}</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <p className="text-muted-foreground uppercase tracking-wide font-medium">Admission Date</p>
            <p className="font-medium text-foreground">{new Date(student.admissionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase tracking-wide font-medium">Valid Until</p>
            <p className="font-medium text-foreground">{new Date(student.validUpto).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Contact</p>
          <p className="text-sm font-medium text-foreground">{student.phone}</p>
        </div>

        {/* QR Code and Signature */}
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted border border-border rounded flex items-center justify-center mb-1">
              <QrCode className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">QR Code</p>
          </div>
          
          <div className="text-center">
            {college.signature_url ? (
              <div className="w-20 h-8 mb-1 flex items-end justify-center">
                <img src={college.signature_url} alt="Signature" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-8 border-b border-muted-foreground mb-1"></div>
            )}
            <p className="text-xs text-muted-foreground font-medium">
              {college.signature_title || 'Authorized Signature'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-muted px-4 py-2 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          This card is property of {college.name}. If found, please return to college office.
        </p>
      </div>
    </div>
  );
}