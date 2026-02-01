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
  college_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: CreateGeneralUserRequest = await req.json();
    console.log('Creating general user:', { email: request.email, role: request.role, college_id: request.college_id });

    // Server-side validation
    const validations = [
      { field: 'email', result: validateEmail(request.email) },
      { field: 'role', result: validateRole(request.role) },
    ];

    // Validate password if provided
    if (request.password) {
      validations.push({ field: 'password', result: validatePassword(request.password) });
    }

    // Validate college_id if provided
    if (request.college_id) {
      validations.push({ field: 'college_id', result: validateUUID(request.college_id, 'College ID') });
    }

    const validationResult = validateAll(validations);

    if (!validationResult.valid) {
      return createValidationErrorResponse(validationResult.errors, corsHeaders);
    }

    // Sanitize email
    const sanitizedEmail = request.email.toLowerCase().trim();

    // Initialize Supabase admin client
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
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(user => user.email === sanitizedEmail);
    
    if (userExists) {
      return new Response(
        JSON.stringify({ 
          error: 'User with this email already exists' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate password if not provided
    const password = request.password || generateRandomPassword();

    // Create user in auth with sanitized email
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: request.role,
        college_id: request.college_id
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('User created in auth:', authUser.user.id);

    // Assign role in user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: request.role,
        college_id: request.college_id || null
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      
      // Cleanup: delete the auth user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw roleError;
    }

    console.log('User role assigned successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user.id,
        email: request.email,
        password: request.password ? undefined : password // Only return password if it was auto-generated
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in create-general-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateRandomPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}