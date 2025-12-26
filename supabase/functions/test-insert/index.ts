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

        console.log('Attempting to insert test data...');
        console.log(`URL: ${supabaseUrl}/rest/v1/assets`);

        const testData = {
            symbol: 'EDGE_TEST_' + Date.now(),
            name: 'Edge Function Test',
            asset_type: 'test',
            price: 123.45,
            exchange: 'TEST',
            currency: 'TRY',
            is_active: true
        };

        const insertResponse = await fetch(
            `${supabaseUrl}/rest/v1/assets`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(testData)
            }
        );

        const responseText = await insertResponse.text();
        console.log(`Response status: ${insertResponse.status}`);
        console.log(`Response text: ${responseText}`);

        let responseData = null;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }

        return new Response(JSON.stringify({
            data: {
                success: insertResponse.ok,
                status_code: insertResponse.status,
                test_data: testData,
                response: responseData,
                headers: Object.fromEntries(insertResponse.headers.entries())
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
