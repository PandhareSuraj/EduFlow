import { QrCode, Star } from "lucide-react";
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

interface ContemporaryCardTemplateProps {
  student: Student;
  college: CollegeInfo;
}

export function ContemporaryCardTemplate({ student, college }: ContemporaryCardTemplateProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-white to-primary/5 rounded-3xl overflow-hidden shadow-glow border border-primary/20 print:shadow-none print:border-foreground">
      {/* Dynamic Header */}
      <div className="relative bg-gradient-to-r from-primary via-primary-glow to-accent text-white p-5">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 w-20 h-20 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-16 h-16 border border-white/30 rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {college.logo_url ? (
                <img src={college.logo_url} alt="College Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Star className="w-8 h-8 text-white" />
              )}
              <div className="w-px h-8 bg-white/30"></div>
            </div>
            <h1 className="text-lg font-bold tracking-wide">{college.name}</h1>
            {college.address && <p className="text-sm opacity-90">{college.address}</p>}
          </div>
          
          <div className="text-right">
            <p className="text-xs font-semibold tracking-widest opacity-80">ID CARD</p>
            <div className="w-8 h-1 bg-white/50 rounded-full mt-1 ml-auto"></div>
          </div>
        </div>
      </div>

      {/* Modern Content Layout */}
      <div className="p-5">
        {/* Student Photo with Overlay */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <Avatar className="w-20 h-20 rounded-2xl border-3 border-white shadow-lg">
              {student.photo ? (
                <AvatarImage 
                  src={student.photo} 
                  alt={student.name}
                  className="object-cover rounded-2xl"
                />
              ) : (
                <AvatarFallback className="bg-gradient-primary text-white text-xl font-bold rounded-2xl">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-xl border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-1">{student.name}</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-mono font-semibold">
                {student.id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{student.course}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-3 border border-primary/20">
            <p className="text-xs text-primary font-semibold uppercase tracking-wide">Batch</p>
            <p className="text-sm font-bold text-foreground">{student.batch}</p>
          </div>
          
          <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-3 border border-accent/20">
            <p className="text-xs text-accent font-semibold uppercase tracking-wide">Valid Until</p>
            <p className="text-sm font-bold text-foreground">{new Date(student.validUpto).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-muted/30 rounded-2xl p-3 mb-5">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Contact</p>
          <p className="text-sm font-medium text-foreground">{student.phone}</p>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center">
          {/* QR Code */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-2 border border-primary/30">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Scan to Verify</p>
          </div>

          {/* Signature */}
          <div className="text-center">
            {college.signature_url ? (
              <div className="w-20 h-10 mb-2 flex items-end justify-center">
                <img src={college.signature_url} alt="Digital Signature" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-10 mb-2 flex items-end justify-center">
                <div className="w-full h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
              </div>
            )}
            <p className="text-xs text-muted-foreground font-medium">
              {college.signature_title || 'Digital Authority'}
            </p>
          </div>
        </div>
      </div>

      {/* Contemporary Footer */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          {college.name} • Official Student ID • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}