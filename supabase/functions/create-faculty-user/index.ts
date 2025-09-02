import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateFacultyUserRequest {
  email: string;
  password: string;
  facultyId: string;
  role: string;
  collegeId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, facultyId, role, collegeId }: CreateFacultyUserRequest = await req.json();

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

    // Create user with confirmed email
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // This confirms the email automatically
    });

    if (userError || !user.user) {
      console.error('Error creating user:', userError);
      throw new Error(userError?.message || 'Failed to create user');
    }

    console.log('User created successfully:', user.user.id);

    // Update faculty record with user_id
    const { error: facultyError } = await supabaseAdmin
      .from('faculty')
      .update({ user_id: user.user.id })
      .eq('id', facultyId);

    if (facultyError) {
      console.error('Error updating faculty:', facultyError);
      // Clean up user if faculty update fails
      await supabaseAdmin.auth.admin.deleteUser(user.user.id);
      throw new Error('Failed to link faculty account');
    }

    console.log('Faculty updated with user_id');

    // Assign role to user (upsert to handle conflicts)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: user.user.id,
        role,
        college_id: collegeId
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Clean up user and faculty if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(user.user.id);
      await supabaseAdmin
        .from('faculty')
        .update({ user_id: null })
        .eq('id', facultyId);
      throw new Error('Failed to assign user role');
    }

    console.log('Role assigned successfully');

    return new Response(JSON.stringify({
      success: true,
      userId: user.user.id,
      message: 'Faculty login created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in create-faculty-user function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});