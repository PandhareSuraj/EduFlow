import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { hexToHsl } from '@/utils/colorUtils';

interface ThemeConfig {
  preset: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  sidebar_background: string;
  sidebar_text: string;
}

interface ThemeContextType {
  themeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: ThemeConfig = {
  preset: 'professional_blue',
  primary_color: '#2563EB',
  secondary_color: '#0891B2',
  accent_color: '#F59E0B',
  sidebar_background: '#F1F5F9',
  sidebar_text: '#1E293B'
};

// Apply theme to CSS variables
function applyThemeToDocument(config: ThemeConfig) {
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
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      // First check localStorage for cached theme
      const cachedTheme = localStorage.getItem('app_theme');
      if (cachedTheme) {
        try {
          const parsed = JSON.parse(cachedTheme);
          applyThemeToDocument(parsed);
        } catch (e) {
          console.error('Failed to parse cached theme');
        }
      }

      if (!user) {
        setThemeLoaded(true);
        return;
      }

      try {
        // Get user's college
        const { data: collegeId } = await supabase.rpc('get_user_college');
        
        if (collegeId) {
          // Fetch college theme
          const { data: college, error } = await supabase
            .from('colleges')
            .select('theme_config')
            .eq('id', collegeId)
            .single();

          if (!error && college?.theme_config) {
            const config = college.theme_config as unknown as ThemeConfig;
            const themeConfig: ThemeConfig = {
              preset: config.preset || DEFAULT_THEME.preset,
              primary_color: config.primary_color || DEFAULT_THEME.primary_color,
              secondary_color: config.secondary_color || DEFAULT_THEME.secondary_color,
              accent_color: config.accent_color || DEFAULT_THEME.accent_color,
              sidebar_background: config.sidebar_background || DEFAULT_THEME.sidebar_background,
              sidebar_text: config.sidebar_text || DEFAULT_THEME.sidebar_text
            };
            
            applyThemeToDocument(themeConfig);
            localStorage.setItem('app_theme', JSON.stringify(themeConfig));
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setThemeLoaded(true);
      }
    }

    loadTheme();
  }, [user]);

  // Subscribe to theme changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'colleges',
          filter: `id=neq.placeholder`
        },
        (payload) => {
          if (payload.new?.theme_config) {
            const config = payload.new.theme_config as unknown as ThemeConfig;
            applyThemeToDocument(config);
            localStorage.setItem('app_theme', JSON.stringify(config));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <ThemeContext.Provider value={{ themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
