
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const verifyVideoExists = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🔍 VERIFICACIÓN ROBUSTA INICIADA:', {
    userId: user.id,
    requestId: requestId,
    scriptLength: script.length,
    timestamp: new Date().toISOString()
  });

  try {
    // ESTRATEGIA 1: Búsqueda DIRECTA por user_id + request_id (más confiable)
    console.log('📋 Estrategia 1: Búsqueda directa por user_id + request_id');
    const { data: videoByRequestId, error: errorByRequestId } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at, script')
      .eq('user_id', user.id)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (errorByRequestId) {
      console.error('❌ Error en búsqueda por requestId:', errorByRequestId);
    } else if (videoByRequestId && videoByRequestId.length > 0) {
      const video = videoByRequestId[0];
      // Verificar que sea reciente (últimas 2 horas)
      const videoTime = new Date(video.created_at).getTime();
      const now = Date.now();
      const hoursAgo = (now - videoTime) / (1000 * 60 * 60);
      
      console.log('✅ VIDEO ENCONTRADO POR REQUEST_ID:', {
        videoUrl: video.video_url,
        title: video.title,
        requestId: video.request_id,
        createdAt: video.created_at,
        hoursAgo: Math.round(hoursAgo * 100) / 100,
        scriptMatch: video.script.trim() === script.trim()
      });
      
      if (hoursAgo <= 2) {
        return {
          video_url: video.video_url,
          title: video.title,
          request_id: video.request_id,
          created_at: video.created_at
        };
      } else {
        console.log('⚠️ Video encontrado pero es muy antiguo:', { hoursAgo });
      }
    }

    // ESTRATEGIA 2: Búsqueda por user_id + script (fallback)
    console.log('📋 Estrategia 2: Búsqueda por user_id + script exacto');
    const { data: videoByScript, error: errorByScript } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at, script')
      .eq('user_id', user.id)
      .eq('script', script.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (errorByScript) {
      console.error('❌ Error en búsqueda por script:', errorByScript);
    } else if (videoByScript && videoByScript.length > 0) {
      const video = videoByScript[0];
      // Verificar que sea reciente (últimas 2 horas)
      const videoTime = new Date(video.created_at).getTime();
      const now = Date.now();
      const hoursAgo = (now - videoTime) / (1000 * 60 * 60);
      
      console.log('✅ VIDEO ENCONTRADO POR SCRIPT:', {
        videoUrl: video.video_url,
        title: video.title,
        requestId: video.request_id,
        createdAt: video.created_at,
        hoursAgo: Math.round(hoursAgo * 100) / 100,
        originalRequestId: requestId
      });
      
      if (hoursAgo <= 2) {
        return {
          video_url: video.video_url,
          title: video.title,
          request_id: video.request_id,
          created_at: video.created_at
        };
      } else {
        console.log('⚠️ Video encontrado por script pero es muy antiguo:', { hoursAgo });
      }
    }

    // ESTRATEGIA 3: Verificación de videos recientes del usuario (último recurso)
    console.log('📋 Estrategia 3: Búsqueda de videos recientes del usuario');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: recentVideos, error: errorRecent } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at, script')
      .eq('user_id', user.id)
      .gte('created_at', twoHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (errorRecent) {
      console.error('❌ Error en búsqueda de videos recientes:', errorRecent);
    } else if (recentVideos && recentVideos.length > 0) {
      console.log('📋 Videos recientes encontrados:', recentVideos.length);
      
      // Buscar coincidencia por script similar (90% de coincidencia)
      for (const video of recentVideos) {
        const similarity = calculateStringSimilarity(video.script.trim(), script.trim());
        console.log('🔍 Comparando video:', {
          requestId: video.request_id,
          similarity: Math.round(similarity * 100) + '%',
          createdAt: video.created_at
        });
        
        if (similarity > 0.9) {
          console.log('✅ VIDEO ENCONTRADO POR SIMILITUD DE SCRIPT:', {
            videoUrl: video.video_url,
            title: video.title,
            requestId: video.request_id,
            similarity: Math.round(similarity * 100) + '%'
          });
          
          return {
            video_url: video.video_url,
            title: video.title,
            request_id: video.request_id,
            created_at: video.created_at
          };
        }
      }
    }

    console.log('❌ NO SE ENCONTRÓ VIDEO ESPECÍFICO tras verificación robusta');
    return null;

  } catch (error) {
    console.error('💥 Error durante verificación robusta:', error);
    return null;
  }
};

// Función para calcular similitud entre strings
const calculateStringSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Función para calcular distancia de edición (Levenshtein)
const getEditDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Función para recuperar videos "perdidos"
export const recoverLostVideo = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🔄 INICIANDO RECUPERACIÓN DE VIDEO PERDIDO:', {
    userId: user.id,
    requestId: requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Verificar si el video existe
    const videoExists = await verifyVideoExists(user, requestId, script);
    
    if (videoExists) {
      console.log('🎉 VIDEO RECUPERADO:', videoExists);
      
      // Verificar el estado en tracking
      const { data: trackingData, error: trackingError } = await supabase
        .from('video_generation_tracking')
        .select('status, id')
        .eq('user_id', user.id)
        .eq('request_id', requestId)
        .single();

      if (!trackingError && trackingData && trackingData.status === 'expired') {
        console.log('🔄 Actualizando tracking de "expired" a "completed"');
        
        // Actualizar el tracking a completed
        const { error: updateError } = await supabase
          .from('video_generation_tracking')
          .update({ 
            status: 'completed',
            last_check_time: new Date().toISOString()
          })
          .eq('id', trackingData.id);

        if (updateError) {
          console.error('❌ Error actualizando tracking:', updateError);
        } else {
          console.log('✅ Tracking actualizado correctamente');
        }
      }
      
      return videoExists;
    }

    console.log('❌ No se pudo recuperar el video');
    return null;

  } catch (error) {
    console.error('💥 Error en recuperación de video:', error);
    return null;
  }
};

// Mantener función legacy para compatibilidad
export const checkVideoInDatabase = async (user: User | null, requestId: string, script: string) => {
  console.log('⚠️ checkVideoInDatabase (legacy) - redirigiendo a verifyVideoExists');
  return await verifyVideoExists(user, requestId, script);
};

export const checkFinalVideoResult = async (user: User | null, script: string) => {
  if (!user) return null;
  
  console.log('🔍 VERIFICACIÓN FINAL (mejorada):', {
    userId: user.id,
    scriptPreview: script.substring(0, 50) + '...',
    timestamp: new Date().toISOString()
  });

  // Buscar el tracking más reciente del usuario
  const { data: recentTracking, error: trackingError } = await supabase
    .from('video_generation_tracking')
    .select('request_id, script, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!trackingError && recentTracking) {
    console.log('🔍 Usando datos del tracking más reciente:', {
      requestId: recentTracking.request_id,
      status: recentTracking.status
    });
    
    // Intentar recuperar el video usando los datos del tracking
    const videoResult = await recoverLostVideo(user, recentTracking.request_id, script);
    if (videoResult) {
      return videoResult;
    }
  }

  // Fallback: verificación directa
  const videoResult = await verifyVideoExists(user, 'final-check', script);
  return videoResult ? { video_url: videoResult.video_url, title: videoResult.title } : null;
};
