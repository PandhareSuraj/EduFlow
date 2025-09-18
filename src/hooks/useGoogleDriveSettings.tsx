import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface GoogleDriveSettings {
  id?: string;
  college_id: string;
  drive_email: string;
  drive_folder_id?: string;
  quota_used: number;
  quota_limit: number;
  drive_connected: boolean;
  google_client_id_encrypted?: string;
  google_client_secret_encrypted?: string;
  oauth_setup_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useGoogleDriveSettings = () => {
  const [settings, setSettings] = useState<GoogleDriveSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  // Get college ID from user_roles table
  const [collegeId, setCollegeId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCollegeId = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('college_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (data?.college_id) {
        setCollegeId(data.college_id);
      }
    };
    
    fetchCollegeId();
  }, []);

  const fetchSettings = async () => {
    if (!collegeId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('google_drive_settings')
        .select('*')
        .eq('college_id', collegeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Google Drive settings:', error);
        toast({
          title: "Error",
          description: "Failed to fetch Google Drive settings",
          variant: "destructive",
        });
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching Google Drive settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Google Drive settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleDrive = async (driveEmail: string, clientId: string) => {
    if (!collegeId) {
      throw new Error('College ID not found');
    }

    if (!clientId) {
      throw new Error('Google Client ID is required');
    }

    // Generate Google OAuth URL with college's own client ID
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/settings`);
    googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/drive.file');
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');
    googleAuthUrl.searchParams.set('state', JSON.stringify({ collegeId, driveEmail }));

    // Redirect to Google OAuth
    window.location.href = googleAuthUrl.toString();
  };

  const saveOAuthCredentials = async (clientId: string, clientSecret: string) => {
    if (!collegeId) {
      throw new Error('College ID not found');
    }

    try {
      const { error } = await supabase
        .from('google_drive_settings')
        .upsert({
          college_id: collegeId,
          google_client_id_encrypted: clientId, // In production, encrypt this
          google_client_secret_encrypted: clientSecret, // In production, encrypt this
          oauth_setup_completed: true,
          drive_connected: false,
          quota_used: 0,
          quota_limit: 16106127360, // 15GB default
          drive_email: '',
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "OAuth credentials saved successfully",
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error saving OAuth credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save OAuth credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disconnectGoogleDrive = async () => {
    if (!collegeId || !settings?.id) return;

    try {
      const { error } = await supabase
        .from('google_drive_settings')
        .update({
          drive_connected: false,
          access_token_encrypted: null,
          refresh_token_encrypted: null,
          token_expires_at: null,
          drive_email: '',
        })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, drive_connected: false, drive_email: '' } : null);
      
      toast({
        title: "Success",
        description: "Google Drive disconnected successfully",
      });
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Drive",
        variant: "destructive",
      });
    }
  };

  const getStorageUsage = () => {
    if (!settings) return { used: 0, total: 0, percentage: 0 };
    
    const used = settings.quota_used;
    const total = settings.quota_limit;
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return { used, total, percentage };
  };

  const formatStorageSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchSettings();
  }, [collegeId]);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        try {
          const { collegeId: callbackCollegeId, driveEmail } = JSON.parse(state);
          
          const { data, error } = await supabase.functions.invoke('google-drive-auth', {
            body: {
              code,
              collegeId: callbackCollegeId,
              driveEmail,
            }
          });

          if (error) throw error;

          toast({
            title: "Success",
            description: "Google Drive connected successfully",
          });

          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Refresh settings
          fetchSettings();
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Error",
            description: "Failed to connect Google Drive",
            variant: "destructive",
          });
        }
      }
    };

    handleOAuthCallback();
  }, [toast]);

  return {
    settings,
    loading,
    connectGoogleDrive,
    disconnectGoogleDrive,
    saveOAuthCredentials,
    getStorageUsage,
    formatStorageSize,
    refreshSettings: fetchSettings,
  };
};