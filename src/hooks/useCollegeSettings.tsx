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
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setCollegeInfo(data);
      } else {
        // Default college info if none exists
        setCollegeInfo({
          name: 'KK Patil Paramedical College',
          code: 'KKPPC',
          address: 'Sangamner, Maharashtra',
          phone: '+91 98765 43210',
          email: 'admin@kkpatilcollege.edu.in',
          website: 'https://kkpatilcollege.edu.in',
          signature_title: 'Authorized Signature'
        });
      }
    } catch (error: any) {
      console.error('Error fetching college info:', error);
      toast({
        title: "Error",
        description: "Failed to load college information",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('id_card_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load ID card templates",
        variant: "destructive",
      });
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