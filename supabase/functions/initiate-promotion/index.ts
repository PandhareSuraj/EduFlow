import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PromotionRequest {
  academic_year_id: string;
  course_ids?: number[];
  year?: number;
  semester?: number;
  criteria?: {
    min_attendance_percentage?: number;
    min_marks_percentage?: number;
    check_fee_payment?: boolean;
  };
  dry_run?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: PromotionRequest = await req.json();

    // Create promotion job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('promotion_jobs')
      .insert({
        academic_year_id: requestData.academic_year_id,
        initiated_by: user.id,
        status: requestData.dry_run ? 'dry_run' : 'pending',
        filters: {
          course_ids: requestData.course_ids,
          year: requestData.year,
          semester: requestData.semester,
        },
        promotion_criteria: requestData.criteria || {},
        can_rollback: !requestData.dry_run,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating promotion job:', jobError);
      throw jobError;
    }

    // Log event
    await supabaseAdmin
      .from('promotion_job_events')
      .insert({
        job_id: job.id,
        event_type: 'job_created',
        event_data: {
          initiated_by: user.id,
          dry_run: requestData.dry_run,
        },
      });

    return new Response(JSON.stringify({
      success: true,
      job_id: job.id,
      message: requestData.dry_run 
        ? 'Dry run initiated. Review the preview before confirming.'
        : 'Promotion job created successfully.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in initiate-promotion function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
