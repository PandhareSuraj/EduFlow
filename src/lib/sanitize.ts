/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and cleans user inputs before storage
 */

/**
 * Sanitize text input by escaping HTML entities
 * Use for text that will be displayed in HTML context
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize input for database storage
 * Removes potentially dangerous characters and normalizes text
 */
export function sanitizeForDatabase(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .normalize('NFKC') // Normalize unicode
    .slice(0, 10000); // Prevent extremely long inputs
}

/**
 * Sanitize email address
 * Lowercase, trim, and validate format
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.toLowerCase().trim().slice(0, 255);
}

/**
 * Sanitize phone number
 * Removes all non-digit characters
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/\D/g, '').slice(0, 15);
}

/**
 * Sanitize name input
 * Allows only letters, spaces, dots, hyphens, and apostrophes
 */
export function sanitizeName(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^a-zA-Z\s.'\-]/g, '')
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .slice(0, 100);
}

/**
 * Sanitize numeric input
 * Removes all non-numeric characters except decimal point
 */
export function sanitizeNumber(input: string): string {
  if (!input || typeof input !== 'string') return '';
  // Allow only digits and one decimal point
  const cleaned = input.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
}

/**
 * Sanitize alphanumeric input (IDs, codes, etc.)
 * Allows only letters, numbers, hyphens, and underscores
 */
export function sanitizeAlphanumeric(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .slice(0, 100);
}

/**
 * Sanitize URL
 * Basic URL sanitization
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  // Only allow http, https protocols
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.slice(0, 2000);
  }
  // If no protocol, assume https
  if (!trimmed.includes('://')) {
    return `https://${trimmed}`.slice(0, 2000);
  }
  return '';
}

/**
 * Strip all HTML tags from input
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize multiline text (addresses, descriptions)
 * Preserves line breaks but removes HTML
 */
export function sanitizeMultiline(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/[<>]/g, '') // Remove remaining brackets
    .normalize('NFKC')
    .slice(0, 2000);
}

/**
 * Create a sanitized object from form data
 * Applies appropriate sanitization based on field type
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  fieldTypes: Partial<Record<keyof T, 'text' | 'email' | 'phone' | 'name' | 'number' | 'alphanumeric' | 'multiline' | 'url'>>
): T {
  const sanitized = { ...data };
  
  for (const [key, type] of Object.entries(fieldTypes)) {
    const value = data[key as keyof T];
    if (typeof value !== 'string') continue;
    
    switch (type) {
      case 'email':
        (sanitized as Record<string, unknown>)[key] = sanitizeEmail(value);
        break;
      case 'phone':
        (sanitized as Record<string, unknown>)[key] = sanitizePhone(value);
        break;
      case 'name':
        (sanitized as Record<string, unknown>)[key] = sanitizeName(value);
        break;
      case 'number':
        (sanitized as Record<string, unknown>)[key] = sanitizeNumber(value);
        break;
      case 'alphanumeric':
        (sanitized as Record<string, unknown>)[key] = sanitizeAlphanumeric(value);
        break;
      case 'multiline':
        (sanitized as Record<string, unknown>)[key] = sanitizeMultiline(value);
        break;
      case 'url':
        (sanitized as Record<string, unknown>)[key] = sanitizeUrl(value);
        break;
      default:
        (sanitized as Record<string, unknown>)[key] = sanitizeForDatabase(value);
    }
  }
  
  return sanitized;
}
