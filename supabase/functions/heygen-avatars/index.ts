
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache para almacenar avatares por API key
const avatarCache = new Map<string, any[]>();
const cacheTimestamps = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

    // Crear una clave única para el cache basada en la API key
    const cacheKey = `avatars_${apiKey}`
    const now = Date.now()
    
    let allAvatars: any[] = []

    // Verificar si tenemos datos en cache y si no han expirado
    if (avatarCache.has(cacheKey) && cacheTimestamps.has(cacheKey)) {
      const cacheTime = cacheTimestamps.get(cacheKey)!
      if (now - cacheTime < CACHE_DURATION) {
        allAvatars = avatarCache.get(cacheKey)!
        console.log(`Using cached avatars: ${allAvatars.length} total`)
      }
    }

    // Si no hay cache válido, hacer llamada a HeyGen
    if (allAvatars.length === 0) {
      console.log('Fetching all avatars from HeyGen API...')
      
      // Hacer llamada a HeyGen sin límite para obtener todos los avatares
      const heygenResponse = await fetch('https://api.heygen.com/v2/avatars', {
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
      
      // Extraer y cachear todos los avatares
      allAvatars = heygenData.data?.avatars?.map((avatar: any) => ({
        avatar_id: avatar.avatar_id,
        avatar_name: avatar.avatar_name,
        preview_image_url: avatar.preview_image_url
      })) || []

      // Guardar en cache
      avatarCache.set(cacheKey, allAvatars)
      cacheTimestamps.set(cacheKey, now)
      
      console.log(`Cached ${allAvatars.length} avatars from HeyGen`)
    }

    // Implementar paginación manual
    const startIndex = offset
    const endIndex = offset + limit
    const paginatedAvatars = allAvatars.slice(startIndex, endIndex)
    const hasMore = endIndex < allAvatars.length
    const total = allAvatars.length

    console.log(`Returning ${paginatedAvatars.length} avatars (${startIndex}-${endIndex-1} of ${total}), hasMore: ${hasMore}`)

    return new Response(
      JSON.stringify({ 
        avatars: paginatedAvatars,
        total,
        hasMore,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
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
