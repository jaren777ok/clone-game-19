
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      console.error('❌ No se proporcionó API key para validación');
      return new Response(
        JSON.stringify({ 
          isValid: false,
          error: 'API key is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Validando API key de HeyGen: ${apiKey.substring(0, 10)}...`);

    // Validación directa con timeout corto
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    try {
      const response = await fetch('https://api.heygen.com/v2/avatars', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': apiKey
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Respuesta de HeyGen API: ${response.status} - ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API key válida - Avatares disponibles: ${data.data?.avatars?.length || 0}`);
        
        return new Response(
          JSON.stringify({ 
            isValid: true,
            avatarCount: data.data?.avatars?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        const errorText = await response.text();
        console.error(`❌ Error de HeyGen API: ${response.status} - ${errorText}`);

        if (response.status === 401 || response.status === 403) {
          return new Response(
            JSON.stringify({ 
              isValid: false,
              error: 'La clave API no es válida o no tiene los permisos necesarios para acceder a HeyGen.',
              errorType: 'invalid_key'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (response.status >= 500) {
          return new Response(
            JSON.stringify({ 
              isValid: false,
              error: 'El servicio de HeyGen está temporalmente no disponible. Por favor intenta en unos momentos.',
              errorType: 'server_error',
              retryable: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              isValid: false,
              error: `Error inesperado del servicio HeyGen (${response.status}). Por favor intenta de nuevo.`,
              errorType: 'unknown_error',
              retryable: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏰ Timeout en validación de API key');
        return new Response(
          JSON.stringify({ 
            isValid: false,
            error: 'Timeout al conectar con HeyGen. Verifica tu conexión a internet e intenta de nuevo.',
            errorType: 'timeout',
            retryable: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('💥 Error de conexión:', fetchError);
        return new Response(
          JSON.stringify({ 
            isValid: false,
            error: 'Error de conexión con HeyGen. Verifica tu conexión a internet e intenta de nuevo.',
            errorType: 'connection_error',
            retryable: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

  } catch (error) {
    console.error('💥 Error general en validación:', error);
    return new Response(
      JSON.stringify({ 
        isValid: false,
        error: 'Error interno del servidor. Por favor intenta de nuevo.',
        errorType: 'internal_error',
        retryable: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
