import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, RotateCcw, Calculator } from "lucide-react";

interface AMCConfig {
  amc_base_fee: number;
  amc_per_student: number;
  amc_per_user: number;
}

export function AMCSettings() {
  const [config, setConfig] = useState<AMCConfig>({
    amc_base_fee: 25000,
    amc_per_student: 100,
    amc_per_user: 500,
  });
  const [originalConfig, setOriginalConfig] = useState<AMCConfig>({
    amc_base_fee: 25000,
    amc_per_student: 100,
    amc_per_user: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sample calculation
  const sampleStudents = 100;
  const sampleUsers = 10;
  const sampleAMC = config.amc_base_fee + (sampleStudents * config.amc_per_student) + (sampleUsers * config.amc_per_user);

  useEffect(() => {
    fetchAMCConfig();
  }, []);

  const fetchAMCConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('config_key, config_value')
        .in('config_key', ['amc_base_fee', 'amc_per_student', 'amc_per_user']);

      if (error) throw error;

      if (data && data.length > 0) {
        const configObj: Partial<AMCConfig> = {};
        data.forEach(item => {
          configObj[item.config_key as keyof AMCConfig] = Number(item.config_value);
        });
        
        const fullConfig = {
          amc_base_fee: configObj.amc_base_fee || 25000,
          amc_per_student: configObj.amc_per_student || 100,
          amc_per_user: configObj.amc_per_user || 500,
        };
        
        setConfig(fullConfig);
        setOriginalConfig(fullConfig);
      }
    } catch (error) {
      console.error('Error fetching AMC configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load AMC configuration. Using default values.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (config.amc_base_fee < 0 || config.amc_per_student < 0 || config.amc_per_user < 0) {
      toast({
        title: "Validation Error",
        description: "All AMC values must be non-negative.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updates = [
        { config_key: 'amc_base_fee', config_value: config.amc_base_fee },
        { config_key: 'amc_per_student', config_value: config.amc_per_student },
        { config_key: 'amc_per_user', config_value: config.amc_per_user },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_configurations')
          .upsert({
            config_key: update.config_key,
            config_value: update.config_value,
            description: getDescription(update.config_key),
          }, {
            onConflict: 'config_key'
          });

        if (error) throw error;
      }

      setOriginalConfig(config);
      toast({
        title: "Success",
        description: "AMC configuration updated successfully.",
      });
    } catch (error) {
      console.error('Error saving AMC configuration:', error);
      toast({
        title: "Error", 
        description: "Failed to save AMC configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(originalConfig);
  };

  const getDescription = (key: string) => {
    switch (key) {
      case 'amc_base_fee':
        return 'Annual Maintenance Contract base fee per college';
      case 'amc_per_student':
        return 'AMC fee per student enrolled in the college';
      case 'amc_per_user':
        return 'AMC fee per user account in the college';
      default:
        return '';
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            AMC Configuration
          </CardTitle>
          <CardDescription>
            Configure the Annual Maintenance Contract fee structure for colleges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base-fee">Base Fee (₹)</Label>
              <Input
                id="base-fee"
                type="number"
                min="0"
                value={config.amc_base_fee}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  amc_base_fee: Number(e.target.value) || 0 
                }))}
                placeholder="25000"
              />
              <p className="text-xs text-muted-foreground">
                Fixed annual fee per college
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="per-student">Per Student Fee (₹)</Label>
              <Input
                id="per-student"
                type="number"
                min="0"
                value={config.amc_per_student}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  amc_per_student: Number(e.target.value) || 0 
                }))}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Fee multiplied by student count
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="per-user">Per User Fee (₹)</Label>
              <Input
                id="per-user"
                type="number"
                min="0"
                value={config.amc_per_user}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  amc_per_user: Number(e.target.value) || 0 
                }))}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">
                Fee multiplied by user count
              </p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sample Calculation</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>College with {sampleStudents} students and {sampleUsers} users:</p>
              <p>Base Fee: ₹{config.amc_base_fee.toLocaleString()}</p>
              <p>Student Fees: ₹{config.amc_per_student} × {sampleStudents} = ₹{(config.amc_per_student * sampleStudents).toLocaleString()}</p>
              <p>User Fees: ₹{config.amc_per_user} × {sampleUsers} = ₹{(config.amc_per_user * sampleUsers).toLocaleString()}</p>
              <div className="border-t pt-2 mt-2">
                <p className="font-medium text-foreground">Total AMC: ₹{sampleAMC.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}