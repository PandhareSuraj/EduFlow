

# Comprehensive Form Validation Implementation

## Overview

This plan enhances form validation across the EduFlow application by building on the existing Zod-based validation infrastructure, adding server-side validation, input sanitization, rate limiting, password strength indicators, and consistent validation patterns across all forms.

---

## Current State Analysis

The project already has a solid validation foundation:

| Component | Status | Notes |
|-----------|--------|-------|
| Zod schemas | Partial | `validationSchemas.ts` has core schemas |
| ValidatedInput | Implemented | Supports real-time validation with icons |
| ValidatedForm | Implemented | Form context with disabled submit until valid |
| react-hook-form | Partial | Used in ~17 files with zodResolver |
| Server-side validation | Minimal | Only phone validation in edge functions |
| Input sanitization | Not implemented | No DOMPurify or sanitization utilities |
| Rate limiting | Not implemented | No form submission throttling |
| Password strength | Not implemented | Only basic requirements text |
| File upload validation | Minimal | Has helper but not consistently used |

### Forms Requiring Updates

Based on code analysis, forms fall into three categories:

**Category A - Using ValidatedForm (well-validated):**
- ValidatedStudentDialog
- Some fee collection forms

**Category B - Using react-hook-form with Zod (partially validated):**
- AddInventoryItemDialog, AddHostelAllocationDialog
- PlacementDriveDialog, InterviewSchedulingDialog
- InquiryFormDialog, PromotionConfigDialog

**Category C - Manual validation (needs enhancement):**
- AddFacultyDialog, EditStudentDialog
- CollectFeeDialog, AddCourseDialog
- Auth.tsx login/signup forms
- Most dialog components in /forms folder

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/sanitize.ts` | Input sanitization utilities |
| Create | `src/hooks/useRateLimit.tsx` | Rate limiting hook for form submissions |
| Create | `src/components/ui/password-strength.tsx` | Password strength indicator component |
| Modify | `src/lib/validationSchemas.ts` | Add date of birth, file, international phone schemas |
| Modify | `src/components/ui/validated-input.tsx` | Add birthdate validation, enhance error display |
| Modify | `src/components/auth/ThreeStepSignup.tsx` | Add password strength indicator |
| Modify | `src/pages/Auth.tsx` | Add validation to legacy signup form |
| Create | `src/components/ui/validated-file-input.tsx` | File upload with type/size validation |
| Modify | `src/components/forms/AddFacultyDialog.tsx` | Full Zod validation + sanitization |
| Modify | `src/components/forms/CollectFeeDialog.tsx` | Add Zod schema + rate limiting |
| Create | `supabase/functions/_shared/validation.ts` | Server-side validation utilities |
| Modify | `supabase/functions/create-student-user/index.ts` | Add server-side validation |
| Modify | `supabase/functions/create-faculty-user/index.ts` | Add server-side validation |

---

## Implementation Details

### 1. Input Sanitization Utilities

Create a sanitization library to prevent XSS and clean inputs:

**Features:**
- HTML entity encoding for text inputs
- Strip HTML tags from plain text fields
- Trim whitespace
- Normalize unicode characters
- SQL injection prevention (for direct queries)

**Key Functions:**
```typescript
// src/lib/sanitize.ts
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeForDatabase(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '')
    .normalize('NFKC');
}

export function sanitizeEmail(input: string): string {
  return input.toLowerCase().trim();
}

export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '');
}
```

### 2. Rate Limiting Hook

Prevent form submission spam:

**Features:**
- Configurable cooldown period (default 3 seconds)
- Toast feedback when rate limited
- Tracks last submission timestamp
- Per-form rate limiting using form ID

**Implementation Pattern:**
```typescript
// src/hooks/useRateLimit.tsx
export function useRateLimit(cooldownMs: number = 3000) {
  const [lastSubmit, setLastSubmit] = useState<number>(0);
  const [isLimited, setIsLimited] = useState(false);
  
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastSubmit < cooldownMs) {
      setIsLimited(true);
      toast({
        title: "Please wait",
        description: "You're submitting too quickly. Please wait a moment.",
        variant: "destructive"
      });
      return false;
    }
    setLastSubmit(now);
    setIsLimited(false);
    return true;
  }, [lastSubmit, cooldownMs]);
  
  return { checkRateLimit, isLimited };
}
```

### 3. Password Strength Indicator Component

Visual feedback for password strength:

**Strength Criteria:**
- Minimum length (8 characters)
- Uppercase letter present
- Lowercase letter present
- Number present
- Special character present (@$!%*?&)
- Overall length bonus (12+ chars)

**Visual Design:**
- Progress bar with color gradient (red -> yellow -> green)
- Strength label (Weak, Fair, Good, Strong, Very Strong)
- Checklist of requirements with icons
- Matches existing Tailwind styling

```typescript
// src/components/ui/password-strength.tsx
interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

function calculateStrength(password: string): {
  score: number; // 0-5
  label: string;
  color: string;
  requirements: { met: boolean; label: string }[];
}
```

### 4. Enhanced Validation Schemas

Extend the existing Zod schemas:

**New Schemas:**
```typescript
// Add to src/lib/validationSchemas.ts

// Date of birth - no future dates, reasonable age range
birthDate: z
  .date()
  .refine((date) => date <= new Date(), {
    message: "Birth date cannot be in the future"
  })
  .refine((date) => {
    const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return age >= 3 && age <= 120;
  }, {
    message: "Please enter a valid birth date (age must be between 3-120 years)"
  }),

// International phone with country code support
internationalPhone: z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number cannot exceed 15 digits")
  .regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number"),

