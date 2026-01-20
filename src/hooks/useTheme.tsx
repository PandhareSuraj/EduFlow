import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCollege } from '@/contexts/CollegeContext';
import { toast } from 'sonner';
import { hexToHsl } from '@/utils/colorUtils';
import debounce from 'lodash/debounce';

export interface ThemeConfig {
  preset: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  sidebar_background: string;
  sidebar_text: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  code: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  sidebar_background: string;
  sidebar_text: string;
  is_default: boolean;
  sort_order: number;
}

const DEFAULT_THEME: ThemeConfig = {
  preset: 'professional_blue',
  primary_color: '#2563EB',
  secondary_color: '#0891B2',
  accent_color: '#F59E0B',
  sidebar_background: '#F1F5F9',
  sidebar_text: '#1E293B'
};

export function useTheme() {
  const { college, refetchCollege } = useCollege();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch theme presets
  const fetchPresets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('theme_presets')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error fetching theme presets:', error);
    }
  }, []);

  // Load theme from college settings
  const loadTheme = useCallback(() => {
    if (college && (college as any).theme_config) {
      const config = (college as any).theme_config as ThemeConfig;
      setThemeConfig({
        preset: config.preset || DEFAULT_THEME.preset,
        primary_color: config.primary_color || DEFAULT_THEME.primary_color,
        secondary_color: config.secondary_color || DEFAULT_THEME.secondary_color,
        accent_color: config.accent_color || DEFAULT_THEME.accent_color,
        sidebar_background: config.sidebar_background || DEFAULT_THEME.sidebar_background,
        sidebar_text: config.sidebar_text || DEFAULT_THEME.sidebar_text
      });
    }
    setLoading(false);
  }, [college]);

  // Apply theme to document
  const applyTheme = useCallback((config: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply primary colors
    root.style.setProperty('--primary', hexToHsl(config.primary_color));
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    
    // Apply secondary colors
    root.style.setProperty('--secondary', hexToHsl(config.secondary_color));
    
    // Apply accent colors
    root.style.setProperty('--accent', hexToHsl(config.accent_color));
    
    // Apply sidebar colors
    root.style.setProperty('--sidebar-background', hexToHsl(config.sidebar_background));
    root.style.setProperty('--sidebar-foreground', hexToHsl(config.sidebar_text));
    
    // Update gradient
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, ${config.primary_color} 0%, ${config.secondary_color} 100%)`
    );
  }, []);

  // Save theme to database (debounced)
  const saveThemeToDb = useCallback(async (config: ThemeConfig) => {
    if (!college?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('colleges')
        .update({ theme_config: config as any })
        .eq('id', college.id);

      if (error) throw error;
      toast.success('Theme saved successfully');
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  }, [college?.id]);

  // Debounced save
  const debouncedSave = useCallback(
    debounce((config: ThemeConfig) => saveThemeToDb(config), 500),
    [saveThemeToDb]
  );

  // Apply preset
  const applyPreset = useCallback((presetCode: string) => {
    const preset = presets.find(p => p.code === presetCode);
    if (!preset) return;

    const newConfig: ThemeConfig = {
      preset: preset.code,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      sidebar_background: preset.sidebar_background,
      sidebar_text: preset.sidebar_text
    };

    setThemeConfig(newConfig);
    applyTheme(newConfig);
    debouncedSave(newConfig);
  }, [presets, applyTheme, debouncedSave]);

  // Update individual color
  const updateColor = useCallback((key: keyof Omit<ThemeConfig, 'preset'>, value: string) => {
    const newConfig: ThemeConfig = {
      ...themeConfig,
      preset: 'custom',
      [key]: value
    };

    setThemeConfig(newConfig);
    applyTheme(newConfig);
    debouncedSave(newConfig);
  }, [themeConfig, applyTheme, debouncedSave]);

  // Reset to preset defaults
  const resetToPreset = useCallback(() => {
    const preset = presets.find(p => p.is_default) || presets[0];
    if (preset) {
      applyPreset(preset.code);
    }
  }, [presets, applyPreset]);

  // Save theme immediately
  const saveTheme = useCallback(async () => {
    debouncedSave.cancel();
    await saveThemeToDb(themeConfig);
  }, [themeConfig, saveThemeToDb, debouncedSave]);

  // Initialize
  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Apply theme on load
  useEffect(() => {
    if (!loading) {
      applyTheme(themeConfig);
    }
  }, [loading, themeConfig, applyTheme]);

  return {
    themeConfig,
    presets,
    loading,
    saving,
    applyPreset,
    updateColor,
    resetToPreset,
    saveTheme,
    applyTheme
  };
}
