import { ClassicCorporateTemplate } from './templates/ClassicCorporateTemplate';
import { ModernMinimalTemplate } from './templates/ModernMinimalTemplate';
import { AcademicTraditionalTemplate } from './templates/AcademicTraditionalTemplate';
import { ContemporaryCardTemplate } from './templates/ContemporaryCardTemplate';
import { ProfessionalBadgeTemplate } from './templates/ProfessionalBadgeTemplate';

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

interface IDCardRendererProps {
  student: Student;
  college: CollegeInfo;
  templateCode: string;
  className?: string;
}

const templateComponents = {
  classic_corporate: ClassicCorporateTemplate,
  modern_minimal: ModernMinimalTemplate,
  academic_traditional: AcademicTraditionalTemplate,
  contemporary_card: ContemporaryCardTemplate,
  professional_badge: ProfessionalBadgeTemplate,
};

export function IDCardRenderer({ student, college, templateCode, className }: IDCardRendererProps) {
  const TemplateComponent = templateComponents[templateCode as keyof typeof templateComponents];
  
  if (!TemplateComponent) {
    // Fallback to Classic Corporate if template not found
    const FallbackTemplate = templateComponents.classic_corporate;
    return (
      <div className={className}>
        <FallbackTemplate student={student} college={college} />
      </div>
    );
  }

  return (
    <div className={className}>
      <TemplateComponent student={student} college={college} />
    </div>
  );
}