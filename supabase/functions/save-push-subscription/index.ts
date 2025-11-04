import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { subscription, device_info } = await req.json();

    console.log('Saving push subscription for user:', user.id);

    // Insert or update subscription
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscription,
        device_info: device_info || null,
      }, {
        onConflict: 'user_id,subscription'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }

    console.log('Subscription saved successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, subscription_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-push-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
