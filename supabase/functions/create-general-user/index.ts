import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { 
  validateEmail, 
  validatePassword, 
  validateRole,
  validateUUID,
  validateAll,
  createValidationErrorResponse
} from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateGeneralUserRequest {
  email: string;
  password?: string;
  role: string;
  college_id?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey,
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the caller is a super_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller) {
      console.error('Caller auth error:', callerError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (!callerRole) {
      return new Response(
        JSON.stringify({ error: 'Access denied. Super admin only.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: CreateGeneralUserRequest = await req.json();
    console.log('Creating general user:', { email: request.email, role: request.role, college_id: request.college_id });

    // Server-side validation
    const validations = [
      { field: 'email', result: validateEmail(request.email) },
      { field: 'role', result: validateRole(request.role) },
    ];

    if (request.password) {
      validations.push({ field: 'password', result: validatePassword(request.password) });
    }

    if (request.college_id) {
      validations.push({ field: 'college_id', result: validateUUID(request.college_id, 'College ID') });
    }

    const validationResult = validateAll(validations);
    if (!validationResult.valid) {
      console.log('Validation failed:', validationResult.errors);
      return createValidationErrorResponse(validationResult.errors, corsHeaders);
    }

    // Normalize values
    const sanitizedEmail = request.email.toLowerCase().trim();
    const sanitizedRole = request.role.toLowerCase().trim();
    const collegeId = request.college_id ? request.college_id.trim() : null;

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(user => user.email === sanitizedEmail);
    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate password if not provided
    const password = request.password || generateRandomPassword();

    // Create user in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: { role: sanitizedRole, college_id: collegeId }
    });

    if (authError || !authUser?.user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError?.message || 'Failed to create auth user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created in auth:', authUser.user.id);

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: sanitizedRole,
        college_id: collegeId
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // Cleanup: delete the auth user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return new Response(
        JSON.stringify({ error: `Failed to assign role: ${roleError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User role assigned successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user.id,
        email: sanitizedEmail,
        password: request.password ? undefined : password
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-general-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateRandomPassword(): string {
  const length = 12;
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = lower + upper + digits + special;
  // Guarantee complexity requirements
  let password =
    lower[Math.floor(Math.random() * lower.length)] +
    upper[Math.floor(Math.random() * upper.length)] +
    digits[Math.floor(Math.random() * digits.length)];
  for (let i = password.length; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }
  return password;
}
