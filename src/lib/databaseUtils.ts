
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// ⭐ FUNCIÓN PRINCIPAL: Verificación directa por base de datos (reemplaza webhook)
export const checkVideoDirectly = async (user: User | null, requestId: string, script: string) => {
  if (!user) {
    console.log('❌ checkVideoDirectly: No hay usuario autenticado');
    return null;
  }

  console.log('🔍 VERIFICACIÓN DIRECTA EN BD:', {
    userId: user.id,
    requestId: requestId,
    scriptLength: script.length,
    timestamp: new Date().toISOString()
  });

  try {
    // Buscar video directamente en la BD con los mismos filtros que usa la webhook
    const { data: videoData, error } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at, script')
      .eq('user_id', user.id)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error en verificación directa:', error);
      return null;
    }

    if (videoData?.video_url) {
      console.log('✅ VIDEO ENCONTRADO VIA VERIFICACIÓN DIRECTA:', {
        videoUrl: videoData.video_url,
        title: videoData.title,
        requestId: videoData.request_id,
        createdAt: videoData.created_at,
        timestamp: new Date().toISOString()
      });

      // Auto-actualizar tracking a completed
      await updateTrackingToCompleted(user, requestId);

      return {
        video_url: videoData.video_url,
        title: videoData.title || 'Video generado',
        request_id: videoData.request_id,
        created_at: videoData.created_at
      };
    }

    console.log('❌ Video no encontrado en verificación directa');
    return null;

  } catch (error) {
    console.error('💥 Error en verificación directa:', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
      userId: user.id,
      timestamp: new Date().toISOString()
    });
    return null;
  }
};

// ⭐ FUNCIÓN: Auto-actualizar tracking a completed
const updateTrackingToCompleted = async (user: User, requestId: string) => {
  try {
    console.log('🔄 Auto-actualizando tracking a COMPLETED:', { 
      userId: user.id, 
      requestId,
      timestamp: new Date().toISOString()
    });
    
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

// FUNCIONES LEGACY: Mantener para compatibilidad y fallback

// Función legacy para búsqueda directa (mantener para casos de recuperación inicial)
export const verifyVideoExists = async (user: User | null, requestId: string, script: string) => {
  console.log('⚠️ verifyVideoExists (legacy) - redirigiendo a checkVideoDirectly');
  return await checkVideoDirectly(user, requestId, script);
};

// Función para recuperar videos "perdidos" - SOLO POR REQUEST_ID (legacy para recuperación inicial)
export const recoverLostVideo = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🔄 RECUPERACIÓN DE VIDEO POR REQUEST_ID (Legacy):', {
    userId: user.id,
    requestId: requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Verificar directamente si el video existe por request_id
    const videoExists = await checkVideoDirectly(user, requestId, script);
    
    if (videoExists) {
      console.log('🎉 VIDEO RECUPERADO EXITOSAMENTE (Legacy):', videoExists);
      return videoExists;
    }

    // Recuperación de videos "expired": Buscar tracking expired que tenga video
    console.log('🔍 Buscando videos con tracking expired...');
    const { data: expiredTracking, error: expiredError } = await supabase
      .from('video_generation_tracking')
      .select('request_id')
      .eq('user_id', user.id)
      .eq('status', 'expired')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!expiredError && expiredTracking && expiredTracking.length > 0) {
      for (const tracking of expiredTracking) {
        console.log('🔍 Verificando tracking expired:', tracking.request_id);
        
        const expiredVideo = await checkVideoDirectly(user, tracking.request_id, script);

        if (expiredVideo) {
          console.log('🎉 ENCONTRADO VIDEO CON TRACKING EXPIRED (Legacy):', expiredVideo);
          return expiredVideo;
        }
      }
    }

    console.log('❌ No se pudo recuperar el video (Legacy)');
    return null;

  } catch (error) {
    console.error('💥 Error en recuperación de video (Legacy):', error);
    return null;
  }
};

// Mantener función legacy para compatibilidad
export const checkVideoInDatabase = async (user: User | null, requestId: string, script: string) => {
  console.log('⚠️ checkVideoInDatabase (legacy) - redirigiendo a checkVideoDirectly');
  return await checkVideoDirectly(user, requestId, script);
};

export const checkFinalVideoResult = async (user: User | null, script: string) => {
  if (!user) return null;
  
  console.log('🔍 VERIFICACIÓN FINAL VIA BD DIRECTA:', {
    userId: user.id,
    scriptPreview: script.substring(0, 50) + '...',
    timestamp: new Date().toISOString()
  });

  // Buscar el tracking más reciente del usuario
  const { data: recentTracking, error: trackingError } = await supabase
    .from('video_generation_tracking')
    .select('request_id, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!trackingError && recentTracking) {
    console.log('🔍 Usando datos del tracking más reciente para verificación directa:', {
      requestId: recentTracking.request_id,
      status: recentTracking.status,
      timestamp: new Date().toISOString()
    });
    
    // Intentar verificar usando verificación directa
    const videoResult = await checkVideoDirectly(user, recentTracking.request_id, script);
    if (videoResult) {
      return { video_url: videoResult.video_url, title: videoResult.title };
    }
  }

  console.log('❌ No se encontró video con verificación directa final');
  return null;
};

// ⭐ FUNCIÓN LEGACY: checkVideoViaWebhook (mantener como fallback opcional)
export const checkVideoViaWebhook = async (user: User | null, requestId: string, script: string) => {
  console.log('⚠️ checkVideoViaWebhook (legacy fallback) - usando verificación directa en su lugar');
  return await checkVideoDirectly(user, requestId, script);
};
