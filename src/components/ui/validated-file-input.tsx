import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, FileIcon, ImageIcon, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className?: string;
  disabled?: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const DEFAULT_MAX_SIZE_MB = 5;

export function ValidatedFileInput({
  id,
  label,
  accept,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  value,
  onChange,
  onValidationChange,
  required = false,
  showPreview = true,
  className,
  disabled = false,
}: ValidatedFileInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate preview for images
  useEffect(() => {
    if (value && showPreview && value.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value, showPreview]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes
        .map(type => type.split('/')[1].toUpperCase())
        .join(', ');
      return {
        valid: false,
        error: `Only ${allowedExtensions} files are allowed`,
      };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setError(null);
      onChange(null);
      onValidationChange?.(true);
      return;
    }

    const validation = validateFile(file);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      onChange(null);
      onValidationChange?.(false, validation.error);
      return;
    }

    setError(null);
    onChange(file);
    onValidationChange?.(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    handleFileChange(null);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isValid = !error && (!required || value !== null);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error ? "border-destructive bg-destructive/5" : "",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleClick}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept || allowedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center gap-3">
            {/* Preview or Icon */}
            {preview && showPreview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-12 w-12 object-cover rounded"
              />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                {value.type.startsWith('image/') ? (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <FileIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            )}

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(value.size)}
              </p>
            </div>

            {/* Valid indicator and Clear button */}
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxSizeMB}MB • {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

export default ValidatedFileInput;
