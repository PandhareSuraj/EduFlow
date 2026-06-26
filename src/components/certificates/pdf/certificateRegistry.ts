import type { CertificateStudent } from "../CertificateStudentForm";
import { generateBonafideCertificatePDF } from "./BonafideCertificatePDF";
import { generateDomicileCertificatePDF } from "./DomicileCertificatePDF";
import { generateSafeDrinkingWaterCertificatePDF } from "./SafeDrinkingWaterCertificatePDF";
import { generateTransferCertificatePDF, type CertificateCollege } from "./TransferCertificatePDF";
import type { CertificateLang } from "./pdfUtils";

export interface CertificateOption {
  id: string;
  name: string;
  generate: (
    student: CertificateStudent,
    college: CertificateCollege,
    lang: CertificateLang
  ) => Promise<void>;
}

export const certificateOptions: CertificateOption[] = [
  {
    id: "tc",
    name: "TC Certificate",
    generate: generateTransferCertificatePDF,
  },
  {
    id: "bonafide",
    name: "Bonafide Certificate",
    generate: generateBonafideCertificatePDF,
  },
  {
    id: "domicile",
    name: "Domicile Certificate",
    generate: generateDomicileCertificatePDF,
  },
  {
    id: "safe-drinking-water",
    name: "Safe Drinking Water Certificate",
    generate: generateSafeDrinkingWaterCertificatePDF,
  },
];
