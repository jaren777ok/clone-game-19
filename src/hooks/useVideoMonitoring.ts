import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { verifyVideoExists, recoverLostVideo, checkFinalVideoResult, updateTrackingToCompleted } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const clearAllIntervals = useCallback(() => {
    console.log('🧹 Limpiando todos los intervalos de monitoreo');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (recoveryIntervalRef.current) {
      clearInterval(recoveryIntervalRef.current);
      recoveryIntervalRef.current = null;
    }
  }, []);

  const videoDetected = useCallback(async (videoData: any, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void) => {
    console.log('🎉 VIDEO DETECTADO - FORZANDO ACTUALIZACIÓN DE UI INMEDIATA:', {
      videoUrl: videoData.video_url,
      title: videoData.title,
      requestId: videoData.request_id,
      timestamp: new Date().toISOString()
    });
    
    // ⭐ CRÍTICO: Detener todos los procesos primero
    isActiveRef.current = false;
    clearAllIntervals();
    
    console.log('🔄 EJECUTANDO setVideoResult con URL:', videoData.video_url);
    console.log('🔄 EJECUTANDO setIsGenerating(false)');
    
    // ⭐ FORZAR LA ACTUALIZACIÓN DE LA UI INMEDIATAMENTE
    setVideoResult(videoData.video_url);
    setIsGenerating(false);
    clearGenerationState();
    
    console.log('✅ UI ACTUALIZADA - Estados cambiados a:');
    console.log('   - videoResult:', videoData.video_url);
    console.log('   - isGenerating: false');
    
    // ⭐ Toast de éxito inmediato
    toast({
      title: "¡Video completado!",
      description: videoData.title || "Tu video ha sido generado exitosamente.",
    });
    
    // ⭐ Actualizar tracking DESPUÉS (sin bloquear la UI)
    if (user && videoData.request_id) {
      console.log('🔄 Actualizando tracking a completed (en background)');
      setTimeout(async () => {
        try {
          await updateTrackingToCompleted(user, videoData.request_id);
          console.log('✅ Tracking actualizado correctamente');
        } catch (error) {
          console.error('❌ Error actualizando tracking:', error);
        }
      }, 100); // Mínimo delay para no bloquear UI
    }
  }, [clearAllIntervals, toast, user]);

  // ⭐ VERIFICACIÓN FINAL DIRECTA MEJORADA
  const checkFinalResultWithRequestId = useCallback(async (
    requestId: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🎯 VERIFICACIÓN FINAL CRÍTICA - Timer llegó a 00:00:', {
      requestId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      // ⭐ VERIFICACIÓN DIRECTA CON REQUESTID
      console.log('🔍 Buscando video con requestId específico...');
      const videoData = await verifyVideoExists(user, requestId);
      
      if (videoData?.video_url) {
        console.log('🎉 ¡VIDEO ENCONTRADO! Iniciando actualización de UI:', {
          videoUrl: videoData.video_url,
          title: videoData.title,
          requestId: videoData.request_id
        });
        
        // ⭐ LLAMAR A videoDetected INMEDIATAMENTE
        await videoDetected(videoData, setVideoResult, setIsGenerating);
        return;
      }

      console.log('❌ Video no encontrado con requestId - Intentando fallback...');
      
      // Fallback: verificar con tracking más reciente
      const fallbackVideo = await checkFinalVideoResult(user);
      if (fallbackVideo?.video_url) {
        console.log('🔄 Video encontrado en fallback:', fallbackVideo);
        await videoDetected({ 
          video_url: fallbackVideo.video_url, 
          title: fallbackVideo.title,
          request_id: requestId
        }, setVideoResult, setIsGenerating);
        return;
      }

      // Video realmente no encontrado
      console.log('⏰ Video NO encontrado después de verificación completa');
      handleVideoNotFound(setVideoResult, setIsGenerating);
      
    } catch (error) {
      console.error('❌ Error en verificación final directa:', error);
      handleVideoNotFound(setVideoResult, setIsGenerating);
    }
  }, [user, videoDetected, toast]);

  const handleVideoNotFound = useCallback((
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('⏰ Manejando video no encontrado - finalizando proceso');
    
    isActiveRef.current = false;
    setIsGenerating(false);
    clearGenerationState();
    
    toast({
      title: "Video en proceso",
      description: "Tu video está tardando un poco más de lo normal. Por favor, revisa la sección 'Videos Guardados' en 10-15 minutos.",
      variant: "default"
    });
  }, [toast]);

  // ⭐ COUNTDOWN MEJORADO CON VERIFICACIÓN FINAL FORZADA
  const startCountdown = useCallback((
    requestId: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number,
    isRecovering?: boolean
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando monitoreo CRÍTICO:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      userId: user?.id,
      isRecovering: !!isRecovering
    });
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    
    // ⭐ COUNTDOWN VISUAL CADA SEGUNDO
    const updateCountdown = async () => {
      if (!isActiveRef.current) return;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      updateTimeRemaining(remaining);
      
      // ⭐ CUANDO LLEGUE A 00:00 - VERIFICACIÓN FINAL FORZADA
      if (remaining <= 0) {
        console.log('⏰ ¡TIMER LLEGÓ A 00:00! - EJECUTANDO VERIFICACIÓN FINAL CRÍTICA');
        console.log('🎯 Llamando a checkFinalResultWithRequestId con requestId:', requestId);
        
        // ⭐ DETENER EL COUNTDOWN Y EJECUTAR VERIFICACIÓN FINAL
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        
        await checkFinalResultWithRequestId(requestId, setVideoResult, setIsGenerating);
        return;
      }
    };

    // Iniciar countdown inmediatamente
    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // ⭐ VERIFICACIONES ADICIONALES SEGÚN MODO
    if (isRecovering) {
      console.log('🔄 MODO RECUPERACIÓN - Verificaciones cada 30 segundos');
      
      const recoveryCheck = async () => {
        if (!isActiveRef.current) return;
        
        console.log('🔍 Verificación en modo recuperación:', {
          requestId,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
        
        const videoData = await verifyVideoExists(user, requestId);
        if (videoData && isActiveRef.current) {
          console.log('✅ VIDEO ENCONTRADO EN MODO RECUPERACIÓN:', videoData);
          await videoDetected(videoData, setVideoResult, setIsGenerating);
        }
      };
      
      // Verificación inmediata y periódica
      setTimeout(recoveryCheck, 5000);
      recoveryIntervalRef.current = setInterval(recoveryCheck, 30 * 1000);
      
    } else {
      // ⭐ MODO NORMAL: Verificaciones desde minuto 25
      setTimeout(async () => {
        if (!isActiveRef.current) return;
        
        console.log('🔄 Verificación inicial - intentando recuperar video perdido');
        const recoveredVideo = await recoverLostVideo(user, requestId);
        if (recoveredVideo && isActiveRef.current) {
          await videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
        }
      }, 5000);

      // Verificaciones regulares desde minuto 25
      setTimeout(() => {
        if (!isActiveRef.current) return;
        
        console.log('🎯 INICIANDO VERIFICACIONES CADA MINUTO DESDE MINUTO 25');
        
        const regularCheck = async () => {
          if (!isActiveRef.current) return;
          
          const minutesElapsed = Math.floor((Date.now() - startTime) / 60000);
          console.log('🔍 Verificación cada minuto (minuto ' + minutesElapsed + '):', {
            requestId,
            userId: user?.id,
            minutesElapsed
          });
          
          const videoData = await verifyVideoExists(user, requestId);
          if (videoData && isActiveRef.current) {
            console.log('✅ VIDEO ENCONTRADO EN VERIFICACIÓN REGULAR:', videoData);
            await videoDetected(videoData, setVideoResult, setIsGenerating);
          }
        };
        
        regularCheck();
        pollingIntervalRef.current = setInterval(regularCheck, 60 * 1000);
        
      }, 25 * 60 * 1000);
    }

  }, [updateTimeRemaining, user, videoDetected, checkFinalResultWithRequestId]);

  // ⭐ VERIFICACIÓN MANUAL MEJORADA
  const checkVideoManually = useCallback(async (
    requestId: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN MANUAL SOLICITADA:', {
      requestId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    const videoData = await verifyVideoExists(user, requestId);
    if (videoData) {
      console.log('✅ VIDEO ENCONTRADO EN VERIFICACIÓN MANUAL:', videoData);
      await videoDetected(videoData, setVideoResult, setIsGenerating);
      return true;
    }
    
    const recoveredVideo = await recoverLostVideo(user, requestId);
    if (recoveredVideo) {
      console.log('🔄 VIDEO RECUPERADO EN VERIFICACIÓN MANUAL:', recoveredVideo);
      await videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
      return true;
    }
    
    console.log('❌ Video no encontrado en verificación manual');
    toast({
      title: "Video no encontrado",
      description: "El video aún no está disponible. La verificación automática continuará.",
      variant: "default"
    });
    
    return false;
  }, [user, videoDetected, toast]);

  const startPeriodicChecking = useCallback((
    requestId: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('⚠️ startPeriodicChecking (legacy) - funcionalidad incluida en startCountdown');
  }, []);

  const checkFinalResult = useCallback(async (
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('⚠️ checkFinalResult (legacy) - usar checkFinalResultWithRequestId en su lugar');
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 Limpieza completa del monitoreo');
    isActiveRef.current = false;
    clearAllIntervals();
  }, [clearAllIntervals]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    timeRemaining,
    generationStartTime,
    startCountdown,
    startPeriodicChecking,
    checkFinalResult,
    checkVideoManually,
    cleanup
  };
};
