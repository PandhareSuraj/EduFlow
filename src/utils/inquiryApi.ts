import { z } from 'zod';

// API endpoint for lead generation
const INQUIRY_API_URL = 'https://gcyrapukltxjohjfxgza.supabase.co/functions/v1/submit-inquiry';

// Project source identifier (snake_case)
const PROJECT_SOURCE = 'eduflow_platform';

// Type definitions
export interface InquiryPayload {
  contact_person: string;
  phone: string;
  source: string;
  email?: string;
  company_name?: string;
  message?: string;
  priority: string;
}

export interface InquiryFormData {
  contact_person: string;
  phone: string;
  email?: string;
  company_name?: string;
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

// Zod validation schema
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
    .optional()
    .or(z.literal('')),
  company_name: z.string().optional(),
  message: z.string().max(2000, 'Message cannot exceed 2000 characters').optional(),
});

export type InquiryFormSchema = z.infer<typeof inquirySchema>;

// Submit inquiry to external API
export async function submitInquiry(formData: InquiryFormData): Promise<InquiryResponse> {
  const payload: InquiryPayload = {
    contact_person: formData.contact_person.trim(),
    phone: formData.phone.replace(/\D/g, ''),
    source: PROJECT_SOURCE,
    priority: 'medium',
    ...(formData.email && { email: formData.email.trim() }),
    ...(formData.company_name && { company_name: formData.company_name.trim() }),
    ...(formData.message && { message: formData.message.trim() }),
  };

  try {
    const response = await fetch(INQUIRY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        errorData.details.forEach((detail: { path?: string[]; message?: string }) => {
          if (detail.path && detail.path.length > 0 && detail.message) {
            errors.push({
              field: detail.path[0],
              message: detail.message,
            });
          }
        });
      }

      return {
        success: false,
        errors: errors.length > 0 ? errors : [{ field: 'general', message: errorData.error || 'Validation failed' }],
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
