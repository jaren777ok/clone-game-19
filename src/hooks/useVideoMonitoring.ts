
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  COUNTDOWN_TIME, 
  calculateTimeRemaining,
  hasReachedPollingTime 
} from '@/lib/countdownUtils';
import { checkVideoInDatabase, checkFinalVideoResult } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';
import { 
  clearAllIntervals, 
  startCountdownInterval, 
  startDelayedPolling 
} from '@/lib/intervalUtils';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  // Force component updates for real-time counter
  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando contador de 39 minutos:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      scriptLength: scriptToCheck.length,
      userId: user?.id
    });
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    
    const handleTimeUpdate = (remaining: number) => {
      if (isActiveRef.current) {
        updateTimeRemaining(remaining);
      }
    };

    const handleTimeExpired = () => {
      console.log('⏰ Contador finalizado, ejecutando verificación final para requestId:', requestId);
      isActiveRef.current = false;
      checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
    };

    // Iniciar contador visual
    startCountdownInterval(startTime, handleTimeUpdate, handleTimeExpired, countdownIntervalRef);
    
    // Iniciar verificaciones retrasadas (después de 30 minutos)
    startDelayedVideoChecking(requestId, scriptToCheck, setVideoResult, setIsGenerating, startTime);
  }, [updateTimeRemaining, user]);

  const startDelayedVideoChecking = useCallback((
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    startTime: number
  ) => {
    console.log('🕐 Programando verificaciones retrasadas:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      delayMinutes: 30
    });
    
    const checkForVideo = async () => {
      if (!isActiveRef.current) {
        console.log('⚠️ Verificación cancelada - proceso inactivo');
        return;
      }
      
      try {
        const minutesElapsed = Math.floor((Date.now() - startTime) / 60000);
        console.log('🔍 Verificando video (minuto ' + minutesElapsed + '):', {
          requestId: requestId,
          userId: user?.id,
          scriptPreview: scriptToCheck.substring(0, 50) + '...'
        });
        
        const videoData = await checkVideoInDatabase(user, requestId, scriptToCheck);
        
        if (videoData?.video_url) {
          console.log('🎉 ¡VIDEO ENCONTRADO!:', {
            videoUrl: videoData.video_url,
            title: videoData.title,
            requestId: videoData.request_id,
            minutesElapsed: minutesElapsed
          });
          
          isActiveRef.current = false;
          clearAllIntervals(pollingIntervalRef, countdownIntervalRef);
          
          setVideoResult(videoData.video_url);
          setIsGenerating(false);
          clearGenerationState();
          
          toast({
            title: "¡Video completado!",
            description: videoData.title || "Tu video ha sido generado exitosamente.",
          });
        } else {
          console.log('⏳ Video no encontrado aún:', {
            requestId: requestId,
            minutesElapsed: minutesElapsed,
            nextCheckIn: '1 minuto'
          });
        }
      } catch (e) {
        console.error('❌ Error durante verificación retrasada:', {
          requestId: requestId,
          error: e,
          minutesElapsed: Math.floor((Date.now() - startTime) / 60000)
        });
      }
    };

    // Usar la nueva función de verificación retrasada
    startDelayedPolling(startTime, checkForVideo, pollingIntervalRef);
  }, [user, toast]);

  // Función legacy mantenida para compatibilidad
  const startPeriodicChecking = useCallback((
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('⚠️ startPeriodicChecking llamado (legacy) - requestId:', requestId);
    // En el nuevo flujo, esta función no se usa porque usamos startDelayedVideoChecking
  }, []);

  const checkFinalResult = useCallback(async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN FINAL después de 39 minutos:', {
      scriptPreview: scriptToCheck.substring(0, 50) + '...',
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      const videoData = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoData?.video_url) {
        console.log('✅ Video encontrado en verificación final:', {
          videoUrl: videoData.video_url,
          title: videoData.title
        });
        setVideoResult(videoData.video_url);
        toast({
          title: "¡Video completado!",
          description: videoData.title || "Tu video ha sido generado exitosamente.",
        });
      } else {
        console.log('❌ Video NO encontrado después de 39 minutos');
        toast({
          title: "Tiempo agotado",
          description: "El video está tomando más tiempo del esperado. Revisa la sección 'Videos Guardados' en unos minutos.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('❌ Error en verificación final:', e);
      toast({
        title: "Error en verificación",
        description: "Hubo un error al verificar el video. Revisa la sección 'Videos Guardados'.",
        variant: "destructive"
      });
    }
    
    isActiveRef.current = false;
    setIsGenerating(false);
    clearGenerationState();
  }, [user, toast]);

  const cleanup = useCallback(() => {
    console.log('🧹 Limpiando intervalos de monitoreo');
    isActiveRef.current = false;
    clearAllIntervals(pollingIntervalRef, countdownIntervalRef);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    timeRemaining,
    generationStartTime,
    startCountdown,
    startPeriodicChecking, // Mantenido para compatibilidad
    checkFinalResult,
    cleanup
  };
};
