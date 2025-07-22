
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// ⭐ NUEVA FUNCIÓN: Verificación por webhook
export const checkVideoViaWebhook = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🌐 VERIFICACIÓN POR WEBHOOK:', {
    userId: user.id,
    requestId: requestId,
    scriptLength: script.length,
    webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado',
    timestamp: new Date().toISOString()
  });

  try {
    const webhookData = {
      request_id: requestId,
      user_id: user.id,
      script: script
    };

    console.log('📤 Enviando datos a webhook:', webhookData);

    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/videogenerado', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      console.error('❌ Error en respuesta de webhook:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('📥 Respuesta de webhook recibida:', data);

    // Validar formato de respuesta: [{ "video_url": "url" }]
    if (Array.isArray(data) && data.length > 0 && data[0].video_url) {
      const videoUrl = data[0].video_url;
      
      console.log('✅ VIDEO ENCONTRADO VIA WEBHOOK:', {
        videoUrl: videoUrl,
        requestId: requestId
      });

      // Auto-actualizar tracking a completed
      await updateTrackingToCompleted(user, requestId);

      return {
        video_url: videoUrl,
        title: 'Video generado via webhook',
        request_id: requestId,
        created_at: new Date().toISOString()
      };
    }

    console.log('❌ Webhook respuesta: Video no listo o formato incorrecto');
    return null;

  } catch (error) {
    console.error('💥 Error en verificación por webhook:', error);
    return null;
  }
};

// ⭐ FUNCIÓN: Auto-actualizar tracking a completed
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

// Función legacy para búsqueda directa (mantener para casos de recuperación inicial)
export const verifyVideoExists = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  console.log('🎯 VERIFICACIÓN DIRECTA POR REQUEST_ID (Legacy):', {
    userId: user.id,
    requestId: requestId,
    scriptLength: script.length,
    timestamp: new Date().toISOString()
  });

  try {
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
      
      console.log('✅ VIDEO ENCONTRADO POR REQUEST_ID (Legacy):', {
        videoUrl: video.video_url,
        title: video.title,
        requestId: video.request_id,
        createdAt: video.created_at
      });

      await updateTrackingToCompleted(user, requestId);
      
      return {
        video_url: video.video_url,
        title: video.title,
        request_id: video.request_id,
        created_at: video.created_at
      };
    }

    console.log('❌ NO SE ENCONTRÓ VIDEO CON REQUEST_ID (Legacy)');
    return null;

  } catch (error) {
    console.error('💥 Error durante verificación legacy:', error);
    return null;
  }
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
    const videoExists = await verifyVideoExists(user, requestId, script);
    
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
        
        const { data: expiredVideo, error: videoError } = await supabase
          .from('generated_videos')
          .select('video_url, request_id, title, created_at')
          .eq('user_id', user.id)
          .eq('request_id', tracking.request_id)
          .limit(1);

        if (!videoError && expiredVideo && expiredVideo.length > 0) {
          console.log('🎉 ENCONTRADO VIDEO CON TRACKING EXPIRED (Legacy):', expiredVideo[0]);
          
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

    console.log('❌ No se pudo recuperar el video (Legacy)');
    return null;

  } catch (error) {
    console.error('💥 Error en recuperación de video (Legacy):', error);
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
  
  console.log('🔍 VERIFICACIÓN FINAL VIA WEBHOOK:', {
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
    .single();

  if (!trackingError && recentTracking) {
    console.log('🔍 Usando datos del tracking más reciente para webhook:', {
      requestId: recentTracking.request_id,
      status: recentTracking.status
    });
    
    // Intentar verificar usando webhook
    const videoResult = await checkVideoViaWebhook(user, recentTracking.request_id, script);
    if (videoResult) {
      return { video_url: videoResult.video_url, title: videoResult.title };
    }
  }

  console.log('❌ No se encontró video con webhook en verificación final');
  return null;
};
