
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache para almacenar avatares por API key
const avatarCache = new Map<string, any[]>();
const cacheTimestamps = new Map<string, number>();
const CACHE_DURATION = 10 * 60 * 1000; // Aumentado a 10 minutos

// Función de retry con backoff exponencial
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Intento ${attempt}/${maxRetries} - Llamando a HeyGen API: ${url}`);
      
      // Timeout más largo para conexiones lentas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Éxito en intento ${attempt}`);
        return response;
      }
      
      // Si es un error 4xx (cliente), no reintentar
      if (response.status >= 400 && response.status < 500) {
        console.log(`❌ Error de cliente (${response.status}), no reintentando`);
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Error en intento ${attempt}:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponencial, máximo 5s
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey, offset = 0, limit = 12 } = await req.json()

    if (!apiKey) {
      console.error('❌ No se proporcionó API key');
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Cargando avatares: offset=${offset}, limit=${limit}, apiKey=${apiKey.substring(0, 10)}...`);

    // Crear una clave única para el cache basada en la API key
    const cacheKey = `avatars_${apiKey.substring(0, 20)}` // Usar substring para evitar claves muy largas
    const now = Date.now()
    
    let allAvatars: any[] = []

    // Verificar si tenemos datos en cache y si no han expirado
    if (avatarCache.has(cacheKey) && cacheTimestamps.has(cacheKey)) {
      const cacheTime = cacheTimestamps.get(cacheKey)!
      if (now - cacheTime < CACHE_DURATION) {
        allAvatars = avatarCache.get(cacheKey)!
        console.log(`💾 Usando cache: ${allAvatars.length} avatares guardados`);
      }
    }

    // Si no hay cache válido, hacer llamada a HeyGen con retry
    if (allAvatars.length === 0) {
      console.log('🌐 Obteniendo avatares de HeyGen API con retry...');
      
      try {
        const heygenResponse = await fetchWithRetry('https://api.heygen.com/v2/avatars', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-Api-Key': apiKey
          }
        });

        if (!heygenResponse.ok) {
          const errorText = await heygenResponse.text();
          console.error('❌ Error de HeyGen API:', {
            status: heygenResponse.status,
            statusText: heygenResponse.statusText,
            body: errorText
          });
          
          // Distinguir entre error de API key vs error de servidor
          if (heygenResponse.status === 401 || heygenResponse.status === 403) {
            return new Response(
              JSON.stringify({ 
                error: 'Invalid API key or insufficient permissions',
                details: 'Please verify your HeyGen API key is correct and has the necessary permissions'
              }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            return new Response(
              JSON.stringify({ 
                error: 'HeyGen service temporarily unavailable',
                details: `Server returned ${heygenResponse.status}. Please try again in a few moments.`
              }),
              { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        const heygenData = await heygenResponse.json();
        console.log('📊 Estructura de respuesta de HeyGen:', {
          hasData: !!heygenData.data,
          hasAvatars: !!heygenData.data?.avatars,
          avatarCount: heygenData.data?.avatars?.length || 0
        });
        
        // Extraer y cachear todos los avatares
        allAvatars = heygenData.data?.avatars?.map((avatar: any) => ({
          avatar_id: avatar.avatar_id,
          avatar_name: avatar.avatar_name,
          preview_image_url: avatar.preview_image_url
        })) || [];

        // Guardar en cache solo si obtuvimos datos
        if (allAvatars.length > 0) {
          avatarCache.set(cacheKey, allAvatars);
          cacheTimestamps.set(cacheKey, now);
          console.log(`💾 Guardados ${allAvatars.length} avatares en cache`);
        } else {
          console.warn('⚠️ No se encontraron avatares en la respuesta de HeyGen');
        }
        
      } catch (error) {
        console.error('💥 Error crítico al obtener avatares:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to connect to HeyGen service',
            details: 'Unable to establish connection with HeyGen API. Please check your internet connection and try again.',
            retryable: true
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Implementar paginación manual
    const startIndex = offset;
    const endIndex = offset + limit;
    const paginatedAvatars = allAvatars.slice(startIndex, endIndex);
    const hasMore = endIndex < allAvatars.length;
    const total = allAvatars.length;

    console.log(`✅ Devolviendo ${paginatedAvatars.length} avatares (${startIndex}-${endIndex-1} de ${total}), hasMore: ${hasMore}`);

    return new Response(
      JSON.stringify({ 
        avatars: paginatedAvatars,
        total,
        hasMore,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        cached: avatarCache.has(cacheKey) && (now - (cacheTimestamps.get(cacheKey) || 0)) < CACHE_DURATION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error general en edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: 'An unexpected error occurred. Please try again.',
        retryable: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
