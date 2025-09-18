import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { code, collegeId, driveEmail } = await req.json();

    if (!code || !collegeId || !driveEmail) {
      throw new Error('Missing required parameters: code, collegeId, or driveEmail');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-drive-auth/callback`
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData);
      throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
    }

    // Create main college folder in Google Drive
    const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `College-${collegeId}-Documents`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['root']
      }),
    });

    const folderData = await folderResponse.json();
    
    if (!folderResponse.ok) {
      console.error('Folder creation error:', folderData);
      throw new Error(`Failed to create college folder: ${folderData.error?.message}`);
    }

    // Store Google Drive settings in database
    const { data, error } = await supabase
      .from('google_drive_settings')
      .upsert({
        college_id: collegeId,
        drive_email: driveEmail,
        drive_folder_id: folderData.id,
        access_token_encrypted: tokenData.access_token, // In production, encrypt this
        refresh_token_encrypted: tokenData.refresh_token, // In production, encrypt this
        token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        drive_connected: true,
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Google Drive connected successfully for college ${collegeId}`);

    return new Response(
      JSON.stringify({
        success: true,
        folderId: folderData.id,
        message: 'Google Drive connected successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in google-drive-auth function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});