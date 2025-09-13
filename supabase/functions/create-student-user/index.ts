import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateStudentUserRequest {
  email: string;
  password: string;
  role: string;
  full_name: string;
  student_id: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, role, full_name, student_id }: CreateStudentUserRequest = await req.json();

    // Create admin client with service role key
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

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    if (userExists) {
      return new Response(JSON.stringify({
        success: false,
        error: 'A user with this email already exists'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
        student_id,
        role
      },
      email_confirm: true
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw new Error(userError.message);
    }

    if (!userData.user) {
      throw new Error('User creation failed - no user data returned');
    }

    // Get user's college from the student record  
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('students')
      .select('college_id')
      .eq('id', student_id)
      .single();

    if (studentError) {
      console.error('Error fetching student college:', studentError);
      throw new Error('Could not find student college information');
    }

    // Create user role record
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: role,
        college_id: studentData.college_id
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      // Don't throw here as user was created successfully
    }

    console.log('Student user created successfully:', userData.user.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Student user created successfully',
      user_id: userData.user.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in create-student-user function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});