import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Settings, TestTube } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SMSConfig {
  id?: string;
  sender_id: string;
  channel: number;
  dcs: number;
  flash_sms: number;
  route: string;
  entity_id: string;
  dlt_template_id: string;
  is_active: boolean;
  signup_otp_template: string;
  login_otp_template: string;
  general_otp_template: string;
  default_country_code: string;
}

export const SMSSettings: React.FC = () => {
  const [config, setConfig] = useState<SMSConfig>({
    sender_id: 'TESTIN',
    channel: 2,
    dcs: 0,
    flash_sms: 0,
    route: 'clickhere',
    entity_id: '',
    dlt_template_id: '',
    is_active: true,
    signup_otp_template: 'Welcome to {{APP_NAME}}! Your signup OTP is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share this code.',
    login_otp_template: 'Your login OTP for {{APP_NAME}} is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Keep it confidential.',
    general_otp_template: 'Your verification code is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share with anyone.',
    default_country_code: '+91'
  });
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { userRole } = useAuth();

  // Only super admins can access SMS settings
  if (userRole !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Access denied. Only super admins can configure SMS settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    fetchSMSConfig();
  }, []);

  const fetchSMSConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_configurations')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching SMS config:', error);
        return;
      }

      if (data) {
        setConfig({
          id: data.id,
          sender_id: data.sender_id,
          channel: data.channel,
          dcs: data.dcs,
          flash_sms: data.flash_sms,
          route: data.route,
          entity_id: data.entity_id || '',
          dlt_template_id: data.dlt_template_id || '',
          is_active: data.is_active,
          signup_otp_template: data.signup_otp_template || 'Welcome to {{APP_NAME}}! Your signup OTP is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share this code.',
          login_otp_template: data.login_otp_template || 'Your login OTP for {{APP_NAME}} is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Keep it confidential.',
          general_otp_template: data.general_otp_template || 'Your verification code is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share with anyone.',
          default_country_code: data.default_country_code || '+91'
        });
      }
    } catch (err) {
      console.error('Error fetching SMS config:', err);
    }
  };

  const saveSMSConfig = async () => {
    setLoading(true);
    setError('');

    try {
      const configData = {
        sender_id: config.sender_id,
        channel: config.channel,
        dcs: config.dcs,
        flash_sms: config.flash_sms,
        route: config.route,
        entity_id: config.entity_id,
        dlt_template_id: config.dlt_template_id,
        is_active: config.is_active,
        signup_otp_template: config.signup_otp_template,
        login_otp_template: config.login_otp_template,
        general_otp_template: config.general_otp_template,
        default_country_code: config.default_country_code
      };

      if (config.id) {
        // Update existing config
        const { error } = await supabase
          .from('sms_configurations')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Insert new config
        const { data, error } = await supabase
          .from('sms_configurations')
          .insert([configData])
          .select()
          .single();

        if (error) throw error;
        setConfig({ ...config, id: data.id });
      }

      toast({
        title: "SMS Configuration Saved",
        description: "SMS settings have been updated successfully.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save SMS configuration');
    } finally {
      setLoading(false);
    }
  };

  const testSMS = async () => {
    if (!testPhone.trim()) {
      setError('Please enter a phone number for testing');
      return;
    }

    setTestLoading(true);
    setError('');

    try {
      const formattedPhone = testPhone.startsWith('+') ? testPhone : `${config.default_country_code}${testPhone}`;
      const { data, error } = await supabase.functions.invoke('send-sms-otp', {
        body: { phone_number: formattedPhone, sms_type: 'general' }
      });

      if (error) throw error;

      if (data.error) {
        setError(data.error);
        return;
      }

      toast({
        title: "Test SMS Sent",
        description: "Test OTP has been sent to the provided number.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send test SMS');
    } finally {
      setTestLoading(false);
    }
  };

  const handleInputChange = (field: keyof SMSConfig, value: string | number | boolean) => {
    setConfig({ ...config, [field]: value });
    if (error) setError('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SMS Gateway Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender_id">Sender ID</Label>
              <Input
                id="sender_id"
                value={config.sender_id}
                onChange={(e) => handleInputChange('sender_id', e.target.value)}
                placeholder="TESTIN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Input
                id="route"
                value={config.route}
                onChange={(e) => handleInputChange('route', e.target.value)}
                placeholder="clickhere"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                type="number"
                value={config.channel}
                onChange={(e) => handleInputChange('channel', parseInt(e.target.value) || 2)}
                placeholder="2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dcs">DCS</Label>
              <Input
                id="dcs"
                type="number"
                value={config.dcs}
                onChange={(e) => handleInputChange('dcs', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_id">Entity ID</Label>
              <Input
                id="entity_id"
                value={config.entity_id}
                onChange={(e) => handleInputChange('entity_id', e.target.value)}
                placeholder="Registered-Entity-Id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dlt_template_id">DLT Template ID</Label>
              <Input
                id="dlt_template_id"
                value={config.dlt_template_id}
                onChange={(e) => handleInputChange('dlt_template_id', e.target.value)}
                placeholder="Registered-DLT-Template-Id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_country_code">Default Country Code</Label>
            <Input
              id="default_country_code"
              value={config.default_country_code}
              onChange={(e) => handleInputChange('default_country_code', e.target.value)}
              placeholder="+91"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={config.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Enable SMS Service</Label>
          </div>

          <Button onClick={saveSMSConfig} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Templates Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup_template">Signup OTP Template</Label>
              <Textarea
                id="signup_template"
                value={config.signup_otp_template}
                onChange={(e) => handleInputChange('signup_otp_template', e.target.value)}
                placeholder="Welcome to {{APP_NAME}}! Your signup OTP is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login_template">Login OTP Template</Label>
              <Textarea
                id="login_template"
                value={config.login_otp_template}
                onChange={(e) => handleInputChange('login_otp_template', e.target.value)}
                placeholder="Your login OTP for {{APP_NAME}} is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="general_template">General OTP Template</Label>
              <Textarea
                id="general_template"
                value={config.general_otp_template}
                onChange={(e) => handleInputChange('general_otp_template', e.target.value)}
                placeholder="Your verification code is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes."
                rows={3}
              />
            </div>

            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>Available Template Variables:</strong>
                <br />
                <code>{'{{OTP}}'}</code> - The actual OTP code
                <br />
                <code>{'{{EXPIRY_MINUTES}}'}</code> - Minutes until expiry (default: 5)
                <br />
                <code>{'{{COLLEGE_NAME}}'}</code> - Name of the college (if applicable)
                <br />
                <code>{'{{APP_NAME}}'}</code> - Application name
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test SMS Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test_phone">Test Phone Number</Label>
            <div className="flex gap-2">
              <div className="w-20">
                <Input
                  value={config.default_country_code}
                  readOnly
                  className="text-center"
                />
              </div>
              <Input
                id="test_phone"
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="1234567890"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Phone number will be formatted with the default country code: {config.default_country_code}
            </p>
          </div>

          <Button 
            onClick={testSMS} 
            disabled={testLoading || !config.is_active}
            variant="outline"
          >
            <Send className="mr-2 h-4 w-4" />
            {testLoading ? 'Sending Test SMS...' : 'Send Test SMS'}
          </Button>

          {!config.is_active && (
            <Alert>
              <AlertDescription>
                SMS service is disabled. Please enable it in the configuration above to send test messages.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>API Endpoint:</strong> https://www.smsgatewayhub.com/api/mt/SendSMS
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>API Key:</strong> Managed securely through Supabase secrets (SMS_GATEWAY_API_KEY)
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Usage:</strong> Used for phone number verification during user registration
          </p>
        </CardContent>
      </Card>
    </div>
  );
};