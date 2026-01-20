import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { ThemePresetCard } from './ThemePresetCard';
import { ColorPickerInput } from './ColorPickerInput';
import { Loader2, RotateCcw, Palette, Eye, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function BrandingThemeSettings() {
  const {
    themeConfig,
    presets,
    loading,
    saving,
    applyPreset,
    updateColor,
    resetToPreset,
    saveTheme
  } = useTheme();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Color Presets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Color Presets</CardTitle>
          </div>
          <CardDescription>
            Choose a preset theme or customize colors below. Changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {presets.map((preset) => (
              <ThemePresetCard
                key={preset.id}
                name={preset.name}
                code={preset.code}
                primaryColor={preset.primary_color}
                secondaryColor={preset.secondary_color}
                accentColor={preset.accent_color}
                isSelected={themeConfig.preset === preset.code}
                onClick={() => applyPreset(preset.code)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Custom Colors</CardTitle>
              {themeConfig.preset === 'custom' && (
                <Badge variant="secondary">Custom</Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToPreset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          <CardDescription>
            Fine-tune individual colors for a custom look. Changes apply instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ColorPickerInput
              label="Primary Color"
              description="Buttons, links, main accents"
              value={themeConfig.primary_color}
              onChange={(value) => updateColor('primary_color', value)}
            />
            <ColorPickerInput
              label="Secondary Color"
              description="Secondary buttons, gradients"
              value={themeConfig.secondary_color}
              onChange={(value) => updateColor('secondary_color', value)}
            />
            <ColorPickerInput
              label="Accent Color"
              description="Highlights, badges, notifications"
              value={themeConfig.accent_color}
              onChange={(value) => updateColor('accent_color', value)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPickerInput
              label="Sidebar Background"
              description="Navigation sidebar background"
              value={themeConfig.sidebar_background}
              onChange={(value) => updateColor('sidebar_background', value)}
            />
            <ColorPickerInput
              label="Sidebar Text"
              description="Navigation sidebar text color"
              value={themeConfig.sidebar_text}
              onChange={(value) => updateColor('sidebar_text', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Live Preview</CardTitle>
          </div>
          <CardDescription>
            Preview how your theme looks on common UI elements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 p-6 rounded-lg bg-muted/50">
            {/* Primary Button */}
            <Button>Primary Button</Button>
            
            {/* Secondary Button */}
            <Button variant="secondary">Secondary</Button>
            
            {/* Outline Button */}
            <Button variant="outline">Outline</Button>
            
            {/* Badge */}
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            
            {/* Sidebar Preview */}
            <div 
              className="px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
              style={{ 
                backgroundColor: themeConfig.sidebar_background,
                color: themeConfig.sidebar_text
              }}
            >
              <span className="text-sm font-medium">Sidebar Sample</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveTheme} 
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Theme
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
