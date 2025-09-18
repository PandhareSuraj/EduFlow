import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fixed redirect URI for OAuth callback
const SUPABASE_REF = "velhefqnjmevluskffzp";
const REDIRECT_URI = `https://${SUPABASE_REF}.functions.supabase.co/personal-google-auth`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log(`Personal Google Auth request: ${req.method} ${pathname}`);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle OAuth callback from Google (GET request)
    if (req.method === 'GET' && url.searchParams.has('code')) {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      console.log('OAuth callback received:', { code: !!code, state, error });

      if (error) {
        console.error('OAuth error:', error);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?error=oauth_error`
          }
        });
      }

      if (!code || !state) {
        console.error('Missing code or state in callback');
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?error=missing_params`
          }
        });
      }

      // Continue with existing OAuth completion logic
      const stateData = JSON.parse(state);
      const userId = stateData.userId;

      // Get application-level Google OAuth credentials
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokenData);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?error=token_exchange_failed`
          }
        });
      }

      // Continue with the rest of the OAuth completion process...
      // (The existing code from complete_oauth action)
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userInfo = await userInfoResponse.json();
      
      if (!userInfoResponse.ok) {
        console.error('User info error:', userInfo);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?error=user_info_failed`
          }
        });
      }

      // Create main storage folder in user's Google Drive
      const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `College-Documents-${userId.slice(0, 8)}`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['root']
        }),
      });

      const folderData = await folderResponse.json();
      
      if (!folderResponse.ok) {
        console.error('Folder creation error:', folderData);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?error=folder_creation_failed`
          }
        });
      }

      // Get drive quota information
      const aboutResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const aboutData = await aboutResponse.json();
      let quotaUsed = 0;
      let quotaLimit = 16106127360; // 15GB default

      if (aboutResponse.ok && aboutData.storageQuota) {
        quotaUsed = parseInt(aboutData.storageQuota.usage || '0');
        quotaLimit = parseInt(aboutData.storageQuota.limit || '16106127360');
      }

      // Store personal Google Drive settings in database
      const { data, error } = await supabase
        .from('personal_google_drive')
        .upsert({
          user_id: userId,
          google_email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
          drive_folder_id: folderData.id,
          quota_used: quotaUsed,
          quota_limit: quotaLimit,
          connected: true,
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?error=database_error`
          }
        });
      }

      console.log(`Personal Google Drive connected successfully for user ${userId}`);

      // Redirect back to frontend with success
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.lovable.app/settings?success=google_drive_connected`
        }
      });
    }

    // Handle POST requests (start OAuth or other actions)
    const body = await req.json();
    const { action } = body;

    // Get application-level Google OAuth credentials
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    if (action === 'start_oauth') {
      // Get application-level Google OAuth credentials
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      // Generate OAuth URL with application credentials
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', clientId);
      googleAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      googleAuthUrl.searchParams.set('scope', [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '));
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      
      // Get current user
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        throw new Error('Unable to get user from token');
      }

      googleAuthUrl.searchParams.set('state', JSON.stringify({ 
        userId: user.id,
        type: 'personal_drive' 
      }));

      console.log(`Starting OAuth for user ${user.id}`);
      console.log('AUTH_URL:', googleAuthUrl.toString());
      console.log('REDIRECT_URI:', REDIRECT_URI);
      console.log('CLIENT_ID:', clientId);

      return new Response(
        JSON.stringify({ authUrl: googleAuthUrl.toString() }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // This complete_oauth action is no longer needed since OAuth callback is handled via GET

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in personal-google-auth function:', error);
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