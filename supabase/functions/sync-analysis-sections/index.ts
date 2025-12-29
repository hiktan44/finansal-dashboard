// Sync Analysis Sections to Database
// Updates analysis_sections table with current content structure

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
        const { sections } = await req.json();

        if (!sections || !Array.isArray(sections)) {
            throw new Error('Sections array is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        const results = [];

        for (const section of sections) {
            try {
                const record = {
                    section_id: section.id,
                    title: section.title,
                    description: section.description,
                    icon: section.icon,
                    slide_range_start: section.slideRange[0],
                    slide_range_end: section.slideRange[1],
                    category: section.category || 'general',
                    update_frequency: section.updateFrequency,
                    last_updated: section.lastUpdate,
                    subsection_count: section.subsections?.length || 0,
                    data_points: section.subsections || []
                };

                // Upsert section
                const response = await fetch(`${supabaseUrl}/rest/v1/analysis_sections`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates,return=representation'
                    },
                    body: JSON.stringify(record)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Insert failed: ${errorText}`);
                }

                const data = await response.json();
                results.push({
                    section_id: section.id,
                    status: 'success',
                    record: data[0]
                });

            } catch (error) {
                console.error(`Error syncing section ${section.id}:`, error);
                results.push({
                    section_id: section.id,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return new Response(JSON.stringify({
            data: {
                results,
                total_synced: results.filter(r => r.status === 'success').length,
                total_errors: results.filter(r => r.status === 'error').length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Sync sections error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'SYNC_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
