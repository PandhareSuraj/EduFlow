import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ThemePresetCardProps {
  name: string;
  code: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemePresetCard({
  name,
  primaryColor,
  secondaryColor,
  accentColor,
  isSelected,
  onClick
}: ThemePresetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      
      {/* Color circles */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: primaryColor }}
          title="Primary"
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: secondaryColor }}
          title="Secondary"
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: accentColor }}
          title="Accent"
        />
      </div>
      
      {/* Preset name */}
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {name}
      </span>
    </button>
  );
}
