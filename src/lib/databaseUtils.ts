
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const checkVideoInDatabase = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🔍 Iniciando búsqueda de video:', {
    userId: user.id,
    requestId: requestId,
    scriptLength: script.length,
    timestamp: new Date().toISOString()
  });

  try {
    // Estrategia 1: Búsqueda por requestId exacto (más confiable)
    console.log('📋 Estrategia 1: Búsqueda por requestId exacto:', requestId);
    const { data: dataByRequestId, error: errorByRequestId } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at')
      .eq('user_id', user.id)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (errorByRequestId) {
      console.error('❌ Error en búsqueda por requestId:', errorByRequestId);
    } else if (dataByRequestId && dataByRequestId.length > 0) {
      console.log('✅ Video encontrado por requestId exacto:', {
        videoUrl: dataByRequestId[0].video_url,
        title: dataByRequestId[0].title,
        createdAt: dataByRequestId[0].created_at,
        requestIdMatch: true
      });
      return dataByRequestId[0];
    } else {
      console.log('⚠️ No se encontró video por requestId exacto');
    }

    // Estrategia 2: Búsqueda por script exacto SOLO si no es una verificación final genérica
    if (requestId !== 'final-check') {
      console.log('📋 Estrategia 2: Búsqueda por script exacto');
      const { data: dataByScript, error: errorByScript } = await supabase
        .from('generated_videos')
        .select('video_url, request_id, title, created_at')
        .eq('user_id', user.id)
        .eq('script', script.trim())
        .order('created_at', { ascending: false })
        .limit(1);

      if (errorByScript) {
        console.error('❌ Error en búsqueda por script:', errorByScript);
      } else if (dataByScript && dataByScript.length > 0) {
        // Verificar que sea un video reciente (últimos 45 minutos)
        const videoTime = new Date(dataByScript[0].created_at).getTime();
        const now = Date.now();
        const minutesAgo = (now - videoTime) / (1000 * 60);
        
        if (minutesAgo <= 45) {
          console.log('✅ Video encontrado por script (reciente):', {
            videoUrl: dataByScript[0].video_url,
            title: dataByScript[0].title,
            requestId: dataByScript[0].request_id,
            createdAt: dataByScript[0].created_at,
            minutesAgo: Math.round(minutesAgo)
          });
          return dataByScript[0];
        } else {
          console.log('⚠️ Video encontrado por script pero es muy antiguo:', {
            minutesAgo: Math.round(minutesAgo),
            createdAt: dataByScript[0].created_at
          });
        }
      } else {
        console.log('⚠️ No se encontró video por script exacto');
      }
    }

    // NO HAY MÁS ESTRATEGIAS - Si llegamos aquí, el video específico no existe
    console.log('❌ Video específico no encontrado - NO usando fallback');
    return null;

  } catch (error) {
    console.error('💥 Error durante búsqueda de video:', error);
    return null;
  }
};

export const checkFinalVideoResult = async (user: User | null, script: string) => {
  if (!user) return null;

  console.log('🔍 VERIFICACIÓN FINAL después de 39 minutos:', {
    scriptPreview: script.substring(0, 50) + '...',
    userId: user.id,
    timestamp: new Date().toISOString()
  });

  try {
    // En la verificación final, buscar por script exacto solamente
    const { data, error } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at')
      .eq('user_id', user.id)
      .eq('script', script.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error en verificación final:', error);
      return null;
    }

    if (data && data.length > 0) {
      // Verificar que sea un video muy reciente (últimos 60 minutos para dar margen)
      const videoTime = new Date(data[0].created_at).getTime();
      const now = Date.now();
      const minutesAgo = (now - videoTime) / (1000 * 60);
      
      if (minutesAgo <= 60) {
        console.log('✅ Video encontrado en verificación final:', {
          videoUrl: data[0].video_url,
          title: data[0].title,
          requestId: data[0].request_id,
          minutesAgo: Math.round(minutesAgo)
        });
        return { video_url: data[0].video_url, title: data[0].title };
      } else {
        console.log('⚠️ Video encontrado pero es demasiado antiguo para ser el actual:', {
          minutesAgo: Math.round(minutesAgo)
        });
      }
    }

    console.log('❌ No se encontró el video específico después de 39 minutos');
    return null;
    
  } catch (error) {
    console.error('💥 Error en verificación final:', error);
    return null;
  }
};
