import type { CertificateStudent } from "../CertificateStudentForm";
import { generateBonafideCertificatePDF } from "./BonafideCertificatePDF";
import { generateDomicileCertificatePDF } from "./DomicileCertificatePDF";
import {
  generateAdmissionLeavingExtractPDF,
  generateCharacterCertificatePDF,
  generateForm15ACertificatePDF,
} from "./AdditionalCertificatesPDF";
import { generateLeavingCertificatePDF, type CertificateCollege } from "./TransferCertificatePDF";
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
    id: "lc",
    name: "LC Certificate",
    generate: generateLeavingCertificatePDF,
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
    id: "character",
    name: "Character Certificate",
    generate: generateCharacterCertificatePDF,
  },
  {
    id: "form-15a",
    name: "Form-15A Certificate",
    generate: generateForm15ACertificatePDF,
  },
  {
    id: "admission-leaving-extract",
    name: "Admission / Leaving Extract",
    generate: generateAdmissionLeavingExtractPDF,
  },
];
