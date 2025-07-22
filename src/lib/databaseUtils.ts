
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const verifyVideoExists = async (user: User | null, requestId: string) => {
  if (!user) return null;

  console.log('🎯 VERIFICACIÓN DIRECTA POR REQUEST_ID ÚNICAMENTE:', {
    userId: user.id,
    requestId: requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // ⭐ BÚSQUEDA ÚNICA: Solo por user_id + request_id
    console.log('🔍 Buscando ÚNICAMENTE por user_id + request_id:', { userId: user.id, requestId });
    
    const { data: videoByRequestId, error: errorByRequestId } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title, created_at, script')
      .eq('user_id', user.id)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (errorByRequestId) {
      console.error('❌ Error en búsqueda por requestId:', errorByRequestId);
      return null;
    }

    if (videoByRequestId && videoByRequestId.length > 0) {
      const video = videoByRequestId[0];
      
      console.log('✅ VIDEO ENCONTRADO POR REQUEST_ID:', {
        videoUrl: video.video_url,
        title: video.title,
        requestId: video.request_id,
        createdAt: video.created_at,
        note: 'NO se auto-actualiza tracking aquí - se hace después de mostrar pantalla de éxito'
      });

      // ⭐ CAMBIO CRÍTICO: NO actualizar tracking aquí - se hará después de mostrar la pantalla de éxito
      // await updateTrackingToCompleted(user, requestId); // REMOVIDO
      
      return {
        video_url: video.video_url,
        title: video.title,
        request_id: video.request_id,
        created_at: video.created_at
      };
    }

    console.log('❌ NO SE ENCONTRÓ VIDEO CON REQUEST_ID - Sin fallbacks');
    return null;

  } catch (error) {
    console.error('💥 Error durante verificación:', error);
    return null;
  }
};

// ⭐ FUNCIÓN: Auto-actualizar tracking a completed (ahora se llama desde videoDetected)
export const updateTrackingToCompleted = async (user: User, requestId: string) => {
  try {
    console.log('🔄 Actualizando tracking a COMPLETED:', { userId: user.id, requestId });
    
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

// Función para recuperar videos "perdidos" - SOLO POR REQUEST_ID
export const recoverLostVideo = async (user: User | null, requestId: string) => {
  if (!user) return null;

  console.log('🔄 RECUPERACIÓN DE VIDEO POR REQUEST_ID ÚNICAMENTE:', {
    userId: user.id,
    requestId: requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Verificar directamente si el video existe por request_id
    const videoExists = await verifyVideoExists(user, requestId);
    
    if (videoExists) {
      console.log('🎉 VIDEO RECUPERADO EXITOSAMENTE:', videoExists);
      return videoExists;
    }

    // ⭐ RECUPERACIÓN DE VIDEOS "EXPIRED": Buscar tracking expired que tenga video
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

    console.log('❌ No se pudo recuperar el video - Solo búsqueda por request_id');
    return null;

  } catch (error) {
    console.error('💥 Error en recuperación de video:', error);
    return null;
  }
};

// Mantener función legacy para compatibilidad
export const checkVideoInDatabase = async (user: User | null, requestId: string) => {
  console.log('⚠️ checkVideoInDatabase (legacy) - redirigiendo a verifyVideoExists');
  return await verifyVideoExists(user, requestId);
};

export const checkFinalVideoResult = async (user: User | null) => {
  if (!user) return null;
  
  console.log('🔍 VERIFICACIÓN FINAL - SOLO POR TRACKING RECIENTE:', {
    userId: user.id,
    timestamp: new Date().toISOString()
  });

  // Buscar el tracking más reciente del usuario
  const { data: recentTracking, error: trackingError } = await supabase
    .from('video_generation_tracking')
    .select('request_id, status')
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
    const videoResult = await verifyVideoExists(user, recentTracking.request_id);
    if (videoResult) {
      return { video_url: videoResult.video_url, title: videoResult.title };
    }
  }

  console.log('❌ No se encontró video con tracking reciente');
  return null;
};
