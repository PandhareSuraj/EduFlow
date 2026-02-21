import { z } from 'zod';

// API endpoint for BizFlow CRM lead submission
const INQUIRY_API_URL = 'https://gcyrapukltxjohjfxgza.supabase.co/functions/v1/submit-inquiry';

// Public API key for BizFlow CRM
const BIZFLOW_API_KEY = 'mwz_4FTkez0IkAKRorr5rRAW77dq8Pae';

// Project source identifier (snake_case, must match allowed_sources in CRM)
const PROJECT_SOURCE = 'eduflow_platform';

// Type definitions — only fields accepted by public API
export interface InquiryPayload {
  contact_person: string;
  phone: string;
  source: string;
  email?: string;
  message?: string;
}

export interface InquiryFormData {
  contact_person: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface InquiryError {
  field: string;
  message: string;
}

export interface InquiryResponse {
  success: boolean;
  errors?: InquiryError[];
  message?: string;
}

// Zod validation schema — matches BizFlow CRM constraints
export const inquirySchema = z.object({
  contact_person: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 15, {
      message: 'Phone number must be 10-15 digits',
    }),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  message: z.string().max(2000, 'Message cannot exceed 2000 characters').optional(),
});

export type InquiryFormSchema = z.infer<typeof inquirySchema>;

// Submit inquiry to BizFlow CRM
export async function submitInquiry(formData: InquiryFormData): Promise<InquiryResponse> {
  const payload: InquiryPayload = {
    contact_person: formData.contact_person.trim(),
    phone: formData.phone.replace(/\D/g, ''),
    source: PROJECT_SOURCE,
    ...(formData.email && { email: formData.email.trim() }),
    ...(formData.message && { message: formData.message.trim() }),
  };

  try {
    const response = await fetch(INQUIRY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-api-key': BIZFLOW_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 201) {
      return { success: true, message: 'Inquiry submitted successfully' };
    }

    if (response.status === 400) {
      const errorData = await response.json();
      const errors: InquiryError[] = [];

      if (errorData.details && Array.isArray(errorData.details)) {
        errorData.details.forEach((detail: { path?: string[]; field?: string; message?: string }) => {
          const field = detail.field || (detail.path && detail.path.length > 0 ? detail.path[0] : 'general');
          if (field && detail.message) {
            errors.push({ field, message: detail.message });
          }
        });
      }

      return {
        success: false,
        errors: errors.length > 0 ? errors : [{ field: 'general', message: errorData.error || 'Validation failed' }],
      };
    }

    if (response.status === 409) {
      return { success: true, message: 'Your inquiry has already been received. Our team will contact you shortly.' };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        errors: [{ field: 'general', message: 'Authentication failed. Please try again later.' }],
      };
    }

    return {
      success: false,
      errors: [{ field: 'general', message: 'An unexpected error occurred. Please try again.' }],
    };
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return {
      success: false,
      errors: [{ field: 'general', message: 'Network error. Please check your connection and try again.' }],
    };
  }
}
