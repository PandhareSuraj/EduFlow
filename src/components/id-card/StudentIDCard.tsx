import { QrCode } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface StudentIDCardProps {
  student: {
    id: string;
    name: string;
    course: string;
    batch: string;
    phone: string;
    admissionDate: string;
    validUpto: string;
    photo?: string | null;
  };
}

export function StudentIDCard({ student }: StudentIDCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg print:shadow-none print:border-black print:border-2">
      {/* Header with College Info */}
      <div className="bg-gradient-header text-white p-4 text-center">
        <h2 className="text-lg font-bold">KK PATIL PARAMEDICAL COLLEGE</h2>
        <p className="text-sm opacity-90">Sangamner, Maharashtra</p>
        <p className="text-xs opacity-80">STUDENT IDENTITY CARD</p>
      </div>

      {/* Student Photo and Basic Info */}
      <div className="p-4 bg-white">
        <div className="flex items-start space-x-4 mb-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            {student.photo ? (
              <img 
                src={student.photo} 
                alt={student.name}
                className="w-20 h-24 object-cover border-2 border-gray-300 rounded"
              />
            ) : (
              <Avatar className="w-20 h-24 rounded border-2 border-gray-300">
                <AvatarFallback className="bg-primary/10 text-primary text-lg rounded">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Student Details */}
          <div className="flex-1 space-y-1">
            <div className="border-b border-gray-200 pb-1">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Name</p>
              <p className="font-bold text-sm text-gray-900">{student.name}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-1">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Student ID</p>
              <p className="font-mono text-sm font-semibold text-primary">{student.id}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-1">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Course</p>
              <p className="text-sm font-medium text-gray-900">{student.course}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Batch</p>
              <p className="text-sm font-medium text-gray-900">{student.batch}</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <p className="text-gray-600 uppercase tracking-wide">Admission Date</p>
            <p className="font-medium">{new Date(student.admissionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase tracking-wide">Valid Upto</p>
            <p className="font-medium">{new Date(student.validUpto).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Contact</p>
          <p className="text-sm font-medium">{student.phone}</p>
        </div>

        {/* QR Code and Signature */}
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded flex items-center justify-center mb-1">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600">QR Code</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-8 border-b border-gray-400 mb-1"></div>
            <p className="text-xs text-gray-600">Authorized Signature</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-center border-t">
        <p className="text-xs text-gray-600">
          This card is property of KK Patil Paramedical College. If found, please return to college office.
        </p>
      </div>
    </div>
  );
}