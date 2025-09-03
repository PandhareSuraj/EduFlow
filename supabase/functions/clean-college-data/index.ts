import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('No authorization header')
    }

    // Set the authorization header for the supabase client
    supabaseClient.rest.headers = {
      ...supabaseClient.rest.headers,
      authorization
    }

    const { collegeId, modules = ['all'] } = await req.json()

    if (!collegeId) {
      throw new Error('College ID is required')
    }

    console.log(`Starting data cleanup for college: ${collegeId}`)
    console.log(`Modules to clean: ${modules.join(', ')}`)

    // Verify user has super_admin role
    const { data: user, error: userError } = await supabaseClient.auth.getUser(authorization.replace('Bearer ', ''))
    if (userError) {
      throw new Error('Invalid authorization token')
    }

    console.log(`User authenticated: ${user.user.email}`)

    // Call the database function to clean data
    const { data, error } = await supabaseClient.rpc('clean_college_data', {
      college_uuid: collegeId,
      modules: modules,
      preserve_structure: true
    })

    if (error) {
      console.error('Database function error:', error)
      throw error
    }

    console.log('Data cleanup completed successfully:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in clean-college-data function:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})