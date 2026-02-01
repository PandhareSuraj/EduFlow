/**
 * Server-side validation utilities for Edge Functions
 * Mirrors client-side validation for double-layer security
 */

// Validation result type
interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const sanitized = email.toLowerCase().trim();
  
  if (sanitized.length > 255) {
    return { valid: false, error: 'Email too long (max 255 characters)' };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true, sanitized };
}

// Phone validation (Indian format)
const indianPhoneRegex = /^[6-9]\d{9}$/;

export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Clean the phone number
  const sanitized = phone.replace(/\D/g, '');
  
  if (sanitized.length < 10 || sanitized.length > 15) {
    return { valid: false, error: 'Phone number must be 10-15 digits' };
  }
  
  // For 10-digit numbers, validate Indian format
  if (sanitized.length === 10 && !indianPhoneRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid Indian phone number (must start with 6-9)' };
  }
  
  return { valid: true, sanitized };
}

// Name validation
const nameRegex = /^[a-zA-Z\s.'\-]+$/;

export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const sanitized = name.trim();
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: 'Name cannot exceed 100 characters' };
  }
  
  if (!nameRegex.test(sanitized)) {
    return { valid: false, error: 'Name contains invalid characters (only letters, spaces, dots, hyphens, apostrophes allowed)' };
  }
  
  return { valid: true, sanitized };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

// Generic text sanitization
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol  
    .normalize('NFKC')
    .slice(0, maxLength);
}

// Alphanumeric validation (for IDs, codes)
const alphanumericRegex = /^[a-zA-Z0-9\-_]+$/;

export function validateAlphanumeric(value: string, fieldName: string = 'Value'): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const sanitized = value.trim();
  
  if (!alphanumericRegex.test(sanitized)) {
    return { valid: false, error: `${fieldName} can only contain letters, numbers, hyphens, and underscores` };
  }
  
  return { valid: true, sanitized };
}

// Amount validation
export function validateAmount(amount: number | string, min: number = 0.01, max: number = 10000000): ValidationResult {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (num < min) {
    return { valid: false, error: `Amount must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `Amount cannot exceed ${max}` };
  }
  
  return { valid: true, sanitized: num.toFixed(2) };
}

// Role validation
const validRoles = [
  'admin', 'super_admin', 'teacher', 'faculty', 'student', 
  'clerk', 'librarian', 'accountant', 'assistant', 'auditor',
  'placement_officer', 'hod'
];

export function validateRole(role: string): ValidationResult {
  if (!role || typeof role !== 'string') {
    return { valid: false, error: 'Role is required' };
  }

  const sanitized = role.toLowerCase().trim();
  
  if (!validRoles.includes(sanitized)) {
    return { valid: false, error: 'Invalid role' };
  }
  
  return { valid: true, sanitized };
}

// UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUUID(uuid: string, fieldName: string = 'ID'): ValidationResult {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const sanitized = uuid.trim().toLowerCase();
  
  if (!uuidRegex.test(sanitized)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }
  
  return { valid: true, sanitized };
}

// Batch validation helper
export interface ValidationError {
  field: string;
  error: string;
}

export function validateAll(
  validations: { field: string; result: ValidationResult }[]
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  for (const { field, result } of validations) {
    if (!result.valid && result.error) {
      errors.push({ field, error: result.error });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Create validation error response
export function createValidationErrorResponse(
  errors: ValidationError[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Validation failed',
      details: errors
    }),
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
