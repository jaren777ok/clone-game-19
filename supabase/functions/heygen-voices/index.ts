
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

// Cache para voces
const voiceCache = new Map<string, Voice[]>();
const cacheTimestamps = new Map<string, number>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, offset = 0, limit = 12 } = await req.json();

    if (!apiKey) {
      console.error('❌ No se proporcionó API key');
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔍 Cargando voces: offset=${offset}, limit=${limit}, apiKey=${apiKey.substring(0, 10)}...`);

    // Cache key
    const cacheKey = `voices_${apiKey.substring(0, 20)}`;
    const now = Date.now();
    
    let allVoices: Voice[] = [];

    // Verificar cache
    if (voiceCache.has(cacheKey) && cacheTimestamps.has(cacheKey)) {
      const cacheTime = cacheTimestamps.get(cacheKey)!;
      if (now - cacheTime < CACHE_DURATION) {
        allVoices = voiceCache.get(cacheKey)!;
        console.log(`💾 Usando cache: ${allVoices.length} voces guardadas`);
      }
    }

    // Si no hay cache válido, hacer llamada a HeyGen con retry
    if (allVoices.length === 0) {
      console.log('🌐 Obteniendo voces de HeyGen API con retry...');

      try {
        const response = await fetchWithRetry('https://api.heygen.com/v2/voices', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Api-Key': apiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error de HeyGen API:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });

          // Distinguir entre error de API key vs error de servidor
          if (response.status === 401 || response.status === 403) {
            return new Response(
              JSON.stringify({ 
                error: 'Invalid API key or insufficient permissions',
                details: 'Please verify your HeyGen API key is correct and has the necessary permissions'
              }),
              { 
                status: 401, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          } else {
            return new Response(
              JSON.stringify({ 
                error: 'HeyGen service temporarily unavailable',
                details: `Server returned ${response.status}. Please try again in a few moments.`
              }),
              { 
                status: 502, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
        }

        const data = await response.json();
        console.log('📊 Estructura de respuesta de HeyGen para voces:', {
          hasData: !!data.data,
          hasVoices: !!data.data?.voices,
          voiceCount: data.data?.voices?.length || 0
        });

        // Extract voices from the correct path in HeyGen response
        if (data.data && data.data.voices && Array.isArray(data.data.voices)) {
          // HeyGen API returns voices in data.data.voices
          allVoices = data.data.voices.map((voice: any) => ({
            voice_id: voice.voice_id,
            voice_name: voice.name || voice.voice_name || 'Unknown Voice',
            preview_audio_url: voice.preview_audio || voice.preview_audio_url || '',
          }));
        } else if (data.data && Array.isArray(data.data)) {
          // Fallback: if voices are directly in data.data
          allVoices = data.data.map((voice: any) => ({
            voice_id: voice.voice_id,
            voice_name: voice.name || voice.voice_name || 'Unknown Voice',
            preview_audio_url: voice.preview_audio || voice.preview_audio_url || '',
          }));
        }

        // Guardar en cache solo si obtuvimos datos
        if (allVoices.length > 0) {
          voiceCache.set(cacheKey, allVoices);
          cacheTimestamps.set(cacheKey, now);
          console.log(`💾 Guardadas ${allVoices.length} voces en cache`);
        } else {
          console.warn('⚠️ No se encontraron voces en la respuesta de HeyGen');
        }

      } catch (error) {
        console.error('💥 Error crítico al obtener voces:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to connect to HeyGen service',
            details: 'Unable to establish connection with HeyGen API. Please check your internet connection and try again.',
            retryable: true
          }),
          { 
            status: 503, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Manual pagination
    const startIndex = offset;
    const endIndex = offset + limit;
    const paginatedVoices = allVoices.slice(startIndex, endIndex);
    
    const totalVoices = allVoices.length;
    const hasMore = endIndex < totalVoices;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalVoices / limit);

    console.log(`✅ Devolviendo ${paginatedVoices.length} voces (${startIndex}-${endIndex} de ${totalVoices})`);

    return new Response(
      JSON.stringify({
        voices: paginatedVoices,
        total: totalVoices,
        hasMore,
        currentPage,
        totalPages,
        cached: voiceCache.has(cacheKey) && (now - (cacheTimestamps.get(cacheKey) || 0)) < CACHE_DURATION
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Error general en heygen-voices function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: 'An unexpected error occurred. Please try again.',
        retryable: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
