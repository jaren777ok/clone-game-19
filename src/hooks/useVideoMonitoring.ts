import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME, DELAYED_POLLING_START } from '@/lib/countdownUtils';
import { checkVideoViaWebhook, recoverLostVideo, checkFinalVideoResult } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const forcedPollingRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const webhookActivatedRef = useRef(false);
  const lastRequestIdRef = useRef<string>('');
  const lastScriptRef = useRef<string>('');

  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const clearAllIntervals = useCallback(() => {
    console.log('🧹 [WEBHOOK DEBUG] Limpiando TODOS los intervalos de monitoreo');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('✅ [WEBHOOK DEBUG] Intervalo de polling limpiado');
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      console.log('✅ [WEBHOOK DEBUG] Intervalo de countdown limpiado');
    }
    
    if (forcedPollingRef.current) {
      clearInterval(forcedPollingRef.current);
      forcedPollingRef.current = null;
      console.log('✅ [WEBHOOK DEBUG] Intervalo forzado limpiado');
    }
  }, []);

  const videoDetected = useCallback((videoData: any, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void) => {
    console.log('🎉 [WEBHOOK DEBUG] VIDEO DETECTADO - Limpiando estado:', {
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
    
    setDebugInfo('✅ Video encontrado y proceso completado');
    
    toast({
      title: "¡Video completado!",
      description: videoData.title || "Tu video ha sido generado exitosamente.",
    });
  }, [clearAllIntervals, toast]);

  // Función mejorada de verificación webhook con logging extensivo
  const performWebhookCheck = useCallback(async (
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    forceCheck: boolean = false
  ) => {
    if (!user) {
      console.log('❌ [WEBHOOK DEBUG] No hay usuario - abortando verificación');
      return false;
    }

    const minutesElapsed = generationStartTime 
      ? Math.floor((Date.now() - generationStartTime) / 60000) 
      : 0;
    
    const shouldCheck = forceCheck || (isActiveRef.current && webhookActivatedRef.current);
    
    console.log('🔍 [WEBHOOK DEBUG] EJECUTANDO VERIFICACIÓN WEBHOOK:', {
      requestId,
      userId: user.id,
      scriptLength: scriptToCheck.length,
      minutesElapsed,
      isActive: isActiveRef.current,
      webhookActivated: webhookActivatedRef.current,
      forceCheck,
      shouldCheck,
      timestamp: new Date().toISOString()
    });

    setDebugInfo(`🔍 Verificando webhook (min: ${minutesElapsed}) - Active: ${isActiveRef.current}, Webhook: ${webhookActivatedRef.current}`);
    
    if (!shouldCheck) {
      console.log('❌ [WEBHOOK DEBUG] Verificación cancelada - condiciones no cumplidas');
      return false;
    }
    
    try {
      const videoData = await checkVideoViaWebhook(user, requestId, scriptToCheck);
      
      if (videoData && (isActiveRef.current || forceCheck)) {
        console.log('✅ [WEBHOOK DEBUG] VIDEO ENCONTRADO:', videoData);
        videoDetected(videoData, setVideoResult, setIsGenerating);
        return true;
      } else {
        console.log(`❌ [WEBHOOK DEBUG] Webhook respuesta: Video no listo en minuto ${minutesElapsed}`);
        setDebugInfo(`❌ Video no listo (min: ${minutesElapsed})`);
      }
    } catch (error) {
      console.error('💥 [WEBHOOK DEBUG] Error en verificación webhook:', error);
      setDebugInfo(`💥 Error webhook: ${error}`);
    }
    
    return false;
  }, [user, generationStartTime, videoDetected]);

  // Función FORZADA que se ejecuta independientemente de refs
  const forcedWebhookCheck = useCallback(async (
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🚀 [WEBHOOK DEBUG] VERIFICACIÓN FORZADA INDEPENDIENTE');
    return await performWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating, true);
  }, [performWebhookCheck]);

  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    const startTime = customStartTime || Date.now();
    
    console.log('🚀 [WEBHOOK DEBUG] INICIANDO MONITOREO MEJORADO:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      scriptLength: scriptToCheck.length,
      userId: user?.id,
      delayedStart: DELAYED_POLLING_START,
      webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado'
    });
    
    // Guardar datos para verificaciones forzadas
    lastRequestIdRef.current = requestId;
    lastScriptRef.current = scriptToCheck;
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    webhookActivatedRef.current = false;
    
    setDebugInfo('🚀 Monitoreo iniciado - esperando 2 minutos...');
    
    // Countdown visual mejorado con debug
    const updateCountdown = () => {
      if (!isActiveRef.current) {
        console.log('⚠️ [WEBHOOK DEBUG] Countdown detenido - isActive = false');
        return;
      }
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      const minutesElapsed = Math.floor(elapsed / 60);
      
      updateTimeRemaining(remaining);
      
      // Debug cada 30 segundos
      if (elapsed % 30 === 0) {
        console.log(`⏰ [WEBHOOK DEBUG] Estado cada 30s:`, {
          minutesElapsed,
          remaining,
          isActive: isActiveRef.current,
          webhookActivated: webhookActivatedRef.current,
          delayedStart: DELAYED_POLLING_START
        });
        
        setDebugInfo(`⏰ Min: ${minutesElapsed}, Active: ${isActiveRef.current}, Webhook: ${webhookActivatedRef.current}`);
      }
      
      // ACTIVAR WEBHOOK exactamente a los 2 minutos
      if (!webhookActivatedRef.current && elapsed >= DELAYED_POLLING_START) {
        console.log('🎯 [WEBHOOK DEBUG] ACTIVANDO WEBHOOK A LOS 2 MINUTOS EXACTOS');
        activateWebhookVerification(requestId, scriptToCheck, setVideoResult, setIsGenerating);
      }
      
      if (remaining <= 0) {
        console.log('⏰ [WEBHOOK DEBUG] Tiempo agotado - verificación final');
        checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
        return;
      }
    };

    // Iniciar countdown
    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // VERIFICACIÓN INICIAL (5 segundos después)
    setTimeout(async () => {
      if (!isActiveRef.current) return;
      
      console.log('🔄 [WEBHOOK DEBUG] Verificación inicial - recuperación legacy');
      const recoveredVideo = await recoverLostVideo(user, requestId, scriptToCheck);
      if (recoveredVideo && isActiveRef.current) {
        videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
      }
    }, 5000);

    // PROGRAMAR ACTIVACIÓN WEBHOOK A LOS 2 MINUTOS (backup)
    setTimeout(() => {
      if (!isActiveRef.current) return;
      
      console.log('⏰ [WEBHOOK DEBUG] BACKUP - Activación programada a los 2 minutos');
      if (!webhookActivatedRef.current) {
        activateWebhookVerification(requestId, scriptToCheck, setVideoResult, setIsGenerating);
      }
    }, DELAYED_POLLING_START * 1000);

    // SISTEMA FORZADO - verificación cada minuto SIN DEPENDER DE REFS
    setTimeout(() => {
      console.log('🔥 [WEBHOOK DEBUG] INICIANDO SISTEMA FORZADO DE VERIFICACIÓN');
      
      forcedPollingRef.current = setInterval(async () => {
        console.log('🔥 [WEBHOOK DEBUG] Ejecutando verificación FORZADA cada minuto');
        await forcedWebhookCheck(lastRequestIdRef.current, lastScriptRef.current, setVideoResult, setIsGenerating);
      }, 60 * 1000); // Cada minuto
      
    }, (DELAYED_POLLING_START + 5) * 1000); // 5 segundos después de los 2 minutos

  }, [updateTimeRemaining, user, videoDetected, performWebhookCheck, forcedWebhookCheck]);

  // Función para activar verificaciones webhook normales
  const activateWebhookVerification = useCallback((
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    if (!isActiveRef.current) {
      console.log('❌ [WEBHOOK DEBUG] No se puede activar webhook - isActive = false');
      return;
    }
    
    if (webhookActivatedRef.current) {
      console.log('⚠️ [WEBHOOK DEBUG] Webhook ya activado - ignorando activación duplicada');
      return;
    }
    
    console.log('🎯 [WEBHOOK DEBUG] ACTIVANDO VERIFICACIONES WEBHOOK:', {
      requestId,
      userId: user?.id,
      scriptLength: scriptToCheck.length,
      timestamp: new Date().toISOString()
    });
    
    webhookActivatedRef.current = true;
    setDebugInfo('🎯 Webhook activado - verificando cada minuto');
    
    // Ejecutar verificación inmediatamente
    performWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating);
    
    // Continuar verificando cada minuto
    pollingIntervalRef.current = setInterval(() => {
      console.log('🔄 [WEBHOOK DEBUG] Verificación periódica webhook');
      performWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating);
    }, 60 * 1000);
  }, [user, performWebhookCheck]);

  // Función para verificación manual mejorada
  const checkVideoManually = useCallback(async (
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 [WEBHOOK DEBUG] VERIFICACIÓN MANUAL EJECUTADA:', {
      requestId,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    setDebugInfo('🔍 Verificación manual en progreso...');
    
    // Forzar verificación independientemente del estado
    const found = await forcedWebhookCheck(requestId, scriptToCheck, setVideoResult, setIsGenerating);
    
    if (!found) {
      console.log('❌ [WEBHOOK DEBUG] Verificación manual - video no encontrado');
      setDebugInfo('❌ Verificación manual - video no encontrado');
      
      toast({
        title: "Video no encontrado",
        description: "El video aún no está disponible. La verificación automática via webhook continuará cada minuto.",
        variant: "default"
      });
    }
    
    return found;
  }, [user, forcedWebhookCheck, toast]);

  const startPeriodicChecking = useCallback((
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('⚠️ [WEBHOOK DEBUG] startPeriodicChecking (legacy) - funcionalidad incluida en startCountdown con webhook');
  }, []);

  const checkFinalResult = useCallback(async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 [WEBHOOK DEBUG] VERIFICACIÓN FINAL tras 39 minutos');
    
    setDebugInfo('🔍 Verificación final...');
    
    try {
      const videoData = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoData?.video_url) {
        console.log('✅ [WEBHOOK DEBUG] Video encontrado en verificación final');
        setVideoResult(videoData.video_url);
        setDebugInfo('✅ Video encontrado en verificación final');
        toast({
          title: "¡Video completado!",
          description: videoData.title || "Tu video ha sido generado exitosamente.",
        });
      } else {
        console.log('⏰ [WEBHOOK DEBUG] Video NO encontrado después de 39 minutos');
        setDebugInfo('⏰ Video NO encontrado después de 39 minutos');
        toast({
          title: "Video en proceso",
          description: "Tu video está tardando un poco más de lo normal. Por favor, revisa la sección 'Videos Guardados' en 10-15 minutos.",
          variant: "default"
        });
      }
    } catch (e) {
      console.error('❌ [WEBHOOK DEBUG] Error en verificación final:', e);
      setDebugInfo(`❌ Error en verificación final: ${e}`);
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
    console.log('🧹 [WEBHOOK DEBUG] Limpieza completa del monitoreo');
    isActiveRef.current = false;
    webhookActivatedRef.current = false;
    setDebugInfo('🧹 Sistema limpiado');
    clearAllIntervals();
  }, [clearAllIntervals]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    timeRemaining,
    generationStartTime,
    debugInfo,
    startCountdown,
    startPeriodicChecking,
    checkFinalResult,
    checkVideoManually,
    cleanup
  };
};
