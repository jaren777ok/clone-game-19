
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey, offset = 0, limit = 12 } = await req.json()

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Loading avatars: offset=${offset}, limit=${limit}`)

    // Llamada a la API de HeyGen
    const heygenResponse = await fetch(`https://api.heygen.com/v2/avatars?offset=${offset}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-Api-Key': apiKey
      }
    })

    if (!heygenResponse.ok) {
      const errorText = await heygenResponse.text()
      console.error('HeyGen API Error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Invalid API key or HeyGen service error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const heygenData = await heygenResponse.json()
    
    // Extraer solo los datos que necesitamos
    const avatars = heygenData.data?.avatars?.map((avatar: any) => ({
      avatar_id: avatar.avatar_id,
      avatar_name: avatar.avatar_name,
      preview_image_url: avatar.preview_image_url
    })) || []

    const total = heygenData.data?.total || 0
    const hasMore = (offset + limit) < total

    console.log(`Loaded ${avatars.length} avatars, total: ${total}, hasMore: ${hasMore}`)

    return new Response(
      JSON.stringify({ 
        avatars,
        total,
        hasMore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
