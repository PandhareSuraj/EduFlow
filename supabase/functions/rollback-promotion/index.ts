import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { job_id } = await req.json();

    // Get job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from('promotion_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    // Check if rollback is allowed
    const { data: canRollback } = await supabaseAdmin
      .rpc('can_rollback_promotion', { job_id });

    if (!canRollback) {
      throw new Error('Rollback window has expired or job cannot be rolled back');
    }

    // Update job status
    await supabaseAdmin
      .from('promotion_jobs')
      .update({ 
        status: 'rolling_back',
        rollback_initiated_at: new Date().toISOString(),
        rollback_initiated_by: user.id
      })
      .eq('id', job_id);

    // Get all student history records for this job
    const { data: historyRecords, error: historyError } = await supabaseAdmin
      .from('student_academic_history')
      .select('*')
      .eq('academic_year_id', job.academic_year_id)
      .eq('is_promoted', true)
      .gte('promotion_date', job.started_at);

    if (historyError) {
      throw historyError;
    }

    let rolledBack = 0;
    let failed = 0;

    // Rollback each student
    for (const record of historyRecords || []) {
      try {
        // Restore previous year/semester
        await supabaseAdmin
          .from('students')
          .update({
            year: record.previous_year,
            semester: record.previous_semester,
            updated_at: new Date().toISOString()
          })
          .eq('id', record.student_id);

        // Mark history as rolled back
        await supabaseAdmin
          .from('student_academic_history')
          .update({
            rollback_date: new Date().toISOString(),
            is_rolled_back: true
          })
          .eq('id', record.id);

        rolledBack++;
      } catch (error) {
        console.error(`Error rolling back student ${record.student_id}:`, error);
        failed++;
      }
    }

    // Update job with rollback results
    await supabaseAdmin
      .from('promotion_jobs')
      .update({
        status: 'rolled_back',
        rollback_completed_at: new Date().toISOString(),
        results: {
          ...job.results,
          rollback: {
            total: historyRecords?.length || 0,
            rolled_back: rolledBack,
            failed
          }
        }
      })
      .eq('id', job_id);

    // Log event
    await supabaseAdmin
      .from('promotion_job_events')
      .insert({
        job_id: job.id,
        event_type: 'rollback_completed',
        event_data: {
          rolled_back: rolledBack,
          failed,
          initiated_by: user.id
        },
      });

    return new Response(JSON.stringify({
      success: true,
      message: 'Promotion rolled back successfully',
      rolled_back: rolledBack,
      failed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in rollback-promotion function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
