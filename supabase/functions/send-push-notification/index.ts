import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { notification_id, user_ids } = await req.json();

    console.log(`Sending push notifications for notification_id: ${notification_id} to ${user_ids?.length || 0} users`);

    // Fetch notification details
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .single();

    if (notifError) {
      console.error('Error fetching notification:', notifError);
      throw notifError;
    }

    // Fetch push subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', user_ids);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send push notification to each subscription using web-push
    const webPush = await import('https://esm.sh/web-push@3.6.7');
    
    // Configure with VAPID keys
    webPush.setVapidDetails(
      'mailto:admin@eduerp.com',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    let successCount = 0;
    const pushPromises = subscriptions.map(async (sub: any) => {
      try {
        const pushSubscription: PushSubscription = sub.subscription as PushSubscription;
        
        const payload = JSON.stringify({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          action_url: notification.action_url,
          id: notification.id
        });

        await webPush.sendNotification(pushSubscription, payload);
        
        console.log('Push sent successfully to user:', sub.user_id);
        successCount++;
      } catch (error: any) {
        console.error('Error sending push to user:', sub.user_id, error.message);
        
        // If subscription is invalid (410 Gone), remove it
        if (error.statusCode === 410) {
          console.log('Removing invalid subscription:', sub.id);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
      }
    });

    await Promise.all(pushPromises);

    console.log(`Push notifications sent successfully to ${successCount}/${subscriptions.length} subscribers`);

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: subscriptions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
