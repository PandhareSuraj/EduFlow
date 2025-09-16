import { useCollege } from '@/contexts/CollegeContext';

interface BrandingInfo {
  collegeName: string;
  collegeCode: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  signatureUrl?: string;
  signatureTitle?: string;
}

export function useBranding(): BrandingInfo {
  const { college } = useCollege();

  // Fallback branding if no college is found
  const fallbackBranding: BrandingInfo = {
    collegeName: 'College Management System',
    collegeCode: 'CMS',
    address: '',
    phone: '',
    email: '',
    website: '',
    signatureTitle: 'Authorized Signature'
  };

  if (!college) {
    return fallbackBranding;
  }

  return {
    collegeName: college.name,
    collegeCode: college.code,
    address: college.address,
    phone: college.phone,
    email: college.email,
    website: college.website,
    logoUrl: college.logo_url,
    signatureUrl: college.signature_url,
    signatureTitle: college.signature_title || 'Authorized Signature'
  };
}