// File upload validation
fileUpload: z
  .custom<File>()
  .refine((file) => file instanceof File, "Please select a file")
  .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
  .refine(
    (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
    "Only JPEG, PNG, and PDF files are allowed"
  ),

// Image upload (photos)
imageUpload: z
  .custom<File>()
  .refine((file) => file instanceof File, "Please select an image")
  .refine((file) => file.size <= 2 * 1024 * 1024, "Image must be less than 2MB")
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    "Only JPEG, PNG, and WebP images are allowed"
  ),
```

### 5. Validated File Input Component

Reusable file upload with validation:

**Features:**
- Accepts allowed file types as prop
- Validates file size before upload
- Shows file name after selection
- Displays inline error messages
- Preview for images
- Clear button to remove selection

```typescript
// src/components/ui/validated-file-input.tsx
interface ValidatedFileInputProps {
  id: string;
  label: string;
  accept?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  value: File | null;
  onChange: (file: File | null) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  required?: boolean;
  showPreview?: boolean;
}
```

### 6. Server-Side Validation (Edge Functions)

Add validation to all edge functions that accept user input:

**Shared Validation Module:**
```typescript
// supabase/functions/_shared/validation.ts
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (email.length > 255) {
    return { valid: false, error: 'Email too long' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: 'Invalid phone number length' };
  }
  return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length < 2 || name.length > 100) {
    return { valid: false, error: 'Name must be 2-100 characters' };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000); // Prevent extremely long inputs
}
```

**Edge Function Updates:**
- create-student-user: Validate email, name, password strength
- create-faculty-user: Validate email, phone, name
- create-general-user: Validate all user inputs
- send-sms-otp: Already has phone validation (enhance with rate limiting)

### 7. Form-Specific Enhancements

**AddFacultyDialog - Full Validation:**
```typescript
const facultyFormSchema = z.object({
  name: ValidationSchemas.name,
  email: ValidationSchemas.email,
  phone: ValidationSchemas.phone,
  designation: z.string().min(1, "Please select a designation"),
  department: z.string().min(1, "Please select a department"),
  experience: z.string().max(50).optional(),
  qualification: z.string().max(200).optional(),
  subjects: z.string().max(500).optional(),
  address: ValidationSchemas.address,
});
```

**CollectFeeDialog - Enhanced Validation:**
- Use existing FormSchemas.collectFee
- Add rate limiting (prevent double payments)
- Validate amount doesn't exceed balance
- Required cheque/transaction fields based on payment method

**Auth.tsx Signup Form:**
- Add password strength indicator
- Validate confirm password match
- Email format validation
- Show inline errors

### 8. Required Field Indicators

Update all forms to show asterisks for required fields:

**Pattern:**
```tsx
<Label htmlFor="name">
  Full Name <span className="text-destructive">*</span>
</Label>
```

Already implemented in ValidatedInput with the `required` prop.

---

## Validation Flow Diagram

```text
User Input
    │
    ▼
┌─────────────────────┐
│  Client-Side        │
│  - Real-time Zod    │
│  - Input masking    │
│  - Required check   │
│  - Visual feedback  │
└─────────────────────┘
    │ Valid?
    ▼
┌─────────────────────┐
│  Rate Limit Check   │
│  - 3 second cooldown│
│  - Toast feedback   │
└─────────────────────┘
    │ Allowed?
    ▼
┌─────────────────────┐
│  Sanitization       │
│  - Strip HTML       │
│  - Normalize text   │
│  - Clean phone/email│
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  API Request        │
│  (Supabase or Edge) │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Server-Side        │
│  - Re-validate all  │
│  - Sanitize again   │
│  - RLS policies     │
└─────────────────────┘
    │
    ▼
    Database
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
1. Create `src/lib/sanitize.ts` with sanitization utilities
2. Create `src/hooks/useRateLimit.tsx` for form throttling
3. Create `src/components/ui/password-strength.tsx` component
4. Update `src/lib/validationSchemas.ts` with new schemas

### Phase 2: Input Components
5. Create `src/components/ui/validated-file-input.tsx`
6. Enhance `src/components/ui/validated-input.tsx` with birthdate support

### Phase 3: Auth Forms
7. Update ThreeStepSignup with password strength indicator
8. Update Auth.tsx login/signup with validation

### Phase 4: Major Forms
9. Update AddFacultyDialog with full Zod validation
10. Update CollectFeeDialog with rate limiting and sanitization
11. Update EditStudentDialog with consistent validation

### Phase 5: Server-Side
12. Create shared validation module for edge functions
13. Update create-student-user with server validation
14. Update create-faculty-user with server validation

---

## Error Message Standards

| Field Type | Example Error Message |
|------------|----------------------|
| Email | "Please enter a valid email address (e.g., user@example.com)" |
| Phone | "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9" |
| Name | "Name can only contain letters, spaces, dots, hyphens, and apostrophes" |
| Password | "Password must be at least 8 characters with uppercase, lowercase, and number" |
| Birth Date | "Birth date cannot be in the future" |
| Required | "[Field name] is required" |
| File Size | "File size must be less than 5MB" |
| File Type | "Only JPEG, PNG, and PDF files are allowed" |

---

## Testing Scenarios

After implementation, test these scenarios:

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty required field | Inline error, submit disabled |
| Invalid email format | Real-time error display |
| Future birth date | "Birth date cannot be in the future" |
| Rapid form submissions | Rate limit message after 3 submissions |
| Weak password | Red progress bar, requirements not met |
| Strong password | Green progress bar, all checks passed |
| File too large | "File size must be less than 5MB" |
| Invalid file type | "Only JPEG, PNG, and PDF files are allowed" |
| XSS attempt (`<script>`) | Input sanitized, no execution |
| SQL injection attempt | Input sanitized, query safe |

