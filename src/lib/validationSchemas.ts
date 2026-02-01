import { z } from "zod";

// Phone number validation (Indian format)
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-Z\s.'-]+$/;
const studentIdRegex = /^[A-Z0-9]{3,15}$/;
const otpRegex = /^\d{6}$/;

// International phone regex (10-15 digits, optional + prefix)
const internationalPhoneRegex = /^\+?[1-9]\d{9,14}$/;

// Common validation schemas
export const ValidationSchemas = {
  // Personal Information
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(nameRegex, "Name can only contain letters, spaces, dots, hyphens, and apostrophes")
    .transform((name) => name.trim()),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address (e.g., user@example.com)")
    .max(255, "Email cannot exceed 255 characters")
    .transform((email) => email.toLowerCase().trim()),

  phone: z
    .string()
    .min(1, "Mobile number is required")
    .transform((phone) => phone.replace(/\D/g, ''))
    .refine((phone) => phoneRegex.test(phone), {
      message: "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210)"
    }),

  // International phone with country code support
  internationalPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(16, "Phone number cannot exceed 15 digits plus country code")
    .transform((phone) => phone.replace(/\s/g, ''))
    .refine((phone) => internationalPhoneRegex.test(phone.replace(/\D/g, '')), {
      message: "Please enter a valid phone number with country code (e.g., +919876543210)"
    }),

  // Date of birth validation - no future dates, reasonable age range
  birthDate: z
    .date()
    .refine((date) => date <= new Date(), {
      message: "Birth date cannot be in the future"
    })
    .refine((date) => {
      const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 3 && age <= 120;
    }, {
      message: "Please enter a valid birth date (age must be between 3-120 years)"
    }),

  // Birth date as string (from date picker)
  birthDateString: z
    .string()
    .min(1, "Birth date is required")
    .refine((dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && date <= new Date();
    }, {
      message: "Birth date cannot be in the future"
    })
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 3 && age <= 120;
    }, {
      message: "Please enter a valid birth date (age must be between 3-120 years)"
    }),

  // Academic Information
  studentId: z
    .string()
    .min(3, "Student ID must be at least 3 characters")
    .max(15, "Student ID cannot exceed 15 characters")
    .regex(studentIdRegex, "Student ID can only contain uppercase letters and numbers")
    .transform((id) => id.toUpperCase().trim()),

  semester: z
    .number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be at least 1")
    .max(10, "Semester cannot exceed 10"),

  year: z
    .number()
    .int("Year must be a whole number")
    .min(1, "Year must be at least 1")
    .max(6, "Year cannot exceed 6"),

  // Financial Information
  amount: z
    .number()
    .min(0.01, "Amount must be greater than ₹0")
    .max(10000000, "Amount cannot exceed ₹1,00,00,000")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),

  percentage: z
    .number()
    .min(0, "Percentage cannot be negative (minimum: 0%)")
    .max(100, "Percentage cannot exceed 100%"),

  // Authentication
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must include uppercase letter, lowercase letter, and number (e.g., MyPass123)"),

  otp: z
    .string()
    .regex(otpRegex, "OTP must be exactly 6 digits (e.g., 123456)"),

  // Date validations
  futureDate: z
    .date()
    .refine((date) => date > new Date(), {
      message: "Date must be in the future (select a date after today)"
    }),

  pastOrCurrentDate: z
    .date()
    .refine((date) => date <= new Date(), {
      message: "Date cannot be in the future (select today or earlier)"
    }),

  // Text fields
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  address: z
    .string()
    .max(500, "Address cannot exceed 500 characters")
    .optional(),

  // File upload validation (for use with File objects)
  fileUpload: z
    .custom<File>()
    .refine((file) => file instanceof File, "Please select a file")
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      "Only JPEG, PNG, and PDF files are allowed"
    ),

  // Image upload validation
  imageUpload: z
    .custom<File>()
    .refine((file) => file instanceof File, "Please select an image")
    .refine((file) => file.size <= 2 * 1024 * 1024, "Image must be less than 2MB")
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    ),

  // Optional file upload
  optionalFileUpload: z
    .custom<File>()
    .refine((file) => !file || file instanceof File, "Invalid file")
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      "Only JPEG, PNG, and PDF files are allowed"
    )
    .optional(),

  // Exam related
  examMarks: z
    .number()
    .min(0, "Marks cannot be negative")
    .max(100, "Marks cannot exceed 100"),

  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes"),

  // Attendance
  attendancePercentage: z
    .number()
    .min(0, "Attendance cannot be negative")
    .max(100, "Attendance cannot exceed 100%"),

  // Library
  isbn: z
    .string()
    .regex(/^(?:\d{10}|\d{13})$/, "ISBN must be 10 or 13 digits (e.g., 1234567890)")
    .optional(),

  // Inventory
  quantity: z
    .number()
    .int("Quantity must be a whole number (no decimals)")
    .min(0, "Quantity cannot be negative (minimum: 0)")
    .max(10000, "Quantity cannot exceed 10,000 units"),

  // Academic Year
  academicYearId: z
    .string()
    .uuid({ message: "Please select a valid academic year" })
    .optional(),

  // Payment methods
  transactionId: z
    .string()
    .min(5, "Transaction ID must be at least 5 characters")
    .max(50, "Transaction ID cannot exceed 50 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "Transaction ID can only contain letters, numbers, hyphens, and underscores (e.g., TXN-12345)"),

  chequeNumber: z
    .string()
    .min(6, "Cheque number must be at least 6 digits")
    .max(12, "Cheque number cannot exceed 12 digits")
    .regex(/^\d+$/, "Cheque number can only contain digits (e.g., 123456)"),

  bankName: z
    .string()
    .min(2, "Bank name must be at least 2 characters")
    .max(50, "Bank name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s&.'-]+$/, "Bank name can only contain letters and basic punctuation (e.g., State Bank of India)"),
};

// Composite schemas for forms
export const FormSchemas = {
  addStudent: z.object({
    name: ValidationSchemas.name,
    email: ValidationSchemas.email,
    mobile_number: ValidationSchemas.phone,
    course_id: z.string().min(1, "Please select a course"),
    semester: ValidationSchemas.semester,
    year: ValidationSchemas.year,
    admission_date: ValidationSchemas.pastOrCurrentDate,
    class: z.string().optional(),
    academic_year_id: ValidationSchemas.academicYearId,
  }),

  addFaculty: z.object({
    name: ValidationSchemas.name,
    email: ValidationSchemas.email,
    phone: ValidationSchemas.phone,
    designation: z.string().min(1, "Please select a designation"),
    department: z.string().min(1, "Please select a department"),
    experience: z.string().optional(),
    qualification: z.string().optional(),
    subjects: z.string().optional(),
    address: ValidationSchemas.address,
  }),

  collectFee: z.object({
    studentId: z.string().min(1, "Please select a student"),
    studentFeeId: z.string().min(1, "Please select a fee record"),
    amount: ValidationSchemas.amount,
    paymentMode: z.enum(['cash', 'cheque', 'bank_transfer', 'online', 'card']),
    transactionId: z.string().optional(),
    chequeNumber: z.string().optional(),
    bankName: z.string().optional(),
    paymentDate: ValidationSchemas.pastOrCurrentDate,
    remarks: ValidationSchemas.description,
  }).superRefine((data, ctx) => {
    // Conditional validation based on payment method
    if (data.paymentMode === 'cheque' && !data.chequeNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cheque number is required for cheque payments",
        path: ['chequeNumber']
      });
    }

    if (['bank_transfer', 'online'].includes(data.paymentMode) && !data.transactionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transaction ID is required for this payment method",
        path: ['transactionId']
      });
    }
  }),

  createExam: z.object({
    name: ValidationSchemas.name,
    course_id: z.string().min(1, "Please select a course"),
    exam_date: ValidationSchemas.futureDate,
    total_marks: ValidationSchemas.examMarks.max(1000),
    duration_minutes: ValidationSchemas.duration,
    passing_marks: ValidationSchemas.examMarks,
    description: ValidationSchemas.description,
  }),

  login: z.object({
    email: ValidationSchemas.email,
    password: z.string().min(1, "Password is required"),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: ValidationSchemas.password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ['confirmPassword']
      });
    }
  }),
};

// Helper functions for validation
export const ValidationHelpers = {
  // Format phone number for display (adds +91 prefix)
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  },

  // Clean phone number for storage (removes all non-digits)
  cleanPhone: (phone: string): string => {
    return phone.replace(/\D/g, '');
  },

  // Format amount for display
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Validate file size (in bytes)
  validateFileSize: (file: File, maxSizeMB: number = 5): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  // Generate student ID
  generateStudentId: (collegeName: string, year: number): string => {
    const collegePrefix = collegeName.substring(0, 3).toUpperCase();
    const yearSuffix = year.toString().slice(-2);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${collegePrefix}${yearSuffix}${randomSuffix}`;
  },
};

// Export individual validators for reuse
export const {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  studentId: validateStudentId,
  amount: validateAmount,
  percentage: validatePercentage,
  password: validatePassword,
  otp: validateOTP,
} = ValidationSchemas;