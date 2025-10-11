import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration constants
const SUPABASE_REF = "velhefqnjmevluskffzp";
const REDIRECT_URI = `https://${SUPABASE_REF}.functions.supabase.co/personal-google-auth/callback`;
const FRONTEND_SUCCESS_URL = `https://${SUPABASE_REF}.supabase.co/settings`;
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log(`Personal Google Auth request: ${req.method} ${pathname}`);

  // Startup validation
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  console.log("FUNC_START", {
    method: req.method,
    url: req.url,
    pathname,
    env: {
      has_client_id: !!clientId,
      has_client_secret: !!clientSecret,
      supabase_url: Deno.env.get("SUPABASE_URL"),
      has_service_key: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    }
  });

  if (!clientId || !clientSecret) {
    console.error("OAUTH_SECRETS_MISSING", { 
      has_client_id: !!clientId, 
      has_client_secret: !!clientSecret 
    });
    return new Response(
      JSON.stringify({ error: "missing_oauth_secrets" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle GET /start - Initiate OAuth flow
    if (req.method === 'GET' && pathname.endsWith('/start')) {
      // Try Authorization header first, then query parameter
      let token = req.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        token = url.searchParams.get('access_token');
      }
      
      if (!token) {
        console.error('No access token provided');
        return new Response(
          JSON.stringify({ error: 'unauthorized', message: 'No access token provided' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      console.log("USER_FROM_TOKEN", { 
        user_id: user?.id,
        has_user: !!user,
        error: userError?.message,
        token_source: req.headers.get('Authorization') ? 'header' : 'query'
      });
      
      if (userError || !user) {
        console.error('User auth failed:', userError);
        return new Response(
          JSON.stringify({ error: 'unauthorized', message: userError?.message }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const state = JSON.stringify({ 
        userId: user.id,
        ts: Date.now(),
        type: 'personal_drive'
      });

      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', clientId!);
      googleAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      googleAuthUrl.searchParams.set('scope', SCOPES.join(' '));
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      googleAuthUrl.searchParams.set('state', state);

    console.log("AUTH_START", {
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      scopes: SCOPES,
      user_id: user.id
    });
    
    const authUrlString = googleAuthUrl.toString();
    console.log("AUTH_URL_GENERATED", authUrlString);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': authUrlString
      }
    });
    }

    // Handle GET /callback - OAuth callback from Google
    if (req.method === 'GET' && (pathname.endsWith('/callback') || url.searchParams.has('code'))) {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const oauthError = url.searchParams.get('error');

      console.log("AUTH_CALLBACK_PARAMS", {
        has_code: !!code,
        error: oauthError,
        state: state ? 'present' : 'missing'
      });

      if (oauthError) {
        console.error('OAuth error from Google:', oauthError);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${FRONTEND_SUCCESS_URL}?error=oauth_error`
          }
        });
      }

      if (!code || !state) {
        console.error('Missing code or state in callback');
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${FRONTEND_SUCCESS_URL}?error=missing_params`
          }
        });
      }

      // Parse and validate state
      let stateData;
      try {
        stateData = JSON.parse(state);
        if (!stateData.userId || !stateData.ts) {
          throw new Error('Invalid state structure');
        }
        // Check timestamp freshness (within 10 minutes)
        if (Date.now() - stateData.ts > 600000) {
          throw new Error('State expired');
        }
      } catch (err) {
        console.error('State validation failed:', err);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${FRONTEND_SUCCESS_URL}?error=missing_state`
          }
        });
      }

      const userId = stateData.userId;

      if (!clientId || !clientSecret) {
        console.error('Google OAuth credentials not configured');
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${FRONTEND_SUCCESS_URL}?error=config_error`
          }
        });
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
            'Location': `${FRONTEND_SUCCESS_URL}?error=token_exchange_failed`
          }
        });
      }

      console.log("TOKENS_FETCHED", {
        has_access: !!tokenData.access_token,
        has_refresh: !!tokenData.refresh_token,
        expires_in: tokenData.expires_in
      });

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
            'Location': `${FRONTEND_SUCCESS_URL}?error=user_info_failed`
          }
        });
      }

      console.log("USERINFO", { email: userInfo.email });

      // Create main storage folder in user's Google Drive with idempotency
      const folderName = `College-Documents-${userId.slice(0, 8)}`;
      const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['root']
        }),
      });

      let folderData = await folderResponse.json();
      let folderId = folderData.id;
      
      // Handle duplicate folder (409 or already exists) - idempotency
      if (!folderResponse.ok) {
        if (folderResponse.status === 409 || folderData.error?.code === 409) {
          console.log("FOLDER_EXISTS", { name: folderName, reusing: true });
          // Search for existing folder
          const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            { headers: { 'Authorization': `Bearer ${tokenData.access_token}` }}
          );
          const searchData = await searchResponse.json();
          if (searchData.files && searchData.files.length > 0) {
            folderId = searchData.files[0].id;
            folderData = searchData.files[0];
            console.log("FOLDER_REUSED", { id: folderId });
          } else {
            console.error('Folder creation/search error:', folderData);
            return new Response(null, {
              status: 302,
              headers: {
                'Location': `${FRONTEND_SUCCESS_URL}?error=folder_creation_failed`
              }
            });
          }
        } else {
          console.error('Folder creation error:', folderData);
          return new Response(null, {
            status: 302,
            headers: {
              'Location': `${FRONTEND_SUCCESS_URL}?error=folder_creation_failed`
            }
          });
        }
      }

      console.log("FOLDER_CREATE", { 
        id: folderId, 
        name: folderName, 
        ok: folderResponse.ok,
        status: folderResponse.status 
      });

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
          refresh_token: tokenData.refresh_token || null, // Handle missing refresh token
          token_expires_at: tokenData.expires_in 
            ? new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
            : null,
          drive_folder_id: folderId,
          quota_used: quotaUsed,
          quota_limit: quotaLimit,
          connected: true,
        })
        .select();

      console.log("DB_UPSERT_PERSONAL_DRIVE", { 
        user_id: userId, 
        ok: !error,
        has_refresh_token: !!tokenData.refresh_token
      });

      if (error) {
        console.error('Database upsert error:', error);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': `${FRONTEND_SUCCESS_URL}?error=database_error`
          }
        });
      }

      console.log(`Personal Google Drive connected successfully for user ${userId}`);

      // Redirect back to frontend with success
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${FRONTEND_SUCCESS_URL}?success=google_drive_connected`
        }
      });
    }

    // No other endpoints needed - OAuth is handled via GET /start and GET /callback
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

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