
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { checkFinalVideoResult } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';
import { webhookMonitoringService } from '@/services/webhookMonitoringService';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const clearAllIntervals = useCallback(() => {
    console.log('🧹 [MONITORING] Limpiando intervalos');
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (user) {
      webhookMonitoringService.stopMonitoring(user.id);
    }
  }, [user]);

  const videoDetected = useCallback((videoData: any, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void) => {
    console.log('🎉 [MONITORING] VIDEO DETECTADO:', {
      videoUrl: videoData.video_url,
      title: videoData.title,
      timestamp: new Date().toISOString()
    });
    
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

  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    if (!user) {
      console.log('❌ [MONITORING] No hay usuario - abortando');
      return;
    }

    const startTime = customStartTime || Date.now();
    
    console.log('🚀 [MONITORING] INICIANDO SISTEMA SIMPLIFICADO:', {
      requestId,
      startTime: new Date(startTime).toISOString(),
      userId: user.id
    });
    
    setGenerationStartTime(startTime);
    setDebugInfo('🚀 Sistema iniciado - webhook en 2 minutos');
    
    // Start countdown timer
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      
      updateTimeRemaining(remaining);
      
      if (remaining <= 0) {
        console.log('⏰ [MONITORING] Tiempo agotado - verificación final');
        checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
        return;
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // Start webhook monitoring service
    webhookMonitoringService.startMonitoring(
      user.id,
      user,
      (videoData) => videoDetected(videoData, setVideoResult, setIsGenerating),
      setDebugInfo
    );

  }, [user, updateTimeRemaining, videoDetected]);

  const checkVideoManually = useCallback(async (
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    if (!user) return false;

    console.log('🔍 [MONITORING] VERIFICACIÓN MANUAL EJECUTADA');
    
    const found = await webhookMonitoringService.performManualCheck(
      user.id,
      user,
      (videoData) => videoDetected(videoData, setVideoResult, setIsGenerating),
      setDebugInfo
    );
    
    if (!found) {
      toast({
        title: "Video no encontrado",
        description: "El video aún no está disponible. La verificación automática continuará.",
        variant: "default"
      });
    }
    
    return found;
  }, [user, videoDetected, toast]);

  const checkFinalResult = useCallback(async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 [MONITORING] VERIFICACIÓN FINAL tras 39 minutos');
    
    setDebugInfo('🔍 Verificación final...');
    
    try {
      const videoData = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoData?.video_url) {
        console.log('✅ [MONITORING] Video encontrado en verificación final');
        setVideoResult(videoData.video_url);
        setDebugInfo('✅ Video encontrado en verificación final');
        toast({
          title: "¡Video completado!",
          description: videoData.title || "Tu video ha sido generado exitosamente.",
        });
      } else {
        console.log('⏰ [MONITORING] Video NO encontrado después de 39 minutos');
        setDebugInfo('⏰ Video NO encontrado después de 39 minutos');
        toast({
          title: "Video en proceso",
          description: "Tu video está tardando un poco más de lo normal. Por favor, revisa la sección 'Videos Guardados' en 10-15 minutos.",
          variant: "default"
        });
      }
    } catch (e) {
      console.error('❌ [MONITORING] Error en verificación final:', e);
      setDebugInfo(`❌ Error en verificación final: ${e}`);
      toast({
        title: "Error en verificación",
        description: "Hubo un problema al verificar el video. Por favor, revisa la sección 'Videos Guardados' en unos minutos.",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
    clearGenerationState();
    clearAllIntervals();
  }, [user, toast, clearAllIntervals]);

  const cleanup = useCallback(() => {
    console.log('🧹 [MONITORING] Limpieza completa del monitoreo');
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
    startPeriodicChecking: () => {}, // Legacy compatibility
    checkFinalResult,
    checkVideoManually,
    cleanup
  };
};
