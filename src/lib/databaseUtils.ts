
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
    // Estrategia 1: Búsqueda por requestId exacto
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
      console.log('✅ Video encontrado por requestId:', {
        videoUrl: dataByRequestId[0].video_url,
        title: dataByRequestId[0].title,
        createdAt: dataByRequestId[0].created_at
      });
      return dataByRequestId[0];
    } else {
      console.log('⚠️ No se encontró video por requestId exacto');
    }

    // Estrategia 2: Búsqueda por script exacto (más reciente)
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
      console.log('✅ Video encontrado por script:', {
        videoUrl: dataByScript[0].video_url,
        title: dataByScript[0].title,
        requestId: dataByScript[0].request_id,
        createdAt: dataByScript[0].created_at
      });
      return dataByScript[0];
    } else {
      console.log('⚠️ No se encontró video por script exacto');
    }

    // Estrategia 3: Búsqueda por usuario + tiempo reciente (últimos 45 minutos)
    const timeThreshold = new Date(Date.now() - 45 * 60 * 1000).toISOString(); // 45 minutos atrás
    console.log('📋 Estrategia 3: Búsqueda por tiempo reciente desde:', timeThreshold);
    
    const { data: dataByTime, error: errorByTime } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at, script')
      .eq('user_id', user.id)
      .gte('created_at', timeThreshold)
      .order('created_at', { ascending: false })
      .limit(3);

    if (errorByTime) {
      console.error('❌ Error en búsqueda por tiempo:', errorByTime);
    } else if (dataByTime && dataByTime.length > 0) {
      console.log('📊 Videos encontrados por tiempo reciente:', dataByTime.length);
      dataByTime.forEach((video, index) => {
        console.log(`📹 Video ${index + 1}:`, {
          requestId: video.request_id,
          createdAt: video.created_at,
          hasUrl: !!video.video_url,
          scriptMatch: video.script === script.trim()
        });
      });

      // Buscar coincidencia por script en los videos recientes
      const matchByScript = dataByTime.find(video => video.script === script.trim());
      if (matchByScript) {
        console.log('✅ Video encontrado por coincidencia de script en videos recientes');
        return matchByScript;
      }

      // Si no hay coincidencia exacta, tomar el más reciente como último recurso
      const mostRecent = dataByTime[0];
      if (mostRecent && mostRecent.video_url) {
        console.log('⚡ Tomando video más reciente como fallback');
        return mostRecent;
      }
    } else {
      console.log('⚠️ No se encontraron videos en tiempo reciente');
    }

    console.log('❌ No se encontró video con ninguna estrategia');
    return null;

  } catch (error) {
    console.error('💥 Error durante búsqueda completa de video:', error);
    return null;
  }
};

export const checkFinalVideoResult = async (user: User | null, script: string) => {
  if (!user) return null;

  console.log('🔍 Verificación final de video para script:', script.substring(0, 50) + '...');

  try {
    // Usar la misma lógica robusta pero con un requestId dummy para activar todas las estrategias
    const result = await checkVideoInDatabase(user, 'final-check', script);
    
    if (result) {
      console.log('✅ Video encontrado en verificación final');
      return { video_url: result.video_url, title: result.title };
    } else {
      console.log('❌ No se encontró video en verificación final');
      return null;
    }
  } catch (error) {
    console.error('💥 Error en verificación final:', error);
    return null;
  }
};
