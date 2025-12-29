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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase configuration missing');
    }

    console.log('Starting price update for all assets...');

    // Tüm varlık türleri için güncelleme yap
    const assetTypes = ['bist', 'crypto', 'currency', 'metal'];
    let totalUpdated = 0;

    for (const assetType of assetTypes) {
      console.log(`Fetching ${assetType} data...`);
      
      try {
        // fetch-market-data fonksiyonunu çağır
        const response = await fetch(`${supabaseUrl}/functions/v1/fetch-market-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ assetType })
        });

        if (response.ok) {
          const result = await response.json();
          const count = result?.data?.count || 0;
          totalUpdated += count;
          console.log(`${assetType}: ${count} assets updated`);
        } else {
          console.error(`Failed to fetch ${assetType}:`, response.status);
        }
      } catch (error) {
        console.error(`Error updating ${assetType}:`, error);
      }

      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Price update completed. Total: ${totalUpdated} assets`);

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          totalUpdated,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Update error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'UPDATE_ERROR',
          message: error.message
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
