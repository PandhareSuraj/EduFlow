import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { ValidationSchemas } from "@/lib/validationSchemas";
import { z } from "zod";
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

interface ValidatedInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  label?: string;
  validationType?: keyof typeof ValidationSchemas;
  customValidator?: z.ZodSchema;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  showValidationIcon?: boolean;
  realTimeValidation?: boolean;
  formatValue?: boolean; // For phone numbers, amounts, etc.
  mask?: 'phone' | 'amount' | 'studentId';
  required?: boolean;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({
    className,
    type = "text",
    label,
    validationType,
    customValidator,
    value,
    onChange,
    onValidationChange,
    showValidationIcon = true,
    realTimeValidation = true,
    formatValue = false,
    mask,
    required = false,
    ...props
  }, ref) => {
    const [error, setError] = React.useState<string>("");
    const [isValid, setIsValid] = React.useState<boolean>(false);
    const [isTouched, setIsTouched] = React.useState<boolean>(false);
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    // Get the appropriate validator
    const validator = React.useMemo(() => {
      if (customValidator) return customValidator;
      if (validationType) return ValidationSchemas[validationType];
      return null;
    }, [customValidator, validationType]);

    // Apply input masking
    const applyMask = (inputValue: string): string => {
      switch (mask) {
        case 'phone':
          const cleaned = inputValue.replace(/\D/g, '');
          if (cleaned.length <= 10) {
            if (cleaned.length > 5) {
              return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
            }
            return cleaned;
          }
          return cleaned.slice(0, 10);
        
        case 'amount':
          // Allow only numbers and one decimal point
          return inputValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        
        case 'studentId':
          // Convert to uppercase, allow only alphanumeric
          return inputValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        default:
          return inputValue;
      }
    };

    // Validate the input
    const validateInput = React.useCallback((inputValue: string) => {
      if (!validator) {
        setIsValid(true);
        setError("");
        onValidationChange?.(true);
        return;
      }

      try {
        // For required fields, check if empty
        if (required && !inputValue.trim()) {
          setIsValid(false);
          setError(`${label || 'Field'} is required`);
          onValidationChange?.(false, `${label || 'Field'} is required`);
          return;
        }

        // Skip validation for empty non-required fields
        if (!required && !inputValue.trim()) {
          setIsValid(true);
          setError("");
          onValidationChange?.(true);
          return;
        }

        validator.parse(inputValue);
        setIsValid(true);
        setError("");
        onValidationChange?.(true);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errorMessage = err.errors[0]?.message || "Invalid input";
          setIsValid(false);
          setError(errorMessage);
          onValidationChange?.(false, errorMessage);
        }
      }
    }, [validator, required, label, onValidationChange]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Apply masking
      if (mask) {
        inputValue = applyMask(inputValue);
      }

      onChange(inputValue);

      // Real-time validation
      if (realTimeValidation && isTouched) {
        validateInput(inputValue);
      }
    };

    // Handle blur (validate on blur even if real-time validation is disabled)
    const handleBlur = () => {
      setIsTouched(true);
      validateInput(value);
    };

    // Validate on mount if value exists
    React.useEffect(() => {
      if (value && isTouched) {
        validateInput(value);
      }
    }, [value, validateInput, isTouched]);

    // Generate placeholder text based on validation type
    const getPlaceholder = (): string => {
      if (props.placeholder) return props.placeholder;
      
      switch (validationType) {
        case 'name':
          return 'Enter full name';
        case 'email':
          return 'Enter email address';
        case 'phone':
          return 'Enter 10-digit mobile number';
        case 'studentId':
          return 'Enter student ID (e.g., ABC21001)';
        case 'amount':
          return 'Enter amount';
        case 'password':
          return 'Enter password';
        case 'otp':
          return 'Enter 6-digit OTP';
        default:
          return props.placeholder || '';
      }
    };

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const showValidation = isTouched && showValidationIcon && validator;

    return (
      <div className="space-y-1">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={inputType}
            className={cn(
              className,
              showValidation && isValid && "pr-10 border-green-500 focus-visible:ring-green-500",
              showValidation && !isValid && error && "pr-10 border-destructive focus-visible:ring-destructive"
            )}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={getPlaceholder()}
            aria-invalid={!isValid && error ? "true" : "false"}
            aria-describedby={error ? `${props.id}-error` : undefined}
          />
          
          {/* Validation icon */}
          {showValidation && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : error ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : null}
            </div>
          )}

          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              type="button"
              className={cn(
                "absolute inset-y-0 right-0 flex items-center pr-3",
                showValidation && "pr-10"
              )}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        
        {/* Error message */}
        {error && isTouched && (
          <p id={`${props.id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Help text based on validation type */}
        {validationType === 'phone' && !error && isTouched && (
          <p className="text-xs text-muted-foreground">
            Enter 10-digit mobile number starting with 6, 7, 8, or 9
          </p>
        )}
        {validationType === 'password' && !error && isTouched && (
          <p className="text-xs text-muted-foreground">
            Must contain at least 8 characters with uppercase, lowercase, and number
          </p>
        )}
        {validationType === 'studentId' && !error && isTouched && (
          <p className="text-xs text-muted-foreground">
            3-15 characters, uppercase letters and numbers only
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";