import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const verifyVideoExists = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🎯 VERIFICACIÓN DIRECTA Y SIMPLE:', {
    userId: user.id,
    requestId: requestId,
    scriptLength: script.length,
    timestamp: new Date().toISOString()
  });

  try {
    // ⭐ ESTRATEGIA PRINCIPAL: Búsqueda DIRECTA por user_id + request_id
    console.log('🔍 Buscando por user_id + request_id:', { userId: user.id, requestId });
    
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
      
      console.log('✅ VIDEO ENCONTRADO POR REQUEST_ID:', {
        videoUrl: video.video_url,
        title: video.title,
        requestId: video.request_id,
        createdAt: video.created_at
      });

      // ⭐ AUTO-ACTUALIZAR TRACKING A COMPLETED
      await updateTrackingToCompleted(user, requestId);
      
      return {
        video_url: video.video_url,
        title: video.title,
        request_id: video.request_id,
        created_at: video.created_at
      };
    }

    // FALLBACK: Búsqueda por script exacto (solo si no encontró por request_id)
    console.log('🔍 Fallback: Buscando por script exacto');
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
      
      if (hoursAgo <= 2) {
        console.log('✅ VIDEO ENCONTRADO POR SCRIPT (reciente):', {
          videoUrl: video.video_url,
          title: video.title,
          requestId: video.request_id,
          hoursAgo: Math.round(hoursAgo * 100) / 100
        });

        // ⭐ AUTO-ACTUALIZAR TRACKING A COMPLETED
        await updateTrackingToCompleted(user, requestId);
        
        return {
          video_url: video.video_url,
          title: video.title,
          request_id: video.request_id,
          created_at: video.created_at
        };
      }
    }

    console.log('❌ NO SE ENCONTRÓ VIDEO - Continuando verificación automática');
    return null;

  } catch (error) {
    console.error('💥 Error durante verificación:', error);
    return null;
  }
};

// ⭐ NUEVA FUNCIÓN: Auto-actualizar tracking a completed
const updateTrackingToCompleted = async (user: User, requestId: string) => {
  try {
    console.log('🔄 Auto-actualizando tracking a COMPLETED:', { userId: user.id, requestId });
    
    const { error } = await supabase
      .from('video_generation_tracking')
      .update({ 
        status: 'completed',
        last_check_time: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('request_id', requestId);

    if (error) {
      console.error('❌ Error actualizando tracking:', error);
    } else {
      console.log('✅ Tracking actualizado correctamente a COMPLETED');
    }
  } catch (error) {
    console.error('💥 Error en updateTrackingToCompleted:', error);
  }
};

// Función para recuperar videos "perdidos" - SIMPLIFICADA
export const recoverLostVideo = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🔄 RECUPERACIÓN DE VIDEO PERDIDO:', {
    userId: user.id,
    requestId: requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Verificar directamente si el video existe
    const videoExists = await verifyVideoExists(user, requestId, script);
    
    if (videoExists) {
      console.log('🎉 VIDEO RECUPERADO EXITOSAMENTE:', videoExists);
      return videoExists;
    }

    // ⭐ RECUPERACIÓN DE VIDEOS "EXPIRED": Buscar tracking expired que tenga video
    console.log('🔍 Buscando videos con tracking expired...');
    const { data: expiredTracking, error: expiredError } = await supabase
      .from('video_generation_tracking')
      .select('request_id, script')
      .eq('user_id', user.id)
      .eq('status', 'expired')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!expiredError && expiredTracking && expiredTracking.length > 0) {
      for (const tracking of expiredTracking) {
        console.log('🔍 Verificando tracking expired:', tracking.request_id);
        
        const { data: expiredVideo, error: videoError } = await supabase
          .from('generated_videos')
          .select('video_url, request_id, title, created_at')
          .eq('user_id', user.id)
          .eq('request_id', tracking.request_id)
          .limit(1);

        if (!videoError && expiredVideo && expiredVideo.length > 0) {
          console.log('🎉 ENCONTRADO VIDEO CON TRACKING EXPIRED - Auto-corrigiendo:', expiredVideo[0]);
          
          // Auto-corregir tracking de expired → completed
          await updateTrackingToCompleted(user, tracking.request_id);
          
          return {
            video_url: expiredVideo[0].video_url,
            title: expiredVideo[0].title,
            request_id: expiredVideo[0].request_id,
            created_at: expiredVideo[0].created_at
          };
        }
      }
    }

    console.log('❌ No se pudo recuperar el video');
    return null;

  } catch (error) {
    console.error('💥 Error en recuperación de video:', error);
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

// Mantener función legacy para compatibilidad
export const checkVideoInDatabase = async (user: User | null, requestId: string, script: string) => {
  console.log('⚠️ checkVideoInDatabase (legacy) - redirigiendo a verifyVideoExists');
  return await verifyVideoExists(user, requestId, script);
};

export const checkFinalVideoResult = async (user: User | null, script: string) => {
  if (!user) return null;
  
  console.log('🔍 VERIFICACIÓN FINAL MEJORADA:', {
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
    const videoResult = await verifyVideoExists(user, recentTracking.request_id, script);
    if (videoResult) {
      return videoResult;
    }
  }

  // Fallback: verificación directa por script
  const videoResult = await verifyVideoExists(user, 'final-check', script);
  return videoResult ? { video_url: videoResult.video_url, title: videoResult.title } : null;
};
