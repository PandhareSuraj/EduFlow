import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AMCConfig {
  baseFee: number;
  perStudent: number;
  perUser: number;
}

export function useAMCConfig() {
  const [config, setConfig] = useState<AMCConfig>({
    baseFee: 25000, // Default fallback
    perStudent: 100,
    perUser: 500,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAMCConfig();

    // Set up real-time subscription for config changes
    const channel = supabase
      .channel('amc-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_configurations',
          filter: 'config_key=in.(amc_base_fee,amc_per_student,amc_per_user)'
        },
        () => {
          fetchAMCConfig();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAMCConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('config_key, config_value')
        .in('config_key', ['amc_base_fee', 'amc_per_student', 'amc_per_user']);

      if (error) {
        console.error('Error fetching AMC config:', error);
        return;
      }

      if (data && data.length > 0) {
        const newConfig: Partial<AMCConfig> = {};
        
        data.forEach(item => {
          switch (item.config_key) {
            case 'amc_base_fee':
              newConfig.baseFee = Number(item.config_value);
              break;
            case 'amc_per_student':
              newConfig.perStudent = Number(item.config_value);
              break;
            case 'amc_per_user':
              newConfig.perUser = Number(item.config_value);
              break;
          }
        });

        setConfig(prev => ({
          baseFee: newConfig.baseFee ?? prev.baseFee,
          perStudent: newConfig.perStudent ?? prev.perStudent,
          perUser: newConfig.perUser ?? prev.perUser,
        }));
      }
    } catch (error) {
      console.error('Error fetching AMC configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAMC = (studentCount: number, userCount: number): number => {
    return config.baseFee + (studentCount * config.perStudent) + (userCount * config.perUser);
  };

  return {
    config,
    loading,
    calculateAMC,
    refetch: fetchAMCConfig,
  };
}