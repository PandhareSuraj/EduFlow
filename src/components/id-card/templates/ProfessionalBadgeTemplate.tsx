import { QrCode, Shield, AlertTriangle } from "lucide-react";
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

interface ProfessionalBadgeTemplateProps {
  student: Student;
  college: CollegeInfo;
}

export function ProfessionalBadgeTemplate({ student, college }: ProfessionalBadgeTemplateProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white border-2 border-destructive/30 rounded-lg overflow-hidden shadow-card print:shadow-none print:border-foreground">
      {/* Security Header */}
      <div className="bg-gradient-to-r from-destructive to-destructive/80 text-white p-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {college.logo_url ? (
              <img src={college.logo_url} alt="Institution Badge" className="w-8 h-8 object-contain" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
            <div>
              <p className="text-xs font-bold tracking-widest">AUTHORIZED</p>
              <p className="text-xs opacity-90">STUDENT ID BADGE</p>
            </div>
          </div>
          
          <div className="text-right">
            <AlertTriangle className="w-6 h-6 text-white/80" />
          </div>
        </div>
        
        {/* Security stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-warning to-success"></div>
      </div>

      {/* Institution Info */}
      <div className="bg-muted/20 px-4 py-2 border-b border-border">
        <h1 className="text-center text-sm font-bold text-foreground uppercase tracking-wide">{college.name}</h1>
        {college.address && <p className="text-center text-xs text-muted-foreground">{college.address}</p>}
      </div>

      {/* Badge Content */}
      <div className="p-4">
        {/* Photo and ID prominently displayed */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-20 rounded border-2 border-destructive/30 shadow-md">
              {student.photo ? (
                <AvatarImage 
                  src={student.photo} 
                  alt={student.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-destructive/10 text-destructive text-lg font-bold rounded">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Security hologram simulation */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-warning to-success rounded-full opacity-80"></div>
          </div>
          
          <div className="flex-1">
            {/* Large ID number */}
            <div className="bg-destructive/10 rounded p-2 mb-2 border border-destructive/30">
              <p className="text-xs text-muted-foreground font-semibold">STUDENT ID</p>
              <p className="text-lg font-black font-mono text-destructive tracking-widest">{student.id}</p>
            </div>
            
            <h2 className="font-bold text-sm text-foreground uppercase">{student.name}</h2>
          </div>
        </div>

        {/* Security Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center p-2 bg-muted/30 rounded border-l-4 border-destructive">
            <span className="text-xs text-muted-foreground font-semibold">PROGRAM</span>
            <span className="text-xs font-bold text-foreground">{student.course}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-muted/30 rounded border-l-4 border-warning">
            <span className="text-xs text-muted-foreground font-semibold">BATCH</span>
            <span className="text-xs font-bold text-foreground">{student.batch}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-muted/30 rounded border-l-4 border-success">
            <span className="text-xs text-muted-foreground font-semibold">EXPIRES</span>
            <span className="text-xs font-bold text-foreground">{new Date(student.validUpto).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Security Features */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          {/* Barcode/QR */}
          <div className="text-center">
            <div className="w-14 h-14 bg-foreground/90 rounded flex items-center justify-center mb-1">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <p className="text-xs text-muted-foreground font-bold">SECURE CODE</p>
          </div>
          
          {/* Authentication */}
          <div className="text-center">
            {college.signature_url ? (
              <div className="w-18 h-8 mb-1 flex items-end justify-center">
                <img src={college.signature_url} alt="Authority Signature" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-18 h-8 border-b-2 border-destructive mb-1 flex items-end justify-center">
                <div className="text-xs text-destructive font-bold">VERIFIED</div>
              </div>
            )}
            <p className="text-xs text-muted-foreground font-bold">
              {college.signature_title || 'AUTHORIZED OFFICER'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="bg-destructive/10 px-4 py-2 text-center border-t-2 border-destructive/30">
        <p className="text-xs font-bold text-destructive">⚠️ OFFICIAL IDENTIFICATION DOCUMENT ⚠️</p>
        <p className="text-xs text-muted-foreground mt-1">
          Unauthorized use is prohibited • Report if lost or found
        </p>
      </div>
    </div>
  );
}