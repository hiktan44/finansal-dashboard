// Get Economic Data API
// Retrieves cached economic data for frontend consumption

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { indicator, limit, startDate, endDate } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Build query URL
        const queryUrl = new URL(`${supabaseUrl}/rest/v1/economic_data`);
        queryUrl.searchParams.append('select', '*');
        queryUrl.searchParams.append('order', 'period_date.desc');
        
        if (indicator) {
            queryUrl.searchParams.append('indicator_code', `eq.${indicator}`);
        }
        
        if (startDate) {
            queryUrl.searchParams.append('period_date', `gte.${startDate}`);
        }
        
        if (endDate) {
            queryUrl.searchParams.append('period_date', `lte.${endDate}`);
        }
        
        if (limit) {
            queryUrl.searchParams.append('limit', limit.toString());
        }

        const response = await fetch(queryUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Database query failed: ${errorText}`);
        }

        const data = await response.json();

        // Transform data for charts
        const transformedData = {
            dates: [],
            values: [],
            metadata: {
                indicator,
                count: data.length,
                last_updated: data[0]?.fetched_at || null
            }
        };

        if (data && data.length > 0) {
            // Sort by date ascending for time series
            data.reverse();
            
            transformedData.dates = data.map(item => {
                const date = new Date(item.period_date);
                return date.toISOString().split('T')[0];
            });
            
            transformedData.values = data.map(item => item.value);
        }

        return new Response(JSON.stringify({
            data: transformedData
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get economic data error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DATA_FETCH_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
