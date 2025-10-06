import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GSC_ACCESS_TOKEN = Deno.env.get('GSC_ACCESS_TOKEN');
    
    if (!GSC_ACCESS_TOKEN) {
      throw new Error('GSC_ACCESS_TOKEN not configured');
    }

    console.log('Fetching GSC properties...');
    
    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${GSC_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GSC API error:', response.status, errorText);
      throw new Error(`GSC API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GSC properties fetched:', data.siteEntry?.length || 0);

    return new Response(
      JSON.stringify({ properties: data.siteEntry || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching GSC properties:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
