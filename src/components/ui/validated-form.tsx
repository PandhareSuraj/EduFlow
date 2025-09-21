import * as React from "react";
import { z } from "zod";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface FieldValidationState {
  isValid: boolean;
  error?: string;
}

interface ValidatedFormProps {
  children: React.ReactNode;
  onSubmit: (formData: Record<string, any>) => Promise<void> | void;
  schema: z.ZodSchema;
  className?: string;
  submitButtonText?: string;
  submitButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showSubmitButton?: boolean;
  disabled?: boolean;
  resetOnSubmit?: boolean;
}

interface ValidatedFormContextType {
  formData: Record<string, any>;
  updateField: (name: string, value: any) => void;
  updateFieldValidation: (name: string, isValid: boolean, error?: string) => void;
  fieldValidation: Record<string, FieldValidationState>;
  isFormValid: boolean;
  isSubmitting: boolean;
  resetForm: () => void;
}

const ValidatedFormContext = React.createContext<ValidatedFormContextType | null>(null);

export const useValidatedForm = () => {
  const context = React.useContext(ValidatedFormContext);
  if (!context) {
    throw new Error('useValidatedForm must be used within a ValidatedForm');
  }
  return context;
};

export const ValidatedForm: React.FC<ValidatedFormProps> = ({
  children,
  onSubmit,
  schema,
  className,
  submitButtonText = "Submit",
  submitButtonVariant = "default",
  showSubmitButton = true,
  disabled = false,
  resetOnSubmit = false,
}) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [fieldValidation, setFieldValidation] = React.useState<Record<string, FieldValidationState>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = React.useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const updateFieldValidation = React.useCallback((name: string, isValid: boolean, error?: string) => {
    setFieldValidation(prev => ({
      ...prev,
      [name]: { isValid, error }
    }));
  }, []);

  const resetForm = React.useCallback(() => {
    setFormData({});
    setFieldValidation({});
    setIsSubmitting(false);
  }, []);

  // Check if form is valid
  const isFormValid = React.useMemo(() => {
    const validationStates = Object.values(fieldValidation);
    if (validationStates.length === 0) return false;
    
    return validationStates.every(state => state.isValid);
  }, [fieldValidation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || disabled) return;

    try {
      setIsSubmitting(true);
      
      // Validate entire form with schema
      const validatedData = schema.parse(formData);
      
      await onSubmit(validatedData);
      
      if (resetOnSubmit) {
        resetForm();
      }
    } catch (error) {
      console.error('Form validation or submission error:', error);
      
      if (error instanceof z.ZodError) {
        // Update field validation states with schema errors
        const newFieldValidation = { ...fieldValidation };
        
        error.errors.forEach(err => {
          const fieldName = err.path[0]?.toString();
          if (fieldName) {
            newFieldValidation[fieldName] = {
              isValid: false,
              error: err.message
            };
          }
        });
        
        setFieldValidation(newFieldValidation);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: ValidatedFormContextType = {
    formData,
    updateField,
    updateFieldValidation,
    fieldValidation,
    isFormValid,
    isSubmitting,
    resetForm,
  };

  return (
    <ValidatedFormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
        {showSubmitButton && (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant={submitButtonVariant}
              disabled={!isFormValid || isSubmitting || disabled}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </ValidatedFormContext.Provider>
  );
};

// Helper component for form fields that automatically connect to the form context
interface ValidatedFormFieldProps {
  name: string;
  children: (props: {
    value: any;
    onChange: (value: any) => void;
    onValidationChange: (isValid: boolean, error?: string) => void;
    error?: string;
  }) => React.ReactNode;
}

export const ValidatedFormField: React.FC<ValidatedFormFieldProps> = ({ name, children }) => {
  const { formData, updateField, updateFieldValidation, fieldValidation } = useValidatedForm();
  
  const value = formData[name] || '';
  const validation = fieldValidation[name];

  const handleChange = (newValue: any) => {
    updateField(name, newValue);
  };

  const handleValidationChange = (isValid: boolean, error?: string) => {
    updateFieldValidation(name, isValid, error);
  };

  return (
    <>
      {children({
        value,
        onChange: handleChange,
        onValidationChange: handleValidationChange,
        error: validation?.error,
      })}
    </>
  );
};