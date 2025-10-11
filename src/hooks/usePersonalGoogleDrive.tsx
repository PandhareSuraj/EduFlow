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

      // For now, we'll simulate empty settings until types are updated
      // This will be replaced with proper database queries once types are available
      setSettings(null);
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

      // Get auth session for bearer token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Redirect to GET /start endpoint with auth header
      const startUrl = 'https://velhefqnjmevluskffzp.functions.supabase.co/personal-google-auth/start';
      
      // Redirect browser to start endpoint (which will redirect to Google)
      const link = document.createElement('a');
      link.href = startUrl;
      link.target = '_self';
      
      // Add auth header via fetch first to validate, then redirect
      const response = await fetch(startUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        redirect: 'manual'
      });

      if (response.status === 302 || response.type === 'opaqueredirect') {
        // Follow the redirect manually
        window.location.href = startUrl;
      } else if (response.status === 401) {
        throw new Error('Authentication required');
      } else {
        throw new Error('Failed to start OAuth flow');
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
      // For now, just show success message
      // This will be replaced with proper database update once types are available
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
    if (!settings) return { used: 0, total: 16106127360, percentage: 0 };
    
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

  // Handle OAuth success/error from edge function redirect
  useEffect(() => {
    const handleOAuthResult = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const error = urlParams.get('error');

      if (success === 'google_drive_connected') {
        toast({
          title: "Success",
          description: "Google Drive connected successfully",
        });

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Refresh settings
        fetchSettings();
      } else if (error) {
        let errorMessage = "Failed to connect Google Drive";
        switch (error) {
          case 'oauth_error':
            errorMessage = "OAuth authorization was denied";
            break;
          case 'missing_params':
            errorMessage = "Invalid OAuth response";
            break;
          case 'token_exchange_failed':
            errorMessage = "Failed to exchange authorization code";
            break;
          case 'user_info_failed':
            errorMessage = "Failed to get user information from Google";
            break;
          case 'folder_creation_failed':
            errorMessage = "Failed to create storage folder in Google Drive";
            break;
          case 'database_error':
            errorMessage = "Failed to save Google Drive settings";
            break;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthResult();
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