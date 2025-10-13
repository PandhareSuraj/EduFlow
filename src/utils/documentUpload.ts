import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  college_id?: string;
  storage_type: 'google_drive' | 'supabase';
  web_view_link?: string;
  google_drive_file_id?: string;
}

/**
 * Uploads a document to Google Drive if connected, otherwise falls back to Supabase Storage
 * @param file - The file to upload
 * @param documentType - Type of document (e.g., 'photo', 'resume', 'marksheet')
 * @param metadata - Additional metadata like student_id, college_id
 */
export async function uploadDocument(
  file: File,
  documentType: string,
  metadata?: { student_id?: string; college_id?: string }
): Promise<UploadResult> {
  try {
    // Check if user has personal Google Drive connected
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: personalDriveSettings } = await supabase
      .from('personal_google_drive')
      .select('connected')
      .eq('user_id', user.id)
      .eq('connected', true)
      .maybeSingle();

    if (personalDriveSettings?.connected) {
      // Upload to personal Google Drive
      console.log(`Uploading ${file.name} to Google Drive (type: ${documentType})`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const { data, error } = await supabase.functions.invoke('personal-google-upload', {
        body: formData
      });

      if (error) throw error;

      return {
        file_name: file.name,
        file_path: data.webViewLink,
        file_type: documentType,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        college_id: metadata?.college_id,
        storage_type: 'google_drive',
        web_view_link: data.webViewLink,
        google_drive_file_id: data.fileId
      };
    } else {
      // Fallback to Supabase storage
      console.log(`Uploading ${file.name} to Supabase Storage (Google Drive not connected)`);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${metadata?.student_id || Date.now()}_${documentType}_${Date.now()}.${fileExt}`;
      const filePath = metadata?.college_id 
        ? `${metadata.college_id}/${documentType}/${fileName}`
        : `${documentType}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('student-documents')
        .getPublicUrl(filePath);

      return {
        file_name: file.name,
        file_path: publicUrl,
        file_type: documentType,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        college_id: metadata?.college_id,
        storage_type: 'supabase'
      };
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}
