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

interface ModernMinimalTemplateProps {
  student: Student;
  college: CollegeInfo;
}

export function ModernMinimalTemplate({ student, college }: ModernMinimalTemplateProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-card rounded-2xl overflow-hidden shadow-glow print:shadow-none print:border print:border-foreground">
      {/* Minimal Header */}
      <div className="bg-gradient-to-r from-primary to-primary-glow text-white p-6 text-center relative">
        {college.logo_url && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <img src={college.logo_url} alt="College Logo" className="w-10 h-10 object-contain" />
          </div>
        )}
        <h1 className="text-xl font-light tracking-wider">{college.name}</h1>
        <div className="w-12 h-0.5 bg-white/50 mx-auto mt-2"></div>
      </div>

      {/* Student Photo - Centered */}
      <div className="p-6 text-center">
        <div className="relative inline-block mb-4">
          <Avatar className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg">
            {student.photo ? (
              <AvatarImage 
                src={student.photo} 
                alt={student.name}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Student Name */}
        <h2 className="text-xl font-semibold text-foreground mb-1">{student.name}</h2>
        <p className="text-primary font-mono text-sm font-medium mb-4">{student.id}</p>

        {/* Clean Info Grid */}
        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Course</span>
            <span className="text-sm font-medium text-foreground">{student.course}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Batch</span>
            <span className="text-sm font-medium text-foreground">{student.batch}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Valid Until</span>
            <span className="text-sm font-medium text-foreground">{new Date(student.validUpto).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
          {/* QR Code */}
          <div className="text-center">
            <div className="w-14 h-14 bg-muted/50 rounded-lg flex items-center justify-center mb-1">
              <QrCode className="w-10 h-10 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Verify</p>
          </div>

          {/* Signature */}
          <div className="text-center">
            {college.signature_url ? (
              <div className="w-20 h-8 mb-1 flex items-end justify-center">
                <img src={college.signature_url} alt="Signature" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-8 flex items-end justify-center mb-1">
                <div className="w-full h-0.5 bg-primary/30"></div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {college.signature_title || 'Authority'}
            </p>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="bg-primary/5 px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          {college.name} • Student ID Card
        </p>
      </div>
    </div>
  );
}