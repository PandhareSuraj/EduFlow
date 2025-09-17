import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IDCardTemplate {
  id: string;
  name: string;
  code: string;
  description: string;
  config: any;
  is_active: boolean;
}

interface CollegeInfo {
  id?: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  signature_url?: string;
  signature_title?: string;
  id_card_template_id?: string;
}

export function useCollegeSettings() {
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo | null>(null);
  const [templates, setTemplates] = useState<IDCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCollegeInfo = async () => {
    try {
      console.log('Fetching college info...');
      
      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      console.log('User ID:', user.id);

      // Get user's college from user_roles
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('college_id, role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        if (roleError.code === 'PGRST116') {
          throw new Error('No role assigned to user. Please contact administrator.');
        }
        throw roleError;
      }

      if (!userRoleData?.college_id) {
        console.warn('No college associated with user role');
        throw new Error('No college assigned to your account. Please contact administrator.');
      }

      console.log('User college ID:', userRoleData.college_id);
      console.log('User role:', userRoleData.role);

      // Fetch the user's specific college
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', userRoleData.college_id)
        .single();

      if (error) {
        console.error('Error fetching college:', error);
        throw new Error('Failed to load college information');
      }

      console.log('College data loaded:', data);
      setCollegeInfo(data);
    } catch (error: any) {
      console.error('Error fetching college info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load college information",
        variant: "destructive",
      });
      setCollegeInfo(null);
    }
  };

  const fetchTemplates = async () => {
    try {
      console.log('Fetching ID card templates...');
      
      const { data, error } = await supabase
        .from('id_card_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      console.log('Templates loaded:', data?.length || 0, 'templates');
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load ID card templates",
        variant: "destructive",
      });
      setTemplates([]);
    }
  };

  const updateCollegeInfo = async (updates: Partial<CollegeInfo>) => {
    try {
      if (!collegeInfo?.id) {
        // Create new college record with required fields
        const newCollege = {
          name: updates.name || collegeInfo?.name || 'College Name',
          code: updates.code || collegeInfo?.code || 'COL',
          ...updates
        };
        
        const { data, error } = await supabase
          .from('colleges')
          .insert([newCollege])
          .select()
          .single();

        if (error) throw error;
        setCollegeInfo(data);
      } else {
        // Update existing college record
        const { data, error } = await supabase
          .from('colleges')
          .update(updates)
          .eq('id', collegeInfo.id)
          .select()
          .single();

        if (error) throw error;
        setCollegeInfo(data);
      }

      toast({
        title: "Success",
        description: "College information updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating college info:', error);
      toast({
        title: "Error",
        description: "Failed to update college information",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadLogo = async (file: File) => {
    const path = `logos/${collegeInfo?.id || 'default'}/logo.${file.name.split('.').pop()}`;
    const url = await uploadFile(file, 'college-assets', path);
    await updateCollegeInfo({ logo_url: url });
    return url;
  };

  const uploadSignature = async (file: File) => {
    const path = `signatures/${collegeInfo?.id || 'default'}/signature.${file.name.split('.').pop()}`;
    const url = await uploadFile(file, 'college-assets', path);
    await updateCollegeInfo({ signature_url: url });
    return url;
  };

  const selectTemplate = async (templateId: string) => {
    await updateCollegeInfo({ id_card_template_id: templateId });
  };

  const getSelectedTemplate = () => {
    if (!collegeInfo?.id_card_template_id) {
      return templates[0]; // Default to first template
    }
    return templates.find(t => t.id === collegeInfo.id_card_template_id) || templates[0];
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCollegeInfo(), fetchTemplates()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    collegeInfo,
    templates,
    loading,
    updateCollegeInfo,
    uploadLogo,
    uploadSignature,
    selectTemplate,
    getSelectedTemplate,
    refetch: () => Promise.all([fetchCollegeInfo(), fetchTemplates()])
  };
}