import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
};

const ADMIN_SECRET = 'GEN_VAPID_ONCE';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin secret
    const adminSecret = req.headers.get('x-admin-secret');
    
    if (!adminSecret || adminSecret !== ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or missing admin secret' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating VAPID keys...');

    // Import web-push library
    const webPush = await import('https://esm.sh/web-push@3.6.7');
    
    // Generate VAPID keys
    const vapidKeys = webPush.generateVAPIDKeys();

    console.log('VAPID keys generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
        note: 'Save these keys securely and delete this function after use'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating VAPID keys:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to generate VAPID keys', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
