import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Verify the caller is a super_admin
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if user is super_admin
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || roleData?.role !== 'super_admin') {
        console.error('Role check failed:', roleError);
        return new Response(JSON.stringify({ error: 'Access denied. Super admin only.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Fetching all users with auth admin API...');

    // Fetch all auth users using admin API with pagination
    let allAuthUsers: any[] = [];
    let page = 1;
    const perPage = 1000; // Max allowed per page

    while (true) {
      const { data: authData, error: authListError } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: perPage
      });
      
      if (authListError) {
        console.error('Error listing auth users:', authListError);
        throw new Error(authListError.message);
      }
      
      allAuthUsers = [...allAuthUsers, ...authData.users];
      
      // If we got fewer than perPage, we've reached the end
      if (authData.users.length < perPage) {
        break;
      }
      
      page++;
    }

    console.log(`Found ${allAuthUsers.length} total auth users`);

    // Fetch user roles
    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role, college_id, created_at');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      throw new Error(rolesError.message);
    }

    // Fetch colleges
    const { data: collegesData, error: collegesError } = await supabaseAdmin
      .from('colleges')
      .select('id, name, code');

    if (collegesError) {
      console.error('Error fetching colleges:', collegesError);
      throw new Error(collegesError.message);
    }

    // Create lookup maps
    const collegeMap = new Map(collegesData?.map(c => [c.id, c.name]) || []);
    const authUserMap = new Map(allAuthUsers.map(u => [u.id, u]));

    // Combine data
    const users = (rolesData || []).map(role => {
      const authUser = authUserMap.get(role.user_id);
      return {
        id: role.user_id,
        email: authUser?.email || 'N/A',
        role: role.role,
        college_id: role.college_id,
        college_name: role.college_id ? collegeMap.get(role.college_id) || null : null,
        created_at: role.created_at,
        last_sign_in: authUser?.last_sign_in_at || null
      };
    });

    console.log(`Returning ${users.length} combined users`);

    return new Response(JSON.stringify({
      success: true,
      users,
      colleges: collegesData || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in list-all-users function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
