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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const collegeId = formData.get('collegeId') as string;
    const studentId = formData.get('studentId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !collegeId || !studentId || !documentType) {
      throw new Error('Missing required parameters');
    }

    // Get Google Drive settings for the college
    const { data: driveSettings, error: settingsError } = await supabase
      .from('google_drive_settings')
      .select('*')
      .eq('college_id', collegeId)
      .eq('drive_connected', true)
      .single();

    if (settingsError || !driveSettings) {
      throw new Error('Google Drive not configured for this college');
    }

    // Check if token needs refresh
    const now = new Date();
    const expiresAt = new Date(driveSettings.token_expires_at);
    
    let accessToken = driveSettings.access_token_encrypted;

    if (now >= expiresAt) {
      // Refresh the token
      // Get college's OAuth credentials for token refresh
      const { data: oauthSettings, error: oauthError } = await supabase
        .from('google_drive_settings')
        .select('google_client_id_encrypted, google_client_secret_encrypted')
        .eq('college_id', collegeId)
        .eq('oauth_setup_completed', true)
        .single();

      if (oauthError || !oauthSettings?.google_client_id_encrypted || !oauthSettings?.google_client_secret_encrypted) {
        throw new Error('OAuth credentials not configured for this college');
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: oauthSettings.google_client_id_encrypted,
          client_secret: oauthSettings.google_client_secret_encrypted,
          refresh_token: driveSettings.refresh_token_encrypted,
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
        .from('google_drive_settings')
        .update({
          access_token_encrypted: accessToken,
          token_expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
        })
        .eq('id', driveSettings.id);
    }

    // Create student folder structure if it doesn't exist
    const folderPath = `students/${studentId}/${documentType}`;
    
    // Check if student folder exists, create if not
    let studentFolderId = await findOrCreateFolder(accessToken, driveSettings.drive_folder_id, 'students');
    studentFolderId = await findOrCreateFolder(accessToken, studentFolderId, studentId);
    const documentFolderId = await findOrCreateFolder(accessToken, studentFolderId, documentType);

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

    console.log(`File uploaded successfully: ${uploadResult.id}`);

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
    console.error('Error in google-drive-upload function:', error);
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