import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isValidHex } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';

interface ColorPickerInputProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPickerInput({
  label,
  description,
  value,
  onChange,
  className
}: ColorPickerInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Add # if not present
    if (newValue && !newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    
    setLocalValue(newValue);
    
    // Only update parent if valid hex
    if (isValidHex(newValue)) {
      onChange(newValue.toUpperCase());
    }
  }, [onChange]);

  const handleColorPickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setLocalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // Sync local value with prop
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const isValid = isValidHex(localValue);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{ backgroundColor: isValid ? localValue : '#CCCCCC' }}
              aria-label={`Pick color for ${label}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <input
              type="color"
              value={isValid ? localValue : '#CCCCCC'}
              onChange={handleColorPickerChange}
              className="w-48 h-48 cursor-pointer border-0 p-0"
              style={{ backgroundColor: 'transparent' }}
            />
          </PopoverContent>
        </Popover>
        
        <Input
          value={localValue}
          onChange={handleInputChange}
          placeholder="#000000"
          maxLength={7}
          className={cn(
            "w-28 font-mono uppercase",
            !isValid && localValue.length > 1 && "border-destructive"
          )}
        />
      </div>
    </div>
  );
}
