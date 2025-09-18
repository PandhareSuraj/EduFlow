import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PersonalGoogleDriveSettings {
  id?: string;
  user_id: string;
  google_email: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  drive_folder_id?: string;
  quota_used: number;
  quota_limit: number;
  connected: boolean;
  created_at?: string;
  updated_at?: string;
}

export const usePersonalGoogleDrive = () => {
  const [settings, setSettings] = useState<PersonalGoogleDriveSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  const fetchSettings = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setLoading(false);
        return;
      }

      // Use raw SQL query since types aren't updated yet
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          SELECT * FROM personal_google_drive 
          WHERE user_id = $1
        `,
        params: [user.user.id]
      });

      if (error) {
        console.error('Error fetching personal Google Drive settings:', error);
        toast({
          title: "Error",
          description: "Failed to fetch Google Drive settings",
          variant: "destructive",
        });
        return;
      }

      const settings = data && data.length > 0 ? data[0] as PersonalGoogleDriveSettings : null;
      setSettings(settings);
    } catch (error) {
      console.error('Error fetching personal Google Drive settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Google Drive settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Generate Google OAuth URL with application credentials
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', 'YOUR_APP_CLIENT_ID'); // Will be replaced by edge function
      googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/settings`);
      googleAuthUrl.searchParams.set('scope', [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '));
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      googleAuthUrl.searchParams.set('state', JSON.stringify({ 
        userId: user.user.id,
        type: 'personal_drive' 
      }));

      // Start OAuth flow by invoking edge function to get proper auth URL
      const { data, error } = await supabase.functions.invoke('personal-google-auth', {
        body: { 
          action: 'start_oauth',
          redirectUri: `${window.location.origin}/settings`
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Failed to connect Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Google Drive connection",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disconnectGoogleDrive = async () => {
    if (!settings?.id) return;

    try {
      // Use raw SQL query since types aren't updated yet
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          UPDATE personal_google_drive 
          SET connected = false, 
              access_token = NULL, 
              refresh_token = NULL, 
              token_expires_at = NULL, 
              google_email = ''
          WHERE id = $1
        `,
        params: [settings.id]
      });

      if (error) throw error;

      setSettings(prev => prev ? { 
        ...prev, 
        connected: false, 
        google_email: '',
        access_token: undefined,
        refresh_token: undefined
      } : null);
      
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

  const uploadFile = async (file: File, documentType: string = 'documents') => {
    if (!settings?.connected) {
      throw new Error('Google Drive not connected');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const { data, error } = await supabase.functions.invoke('personal-google-upload', {
        body: formData
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to upload file to Google Drive",
        variant: "destructive",
      });
      throw error;
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
    if (userRole) {
      fetchSettings();
    }
  }, [userRole]);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        try {
          const stateData = JSON.parse(state);
          if (stateData.type === 'personal_drive') {
            const { data, error } = await supabase.functions.invoke('personal-google-auth', {
              body: {
                action: 'complete_oauth',
                code,
                state: stateData
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
          }
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
    uploadFile,
    getStorageUsage,
    formatStorageSize,
    refreshSettings: fetchSettings,
  };
};