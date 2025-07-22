
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { checkVideoViaWebhook, recoverLostVideo, checkFinalVideoResult } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
  }, []);

  const videoDetected = useCallback((videoData: any, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void) => {
    console.log('🎉 VIDEO DETECTADO VIA WEBHOOK - Limpiando estado:', {
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

  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando monitoreo MEJORADO CON WEBHOOK - Verificaciones desde minuto 25:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      scriptLength: scriptToCheck.length,
      userId: user?.id,
      webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado'
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
        console.log('⏰ Tiempo agotado - verificación final via webhook');
        checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
        return;
      }
    };

    // Iniciar countdown
    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // VERIFICACIÓN INICIAL: Intentar recuperar video perdido al inicio (legacy DB check)
    setTimeout(async () => {
      if (!isActiveRef.current) return;
      
      console.log('🔄 Verificación inicial - intentando recuperar video perdido (legacy)');
      const recoveredVideo = await recoverLostVideo(user, requestId, scriptToCheck);
      if (recoveredVideo && isActiveRef.current) {
        videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
      }
    }, 5000); // 5 segundos después de iniciar

    // ⭐ NUEVA LÓGICA: VERIFICACIÓN VIA WEBHOOK DESDE EL MINUTO 25 CADA MINUTO
    setTimeout(() => {
      if (!isActiveRef.current) return;
      
      console.log('🎯 INICIANDO VERIFICACIONES VIA WEBHOOK CADA MINUTO DESDE MINUTO 25');
      
      const webhookCheck = async () => {
        if (!isActiveRef.current) return;
        
        const minutesElapsed = Math.floor((Date.now() - startTime) / 60000);
        console.log('🌐 Verificación via webhook (minuto ' + minutesElapsed + '):', {
          requestId,
          userId: user?.id,
          minutesElapsed,
          webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado'
        });
        
        const videoData = await checkVideoViaWebhook(user, requestId, scriptToCheck);
        if (videoData && isActiveRef.current) {
          console.log('✅ VIDEO ENCONTRADO VIA WEBHOOK:', videoData);
          videoDetected(videoData, setVideoResult, setIsGenerating);
        } else {
          console.log('❌ Webhook respuesta: Video no listo aún en minuto', minutesElapsed);
        }
      };
      
      // Ejecutar verificación inmediatamente al llegar al minuto 25
      webhookCheck();
      
      // Continuar verificando cada minuto via webhook
      pollingIntervalRef.current = setInterval(webhookCheck, 60 * 1000); // Cada minuto
      
    }, 25 * 60 * 1000); // ⭐ Iniciar a los 25 minutos

  }, [updateTimeRemaining, user, videoDetected]);

  // Función para verificación manual mejorada CON WEBHOOK
  const checkVideoManually = useCallback(async (
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN MANUAL VIA WEBHOOK:', {
      requestId,
      userId: user?.id,
      timestamp: new Date().toISOString(),
      webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado'
    });
    
    // Verificación principal via webhook
    const videoData = await checkVideoViaWebhook(user, requestId, scriptToCheck);
    if (videoData) {
      console.log('✅ VIDEO ENCONTRADO EN VERIFICACIÓN MANUAL VIA WEBHOOK:', videoData);
      videoDetected(videoData, setVideoResult, setIsGenerating);
      return true;
    }
    
    console.log('❌ Webhook manual: Video no encontrado');
    toast({
      title: "Video no encontrado",
      description: "El video aún no está disponible. La verificación automática via webhook continuará cada minuto desde el minuto 25.",
      variant: "default"
    });
    
    return false;
  }, [user, videoDetected, toast]);

  const startPeriodicChecking = useCallback((
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('⚠️ startPeriodicChecking (legacy) - funcionalidad incluida en startCountdown con webhook');
  }, []);

  const checkFinalResult = useCallback(async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN FINAL tras 39 minutos VIA WEBHOOK');
    
    try {
      const videoData = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoData?.video_url) {
        console.log('✅ Video encontrado en verificación final via webhook');
        setVideoResult(videoData.video_url);
        toast({
          title: "¡Video completado!",
          description: videoData.title || "Tu video ha sido generado exitosamente.",
        });
      } else {
        console.log('⏰ Video NO encontrado después de 39 minutos via webhook');
        toast({
          title: "Video en proceso",
          description: "Tu video está tardando un poco más de lo normal. Por favor, revisa la sección 'Videos Guardados' en 10-15 minutos.",
          variant: "default"
        });
      }
    } catch (e) {
      console.error('❌ Error en verificación final via webhook:', e);
      toast({
        title: "Error en verificación",
        description: "Hubo un problema al verificar el video. Por favor, revisa la sección 'Videos Guardados' en unos minutos.",
        variant: "destructive"
      });
    }
    
    isActiveRef.current = false;
    setIsGenerating(false);
    clearGenerationState();
  }, [user, toast]);

  const cleanup = useCallback(() => {
    console.log('🧹 Limpieza completa del monitoreo con webhook');
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
