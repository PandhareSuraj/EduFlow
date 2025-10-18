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

    if (job.status !== 'pending' && job.status !== 'dry_run') {
      throw new Error('Job is not in pending or dry_run status');
    }

    // Update job status
    await supabaseAdmin
      .from('promotion_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', job_id);

    // Log event
    await supabaseAdmin
      .from('promotion_job_events')
      .insert({
        job_id: job.id,
        event_type: 'processing_started',
        event_data: { started_at: new Date().toISOString() },
      });

    // Build query for eligible students
    let query = supabaseAdmin
      .from('students')
      .select(`
        *,
        courses!inner(duration_months, college_id)
      `)
      .eq('status', 'active');

    const filters = job.filters as any;
    if (filters?.course_ids?.length) {
      query = query.in('course_id', filters.course_ids);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }
    if (filters?.semester) {
      query = query.eq('semester', filters.semester);
    }

    const { data: students, error: studentsError } = await query;

    if (studentsError) {
      throw studentsError;
    }

    const criteria = job.promotion_criteria as any;
    const results = {
      total: students?.length || 0,
      eligible: 0,
      promoted: 0,
      failed: 0,
      details: [] as any[]
    };

    // Process each student
    for (const student of students || []) {
      try {
        let isEligible = true;
        const reasons = [];

        // Check attendance if required
        if (criteria?.min_attendance_percentage) {
          const { data: attendanceData } = await supabaseAdmin
            .from('attendance_records')
            .select('status')
            .eq('student_id', student.id);

          const totalRecords = attendanceData?.length || 0;
          const presentRecords = attendanceData?.filter(r => r.status === 'present').length || 0;
          const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

          if (attendancePercentage < criteria.min_attendance_percentage) {
            isEligible = false;
            reasons.push(`Attendance ${attendancePercentage.toFixed(2)}% < ${criteria.min_attendance_percentage}%`);
          }
        }

        // Check marks if required
        if (criteria?.min_marks_percentage) {
          const { data: examResults } = await supabaseAdmin
            .from('results')
            .select('percentage')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const latestPercentage = examResults?.[0]?.percentage || 0;
          
          if (latestPercentage < criteria.min_marks_percentage) {
            isEligible = false;
            reasons.push(`Marks ${latestPercentage}% < ${criteria.min_marks_percentage}%`);
          }
        }

        // Check fee payment if required
        if (criteria?.check_fee_payment) {
          const { data: feeData } = await supabaseAdmin
            .from('student_fees')
            .select('status, balance_amount')
            .eq('student_id', student.id)
            .in('status', ['pending', 'partial']);

          if (feeData && feeData.length > 0) {
            isEligible = false;
            reasons.push('Pending fee payments');
          }
        }

        if (isEligible) {
          results.eligible++;

          // Calculate next year/semester
          const { data: nextLevel } = await supabaseAdmin
            .rpc('calculate_next_year_semester', {
              current_year: student.year,
              current_semester: student.semester,
              course_duration_months: student.courses.duration_months
            });

          if (nextLevel && nextLevel.length > 0) {
            const next = nextLevel[0];

            if (!next.is_graduating) {
              // Only promote if not graduating
              if (job.status !== 'dry_run') {
                // Update student
                await supabaseAdmin
                  .from('students')
                  .update({
                    year: next.next_year,
                    semester: next.next_semester,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', student.id);

                // Create history record
                await supabaseAdmin
                  .from('student_academic_history')
                  .insert({
                    student_id: student.id,
                    academic_year_id: job.academic_year_id,
                    previous_year: student.year,
                    previous_semester: student.semester,
                    new_year: next.next_year,
                    new_semester: next.next_semester,
                    promotion_date: new Date().toISOString(),
                    is_promoted: true,
                  });

                results.promoted++;
              }

              results.details.push({
                student_id: student.id,
                student_name: student.name,
                from: `Year ${student.year}, Sem ${student.semester}`,
                to: `Year ${next.next_year}, Sem ${next.next_semester}`,
                status: 'eligible',
              });
            } else {
              results.details.push({
                student_id: student.id,
                student_name: student.name,
                from: `Year ${student.year}, Sem ${student.semester}`,
                to: 'Graduating',
                status: 'graduating',
              });
            }
          }
        } else {
          results.failed++;
          results.details.push({
            student_id: student.id,
            student_name: student.name,
            status: 'not_eligible',
            reasons: reasons,
          });
        }
      } catch (error) {
        console.error(`Error processing student ${student.id}:`, error);
        results.failed++;
      }
    }

    // Update job with results
    await supabaseAdmin
      .from('promotion_jobs')
      .update({
        status: job.status === 'dry_run' ? 'dry_run' : 'completed',
        completed_at: new Date().toISOString(),
        total_students: results.total,
        eligible_students: results.eligible,
        promoted_students: results.promoted,
        failed_students: results.failed,
        results: results
      })
      .eq('id', job_id);

    // Log completion event
    await supabaseAdmin
      .from('promotion_job_events')
      .insert({
        job_id: job.id,
        event_type: job.status === 'dry_run' ? 'dry_run_completed' : 'processing_completed',
        event_data: results,
      });

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-promotion function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
