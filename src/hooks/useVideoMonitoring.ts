
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME, DELAYED_POLLING_START } from '@/lib/countdownUtils';
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
  const webhookActivatedRef = useRef(false);

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
      requestId: videoData.request_id,
      timestamp: new Date().toISOString()
    });
    
    isActiveRef.current = false;
    webhookActivatedRef.current = false;
    clearAllIntervals();
    
    setVideoResult(videoData.video_url);
    setIsGenerating(false);
    clearGenerationState();
    
    toast({
      title: "¡Video completado!",
      description: videoData.title || "Tu video ha sido generado exitosamente.",
    });
  }, [clearAllIntervals, toast]);

  // Función dedicada para verificación webhook
  const performWebhookCheck = useCallback(async (
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    if (!isActiveRef.current || !user) return;
    
    const minutesElapsed = generationStartTime 
      ? Math.floor((Date.now() - generationStartTime) / 60000) 
      : 0;
    
    console.log('🌐 EJECUTANDO VERIFICACIÓN VIA WEBHOOK (minuto ' + minutesElapsed + '):', {
      requestId,
      userId: user.id,
      scriptLength: scriptToCheck.length,
      webhookActivated: webhookActivatedRef.current,
      isActive: isActiveRef.current,
      webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado',
      timestamp: new Date().toISOString()
    });
    
    try {
      const videoData = await checkVideoViaWebhook(user, requestId, scriptToCheck);
      if (videoData && isActiveRef.current) {
        console.log('✅ VIDEO ENCONTRADO VIA WEBHOOK:', videoData);
        videoDetected(videoData, setVideoResult, setIsGenerating);
        return true;
      } else {
        console.log('❌ Webhook respuesta: Video no listo aún en minuto', minutesElapsed);
      }
    } catch (error) {
      console.error('💥 Error en verificación webhook:', error);
    }
    
    return false;
  }, [user, generationStartTime, videoDetected]);

  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando monitoreo MEJORADO CON WEBHOOK - Verificaciones desde minuto 2:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      scriptLength: scriptToCheck.length,
      userId: user?.id,
      webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado'
    });
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    webhookActivatedRef.current = false;
    
    // Countdown visual cada segundo
    const updateCountdown = () => {
      if (!isActiveRef.current) return;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      updateTimeRemaining(remaining);
      
      // IMPORTANTE: Verificar si hemos llegado al tiempo de verificación (2 minutos)
      // y activar las verificaciones webhook si no están activadas
      if (!webhookActivatedRef.current && elapsed >= DELAYED_POLLING_START) {
        console.log('⏰ PUNTO DE ACTIVACIÓN WEBHOOK ALCANZADO - Iniciando verificaciones webhook a los 2 minutos');
        activateWebhookVerification(requestId, scriptToCheck, setVideoResult, setIsGenerating);
      }
      
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

    // ⭐ IMPORTANTE: Programar el inicio de las verificaciones webhook a los 2 minutos exactos
    setTimeout(() => {
      if (!isActiveRef.current) return;
      
      console.log('⏰ ALCANZADO TIEMPO PROGRAMADO PARA WEBHOOK - Iniciando verificación a los 2 minutos');
      activateWebhookVerification(requestId, scriptToCheck, setVideoResult, setIsGenerating);
      
    }, DELAYED_POLLING_START * 1000); // ⭐ Iniciar a los 2 minutos (usar la constante)

  }, [updateTimeRemaining, user, videoDetected, performWebhookCheck]);

  // Función para activar verificaciones webhook
  const activateWebhookVerification = useCallback((
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    if (!isActiveRef.current || webhookActivatedRef.current) return;
    
    console.log('🎯 ACTIVANDO VERIFICACIONES VIA WEBHOOK CADA MINUTO:', {
      requestId,
      userId: user?.id,
      scriptLength: scriptToCheck.length,
      webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado',
      timestamp: new Date().toISOString()
    });
    
    webhookActivatedRef.current = true;
    
    // Ejecutar verificación inmediatamente
    performWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating);
    
    // Continuar verificando cada minuto via webhook
    pollingIntervalRef.current = setInterval(() => {
      performWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating);
    }, 60 * 1000); // Cada minuto
  }, [user, performWebhookCheck]);

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
    
    // Asegurar que isActiveRef esté en true para esta operación
    const wasActive = isActiveRef.current;
    isActiveRef.current = true;
    
    // Verificación principal via webhook
    const found = await performWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating);
    
    // Si no se encontró video, restaurar estado anterior y mostrar mensaje
    if (!found) {
      isActiveRef.current = wasActive;
      
      console.log('❌ Webhook manual: Video no encontrado');
      toast({
        title: "Video no encontrado",
        description: "El video aún no está disponible. La verificación automática via webhook continuará cada minuto desde el minuto 2.",
        variant: "default"
      });
    }
    
    return found;
  }, [user, performWebhookCheck, toast]);

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
    webhookActivatedRef.current = false;
    setIsGenerating(false);
    clearGenerationState();
  }, [user, toast]);

  const cleanup = useCallback(() => {
    console.log('🧹 Limpieza completa del monitoreo con webhook');
    isActiveRef.current = false;
    webhookActivatedRef.current = false;
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
