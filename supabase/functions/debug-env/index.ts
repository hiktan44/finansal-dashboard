Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

        return new Response(JSON.stringify({
            data: {
                has_service_role_key: !!serviceRoleKey,
                service_role_key_length: serviceRoleKey?.length || 0,
                service_role_key_prefix: serviceRoleKey?.substring(0, 20) || 'NOT_FOUND',
                has_supabase_url: !!supabaseUrl,
                supabase_url: supabaseUrl || 'NOT_FOUND',
                has_anon_key: !!anonKey,
                anon_key_prefix: anonKey?.substring(0, 20) || 'NOT_FOUND'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: {
                message: error.message,
                stack: error.stack
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
