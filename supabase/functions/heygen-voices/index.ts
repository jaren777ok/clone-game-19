
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Voice {
  voice_id: string;
  voice_name: string;
  preview_audio_url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, offset = 0, limit = 12 } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching voices from HeyGen API with offset: ${offset}, limit: ${limit}`);

    // Fetch voices from HeyGen API
    const response = await fetch('https://api.heygen.com/v2/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('HeyGen API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch voices from HeyGen' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log(`HeyGen API returned ${data.data?.length || 0} total voices`);

    // HeyGen returns all voices at once, so we need to paginate manually
    const allVoices: Voice[] = (data.data || []).map((voice: any) => ({
      voice_id: voice.voice_id,
      voice_name: voice.name || voice.voice_name,
      preview_audio_url: voice.preview_audio || voice.preview_audio_url || '',
    }));

    // Manual pagination
    const startIndex = offset;
    const endIndex = offset + limit;
    const paginatedVoices = allVoices.slice(startIndex, endIndex);
    
    const totalVoices = allVoices.length;
    const hasMore = endIndex < totalVoices;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalVoices / limit);

    console.log(`Returning ${paginatedVoices.length} voices (${startIndex}-${endIndex} of ${totalVoices})`);

    return new Response(
      JSON.stringify({
        voices: paginatedVoices,
        total: totalVoices,
        hasMore,
        currentPage,
        totalPages,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in heygen-voices function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
