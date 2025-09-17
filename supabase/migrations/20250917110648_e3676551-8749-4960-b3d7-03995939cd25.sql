-- Create system_configurations table for AMC settings
CREATE TABLE public.system_configurations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key text NOT NULL UNIQUE,
    config_value numeric NOT NULL DEFAULT 0,
    description text,
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies - only super_admin can manage configurations
CREATE POLICY "Super admins can manage system configurations"
ON public.system_configurations
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_system_configurations_updated_at
    BEFORE UPDATE ON public.system_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default AMC configuration values
INSERT INTO public.system_configurations (config_key, config_value, description, created_by) VALUES
('amc_base_fee', 25000, 'Annual Maintenance Contract base fee per college', auth.uid()),
('amc_per_student', 100, 'AMC fee per student enrolled in the college', auth.uid()),
('amc_per_user', 500, 'AMC fee per user account in the college', auth.uid());