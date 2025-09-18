import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    // Get user's personal Google Drive settings
    const { data: driveSettings, error: settingsError } = await supabase
      .from('personal_google_drive')
      .select('*')
      .eq('user_id', user.id)
      .eq('connected', true)
      .single();

    if (settingsError || !driveSettings) {
      throw new Error('Personal Google Drive not connected');
    }

    // Check if token needs refresh
    const now = new Date();
    const expiresAt = new Date(driveSettings.token_expires_at);
    
    let accessToken = driveSettings.access_token;

    if (now >= expiresAt && driveSettings.refresh_token) {
      // Refresh the token
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: driveSettings.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshData.error}`);
      }

      accessToken = refreshData.access_token;

      // Update the database with new token
      await supabase
        .from('personal_google_drive')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
        })
        .eq('id', driveSettings.id);
    }

    // Create document type folder if it doesn't exist
    const folderPath = documentType || 'documents';
    const documentFolderId = await findOrCreateFolder(
      accessToken, 
      driveSettings.drive_folder_id, 
      folderPath
    );

    // Upload file to Google Drive
    const fileBuffer = await file.arrayBuffer();
    
    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary="foo_bar_baz"',
      },
      body: createMultipartBody(file.name, file.type, fileBuffer, [documentFolderId]),
    });

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      console.error('Upload error:', uploadResult);
      throw new Error(`File upload failed: ${uploadResult.error?.message}`);
    }

    // Update quota usage
    try {
      const aboutResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (aboutResponse.ok) {
        const aboutData = await aboutResponse.json();
        const quotaUsed = parseInt(aboutData.storageQuota?.usage || '0');
        
        await supabase
          .from('personal_google_drive')
          .update({ quota_used: quotaUsed })
          .eq('id', driveSettings.id);
      }
    } catch (quotaError) {
      console.error('Failed to update quota:', quotaError);
      // Don't fail the upload if quota update fails
    }

    console.log(`File uploaded successfully to personal Google Drive: ${uploadResult.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileId: uploadResult.id,
        fileName: file.name,
        mimeType: file.type,
        webViewLink: uploadResult.webViewLink,
        webContentLink: uploadResult.webContentLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in personal-google-upload function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Upload failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function findOrCreateFolder(accessToken: string, parentId: string, folderName: string): Promise<string> {
  // Search for existing folder
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const searchResult = await searchResponse.json();
  
  if (searchResult.files && searchResult.files.length > 0) {
    return searchResult.files[0].id;
  }

  // Create new folder if not found
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    }),
  });

  const createResult = await createResponse.json();
  return createResult.id;
}

function createMultipartBody(fileName: string, mimeType: string, fileBuffer: ArrayBuffer, parents: string[]): string {
  const delimiter = 'foo_bar_baz';
  const close_delim = `\r\n--${delimiter}--`;
  
  const metadata = JSON.stringify({
    name: fileName,
    parents: parents
  });

  const multipartRequestBody = 
    `--${delimiter}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    metadata + '\r\n' +
    `--${delimiter}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`;

  const uint8Array = new Uint8Array(fileBuffer);
  const textEncoder = new TextEncoder();
  const bodyStart = textEncoder.encode(multipartRequestBody);
  const bodyEnd = textEncoder.encode(close_delim);

  const body = new Uint8Array(bodyStart.length + uint8Array.length + bodyEnd.length);
  body.set(bodyStart, 0);
  body.set(uint8Array, bodyStart.length);
  body.set(bodyEnd, bodyStart.length + uint8Array.length);

  return new TextDecoder().decode(body);
}