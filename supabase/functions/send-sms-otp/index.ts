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
    console.log('FUNC_START - Send SMS OTP request:', { phone_number, college_id, sms_type });

    // Phone number validation
    if (!phone_number || phone_number.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get SMS configuration from database
    const { data: smsConfig, error: configError } = await supabase
      .from('sms_configurations')
      .select('*')
      .single();

    if (configError || !smsConfig) {
      console.error('SMS configuration not found:', configError);
      return new Response(
        JSON.stringify({ error: 'SMS service not configured. Please contact administrator.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!smsConfig.is_active) {
      return new Response(
        JSON.stringify({ error: 'SMS service is currently disabled' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check dev mode from config or environment
    const isDevelopment = smsConfig.dev_mode || Deno.env.get('ENVIRONMENT') === 'development';
    
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Cleanup expired OTPs
    await supabase
      .from('otp_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Check for existing valid OTP
    const { data: existingOtp } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phone_number)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (existingOtp) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP already sent. Please check your messages or wait for it to expire.',
          expires_at: existingOtp.expires_at 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Development mode bypass
    if (isDevelopment) {
      console.log('DEV_MODE_ACTIVE - OTP Code:', otpCode);
      
      // Store OTP but skip actual SMS sending
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

      console.log('OTP_STORED - Dev mode bypass successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully (dev mode)',
          expires_at: expiresAt.toISOString(),
          dev_otp: otpCode // Only in dev mode!
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number with country code
    const defaultCountryCode = smsConfig.default_country_code || '+91';
    let formattedPhone = phone_number.replace(/\D/g, ''); // Remove non-digits
    
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = defaultCountryCode + formattedPhone;
    }
    
    console.log('PHONE_FORMATTED:', formattedPhone);

    // Get API key: prioritize DB config, then env variables
    const apiKey = smsConfig.api_key_encrypted || 
                   Deno.env.get(smsConfig.api_key_name || 'SMS_GATEWAY_API_KEY') ||
                   Deno.env.get('SMS_GATEWAY_API_KEY');

    if (!apiKey) {
      console.error('API key not configured');
      return new Response(
        JSON.stringify({ error: 'SMS service not properly configured - missing API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get college name if provided
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

    // Get appropriate template
    let messageTemplate = smsConfig.otp_template_signup || 'Your OTP is {{otp}}. Valid for 10 minutes.';
    if (sms_type === 'login') {
      messageTemplate = smsConfig.otp_template_login || 'Your login OTP is {{otp}}. Valid for 10 minutes.';
    }

    // Replace template variables
    const message = messageTemplate
      .replace(/\{\{otp\}\}/gi, otpCode)
      .replace(/\{\{college_name\}\}/gi, collegeName);

    // Build SMS Gateway URL
    const smsUrl = new URL('https://www.smsgatewayhub.com/api/mt/SendSMS');
    smsUrl.searchParams.set('APIKey', apiKey);
    smsUrl.searchParams.set('senderid', smsConfig.sender_id);
    smsUrl.searchParams.set('channel', smsConfig.channel.toString());
    smsUrl.searchParams.set('DCS', smsConfig.dcs.toString());
    smsUrl.searchParams.set('flashsms', smsConfig.flash_sms.toString());
    smsUrl.searchParams.set('number', formattedPhone);
    smsUrl.searchParams.set('text', message);
    smsUrl.searchParams.set('route', smsConfig.route_id);
    
    if (smsConfig.entity_id) {
      smsUrl.searchParams.set('EntityId', smsConfig.entity_id);
    }
    if (smsConfig.dlt_template_id) {
      smsUrl.searchParams.set('dlttemplateid', smsConfig.dlt_template_id);
    }

    console.log('SMS_API_REQUEST:', { 
      phone: formattedPhone,
      route: smsConfig.route_id,
      sender_id: smsConfig.sender_id,
      template_id: smsConfig.dlt_template_id
    });

    const smsResponse = await fetch(smsUrl.toString());
    const smsResult = await smsResponse.text();

    console.log('SMS_API_RESPONSE:', smsResult);

    // Parse the SMS Gateway Hub response
    let smsData;
    try {
      smsData = JSON.parse(smsResult);
    } catch (e) {
      console.error('SMS_API_ERROR - Failed to parse response:', smsResult);
      return new Response(
        JSON.stringify({ error: 'SMS service error: Invalid response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for SMS Gateway Hub specific error codes
    if (smsData.ErrorCode && smsData.ErrorCode !== "0") {
      console.error('SMS_API_ERROR:', smsData);
      return new Response(
        JSON.stringify({ 
          error: `SMS service error: ${smsData.ErrorMessage || 'Failed to send SMS'}. Please check SMS Gateway credentials in Settings.`,
          details: smsData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify we got a JobId (success indicator)
    if (!smsData.JobId) {
      console.error('SMS_API_ERROR - No JobId received:', smsData);
      return new Response(
        JSON.stringify({ error: 'SMS service error: No job ID received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('SMS_SENT - JobId:', smsData.JobId);

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
      console.error('OTP_STORAGE_ERROR:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP_STORED - Successfully stored OTP');
    
    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent successfully', expires_at: expiresAt.toISOString() }),
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
