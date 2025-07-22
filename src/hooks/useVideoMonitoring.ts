
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { verifyVideoExists, recoverLostVideo, checkFinalVideoResult } from '@/lib/databaseUtils';
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

  const videoDetected = useCallback((videoData: any, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void) => {
    console.log('🎉 VIDEO DETECTADO - Limpiando estado:', {
      videoUrl: videoData.video_url,
      title: videoData.title,
      requestId: videoData.request_id
    });
    
    isActiveRef.current = false;
    clearAllIntervals();
    
    setVideoResult(videoData.video_url);
    setIsGenerating(false);
    clearGenerationState();
    
    toast({
      title: "¡Video completado!",
      description: videoData.title || "Tu video ha sido generado exitosamente.",
    });
  }, [clearAllIntervals, toast]);

  // ⭐ NUEVA FUNCIÓN: Verificación final directa con requestId
  const checkFinalResultWithRequestId = useCallback(async (
    requestId: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN FINAL DIRECTA con requestId:', {
      requestId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Verificación directa con el requestId específico
      const videoData = await verifyVideoExists(user, requestId);
      
      if (videoData?.video_url) {
        console.log('✅ Video encontrado en verificación final directa:', {
          videoUrl: videoData.video_url,
          title: videoData.title,
          requestId: videoData.request_id
        });
        
        videoDetected(videoData, setVideoResult, setIsGenerating);
        return;
      }

      console.log('❌ Video no encontrado con requestId específico - intentando fallback');
      
      // Fallback: intentar con tracking más reciente
      const fallbackVideo = await checkFinalVideoResult(user);
      if (fallbackVideo?.video_url) {
        console.log('🔄 Video encontrado en fallback:', fallbackVideo);
        videoDetected({ 
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

  // ⭐ COUNTDOWN MEJORADO - Verificación final corregida
  const startCountdown = useCallback((
    requestId: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number,
    isRecovering?: boolean
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando monitoreo MEJORADO:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      userId: user?.id,
      isRecovering: !!isRecovering
    });
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    
    // Countdown visual cada segundo
    const updateCountdown = () => {
      if (!isActiveRef.current) return;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      updateTimeRemaining(remaining);
      
      if (remaining <= 0) {
        console.log('⏰ Tiempo agotado - iniciando verificación final DIRECTA con requestId:', requestId);
        checkFinalResultWithRequestId(requestId, setVideoResult, setIsGenerating);
        return;
      }
    };

    // Iniciar countdown
    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // ⭐ MODO RECUPERACIÓN: Verificaciones cada 30 segundos desde el inicio
    if (isRecovering) {
      console.log('🔄 MODO RECUPERACIÓN ACTIVADO - Verificaciones cada 30 segundos');
      
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
          videoDetected(videoData, setVideoResult, setIsGenerating);
        } else {
          console.log('❌ Video no encontrado aún en verificación de recuperación');
        }
      };
      
      // Verificación inmediata
      setTimeout(recoveryCheck, 5000); // 5 segundos después de iniciar
      
      // Verificaciones cada 30 segundos
      recoveryIntervalRef.current = setInterval(recoveryCheck, 30 * 1000);
      
    } else {
      // ⭐ MODO NORMAL: Verificación inicial + verificaciones desde minuto 25
      
      // VERIFICACIÓN INMEDIATA: Intentar recuperar video perdido al inicio
      setTimeout(async () => {
        if (!isActiveRef.current) return;
        
        console.log('🔄 Verificación inicial - intentando recuperar video perdido');
        const recoveredVideo = await recoverLostVideo(user, requestId);
        if (recoveredVideo && isActiveRef.current) {
          videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
        }
      }, 5000); // 5 segundos después de iniciar

      // VERIFICACIONES DESDE EL MINUTO 25 CADA MINUTO
      setTimeout(() => {
        if (!isActiveRef.current) return;
        
        console.log('🎯 INICIANDO VERIFICACIONES CADA MINUTO DESDE MINUTO 25');
        
        const regularCheck = async () => {
          if (!isActiveRef.current) return;
          
          const minutesElapsed = Math.floor((Date.now() - startTime) / 60000);
          console.log('🔍 Verificación cada minuto (minuto ' + minutesElapsed + ') - Buscando video:', {
            requestId,
            userId: user?.id,
            minutesElapsed
          });
          
          const videoData = await verifyVideoExists(user, requestId);
          if (videoData && isActiveRef.current) {
            console.log('✅ VIDEO ENCONTRADO EN VERIFICACIÓN REGULAR:', videoData);
            videoDetected(videoData, setVideoResult, setIsGenerating);
          } else {
            console.log('❌ Video no encontrado aún en minuto', minutesElapsed);
          }
        };
        
        // Ejecutar verificación inmediatamente al llegar al minuto 25
        regularCheck();
        
        // Continuar verificando cada minuto
        pollingIntervalRef.current = setInterval(regularCheck, 60 * 1000); // Cada minuto
        
      }, 25 * 60 * 1000); // Iniciar a los 25 minutos
    }

  }, [updateTimeRemaining, user, videoDetected, checkFinalResultWithRequestId]);

  // Función para verificación manual mejorada
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
    
    // Verificación directa y completa
    const videoData = await verifyVideoExists(user, requestId);
    if (videoData) {
      console.log('✅ VIDEO ENCONTRADO EN VERIFICACIÓN MANUAL:', videoData);
      videoDetected(videoData, setVideoResult, setIsGenerating);
      return true;
    }
    
    // Intentar recuperación como fallback
    const recoveredVideo = await recoverLostVideo(user, requestId);
    if (recoveredVideo) {
      console.log('🔄 VIDEO RECUPERADO EN VERIFICACIÓN MANUAL:', recoveredVideo);
      videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
      return true;
    }
    
    console.log('❌ Video no encontrado en verificación manual');
    toast({
      title: "Video no encontrado",
      description: "El video aún no está disponible. La verificación automática continuará cada minuto desde el minuto 25.",
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
