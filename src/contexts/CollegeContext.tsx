import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CollegeInfo {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  signature_url?: string;
  signature_title?: string;
  id_card_template_id?: string;
}

interface CollegeContextType {
  college: CollegeInfo | null;
  loading: boolean;
  refetchCollege: () => Promise<void>;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export function CollegeProvider({ children }: { children: ReactNode }) {
  const [college, setCollege] = useState<CollegeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();
  const { toast } = useToast();

  const fetchUserCollege = async () => {
    try {
      setLoading(true);
      
      // Get user's college from user_roles
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('college_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (roleError || !userRoleData?.college_id) {
        console.warn('No college associated with user');
        setCollege(null);
        return;
      }

      // Fetch college details
      const { data: collegeData, error: collegeError } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', userRoleData.college_id)
        .single();

      if (collegeError) {
        throw collegeError;
      }

      setCollege(collegeData);
    } catch (error: any) {
      console.error('Error fetching user college:', error);
      toast({
        title: "Error",
        description: "Failed to load college information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchUserCollege();
      
      // Set up real-time subscription for college data changes
      const channel = supabase
        .channel('college-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'colleges'
          },
          () => {
            console.log('College data updated, refetching...');
            fetchUserCollege();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [userRole]);

  const refetchCollege = async () => {
    await fetchUserCollege();
  };

  return (
    <CollegeContext.Provider value={{ college, loading, refetchCollege }}>
      {children}
    </CollegeContext.Provider>
  );
}

export function useCollege() {
  const context = useContext(CollegeContext);
  if (context === undefined) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
}