import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSMSRequest {
  phone_number: string;
  college_id?: string;
  sms_type?: 'signup' | 'login' | 'general';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, college_id, sms_type = 'general' }: SendSMSRequest = await req.json();
    console.log('Send SMS OTP request:', { phone_number, college_id });

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone_number.replace(/[\s-]/g, ''))) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Clean up expired OTPs first
    await supabase.rpc('cleanup_expired_otps');

    // Check for existing valid OTP (rate limiting)
    const { data: existingOTP } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phone_number)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingOTP) {
      return new Response(
        JSON.stringify({ error: 'OTP already sent. Please wait before requesting again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Get SMS configuration with templates
    const { data: smsConfig, error: configError } = await supabase
      .from('sms_configurations')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (configError) {
      console.error('Error fetching SMS config:', configError);
      return new Response(
        JSON.stringify({ error: 'SMS service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!smsConfig) {
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the appropriate template based on SMS type
    let messageTemplate = smsConfig.general_otp_template || 'Your verification code is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share with anyone.';
    
    if (sms_type === 'signup') {
      messageTemplate = smsConfig.signup_otp_template || 'Welcome to {{APP_NAME}}! Your signup OTP is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Do not share this code.';
    } else if (sms_type === 'login') {
      messageTemplate = smsConfig.login_otp_template || 'Your login OTP for {{APP_NAME}} is {{OTP}}. Valid for {{EXPIRY_MINUTES}} minutes. Keep it confidential.';
    }

    // Get college information if college_id is provided
    let collegeName = 'App';
    if (college_id) {
      const { data: college } = await supabase
        .from('colleges')
        .select('name')
        .eq('id', college_id)
        .single();
      
      if (college) {
        collegeName = college.name;
      }
    }

    // Get API key from secrets
    const apiKey = Deno.env.get('SMS_GATEWAY_API_KEY');
    if (!apiKey) {
      console.error('SMS_GATEWAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'SMS service not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Replace template variables with actual values
    const message = messageTemplate
      .replace(/\{\{OTP\}\}/g, otpCode)
      .replace(/\{\{EXPIRY_MINUTES\}\}/g, '5')
      .replace(/\{\{COLLEGE_NAME\}\}/g, collegeName)
      .replace(/\{\{APP_NAME\}\}/g, collegeName);
    
    // Clean phone number for SMS API (remove spaces, dashes)
    const cleanPhone = phone_number.replace(/[\s-]/g, '');
    
    // Send SMS using SMSGatewayHub API
    const smsUrl = new URL('https://www.smsgatewayhub.com/api/mt/SendSMS');
    smsUrl.searchParams.set('APIKey', apiKey);
    smsUrl.searchParams.set('senderid', smsConfig.sender_id);
    smsUrl.searchParams.set('channel', smsConfig.channel.toString());
    smsUrl.searchParams.set('DCS', smsConfig.dcs.toString());
    smsUrl.searchParams.set('flashsms', smsConfig.flash_sms.toString());
    smsUrl.searchParams.set('number', cleanPhone);
    smsUrl.searchParams.set('text', message);
    smsUrl.searchParams.set('route', smsConfig.route);
    
    if (smsConfig.entity_id) {
      smsUrl.searchParams.set('EntityId', smsConfig.entity_id);
    }
    if (smsConfig.dlt_template_id) {
      smsUrl.searchParams.set('dlttemplateid', smsConfig.dlt_template_id);
    }

    console.log('Sending SMS to:', cleanPhone);
    
    const smsResponse = await fetch(smsUrl.toString());
    const smsResult = await smsResponse.text();
    
    console.log('SMS API Response:', smsResult);

    if (!smsResponse.ok) {
      console.error('SMS API Error:', smsResponse.status, smsResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('otp_verifications')
      .insert({
        phone_number,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        college_id,
        attempts: 0,
        verified: false
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP sent successfully to:', phone_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        expires_at: expiresAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-sms-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});