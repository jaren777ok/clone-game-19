
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
  const intensivePollingRef = useRef<NodeJS.Timeout | null>(null);
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
    if (intensivePollingRef.current) {
      clearInterval(intensivePollingRef.current);
      intensivePollingRef.current = null;
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

  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando monitoreo mejorado de 39 minutos:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      scriptLength: scriptToCheck.length,
      userId: user?.id
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
        console.log('⏰ Tiempo agotado - verificación final');
        checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
        return;
      }
    };

    // Iniciar countdown
    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // VERIFICACIÓN INMEDIATA: Intentar recuperar video perdido al inicio
    setTimeout(async () => {
      if (!isActiveRef.current) return;
      
      console.log('🔄 Verificación inicial - intentando recuperar video perdido');
      const recoveredVideo = await recoverLostVideo(user, requestId, scriptToCheck);
      if (recoveredVideo && isActiveRef.current) {
        videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
      }
    }, 5000); // 5 segundos después de iniciar

    // VERIFICACIÓN REGULAR: Cada 2 minutos desde los 30 minutos
    setTimeout(() => {
      if (!isActiveRef.current) return;
      
      console.log('🔄 Iniciando verificaciones regulares cada 2 minutos');
      const regularCheck = async () => {
        if (!isActiveRef.current) return;
        
        const minutesElapsed = Math.floor((Date.now() - startTime) / 60000);
        console.log('🔍 Verificación regular (minuto ' + minutesElapsed + ')');
        
        const videoData = await verifyVideoExists(user, requestId, scriptToCheck);
        if (videoData && isActiveRef.current) {
          videoDetected(videoData, setVideoResult, setIsGenerating);
        }
      };
      
      regularCheck(); // Ejecutar inmediatamente
      pollingIntervalRef.current = setInterval(regularCheck, 2 * 60 * 1000); // Cada 2 minutos
    }, 30 * 60 * 1000); // Iniciar a los 30 minutos

    // VERIFICACIÓN INTENSIVA: Cada 30 segundos desde los 35 minutos
    setTimeout(() => {
      if (!isActiveRef.current) return;
      
      console.log('⚡ Iniciando verificaciones intensivas cada 30 segundos');
      const intensiveCheck = async () => {
        if (!isActiveRef.current) return;
        
        const minutesElapsed = Math.floor((Date.now() - startTime) / 60000);
        console.log('🔍 Verificación intensiva (minuto ' + minutesElapsed + ')');
        
        const videoData = await verifyVideoExists(user, requestId, scriptToCheck);
        if (videoData && isActiveRef.current) {
          videoDetected(videoData, setVideoResult, setIsGenerating);
        }
      };
      
      intensiveCheck(); // Ejecutar inmediatamente
      intensivePollingRef.current = setInterval(intensiveCheck, 30 * 1000); // Cada 30 segundos
    }, 35 * 60 * 1000); // Iniciar a los 35 minutos

  }, [updateTimeRemaining, user, videoDetected]);

  // Función para verificación manual
  const checkVideoManually = useCallback(async (
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN MANUAL solicitada');
    
    // Primero intentar recuperar video perdido
    const recoveredVideo = await recoverLostVideo(user, requestId, scriptToCheck);
    if (recoveredVideo) {
      videoDetected(recoveredVideo, setVideoResult, setIsGenerating);
      return true;
    }
    
    // Luego verificación estándar
    const videoData = await verifyVideoExists(user, requestId, scriptToCheck);
    if (videoData) {
      videoDetected(videoData, setVideoResult, setIsGenerating);
      return true;
    }
    
    toast({
      title: "Video no encontrado",
      description: "El video aún no está disponible. Continuaremos verificando automáticamente.",
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
    console.log('⚠️ startPeriodicChecking (legacy) - funcionalidad incluida en startCountdown');
  }, []);

  const checkFinalResult = useCallback(async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN FINAL tras 39 minutos');
    
    try {
      const videoData = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoData?.video_url) {
        console.log('✅ Video encontrado en verificación final');
        setVideoResult(videoData.video_url);
        toast({
          title: "¡Video completado!",
          description: videoData.title || "Tu video ha sido generado exitosamente.",
        });
      } else {
        console.log('⏰ Video NO encontrado después de 39 minutos');
        toast({
          title: "Video en proceso",
          description: "Tu video está tardando un poco más de lo normal. Por favor, revisa la sección 'Videos Guardados' en 10-15 minutos.",
          variant: "default"
        });
      }
    } catch (e) {
      console.error('❌ Error en verificación final:', e);
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
