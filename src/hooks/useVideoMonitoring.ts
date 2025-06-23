
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  COUNTDOWN_TIME, 
  calculateTimeRemaining 
} from '@/lib/countdownUtils';
import { checkVideoInDatabase, checkFinalVideoResult } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';
import { 
  clearAllIntervals, 
  startCountdownInterval, 
  startPollingInterval 
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
    console.log('🚀 Iniciando contador de 39 minutos para requestId:', requestId, 'desde:', new Date(startTime));
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    
    const handleTimeUpdate = (remaining: number) => {
      if (isActiveRef.current) {
        updateTimeRemaining(remaining);
      }
    };

    const handleTimeExpired = () => {
      console.log('⏰ Contador finalizado, ejecutando verificación final');
      isActiveRef.current = false;
      checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
    };

    startCountdownInterval(startTime, handleTimeUpdate, handleTimeExpired, countdownIntervalRef);
  }, [updateTimeRemaining]);

  const startPeriodicChecking = useCallback((
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔄 Iniciando verificación cada 3 minutos para requestId:', requestId);
    
    const checkForVideo = async () => {
      if (!isActiveRef.current) return;
      
      try {
        console.log('🔍 Verificando video en base de datos...');
        const videoData = await checkVideoInDatabase(user, requestId, scriptToCheck);
        
        if (videoData?.video_url) {
          console.log('✅ ¡Video encontrado!:', videoData.video_url);
          console.log('📝 Con título:', videoData.title);
          
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
          const minutesElapsed = Math.floor((Date.now() - (generationStartTime || Date.now())) / 60000);
          console.log(`⏳ Video no encontrado aún. Tiempo transcurrido: ${minutesElapsed} minutos`);
        }
      } catch (e) {
        console.error('❌ Error durante verificación periódica:', e);
      }
    };

    // Ejecutar verificación inmediata
    checkForVideo();
    
    // Luego iniciar verificaciones cada 3 minutos
    startPollingInterval(checkForVideo, pollingIntervalRef, 180000);
  }, [user, generationStartTime, toast]);

  const checkFinalResult = useCallback(async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 Verificación final después del contador de 39 minutos');
    
    try {
      const videoData = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoData?.video_url) {
        console.log('✅ Video encontrado en verificación final:', videoData.video_url);
        setVideoResult(videoData.video_url);
        toast({
          title: "¡Video completado!",
          description: videoData.title || "Tu video ha sido generado exitosamente.",
        });
      } else {
        console.log('❌ Video no encontrado después de 39 minutos');
        toast({
          title: "Tiempo agotado",
          description: "El video está tomando más tiempo del esperado. Por favor contacta con soporte.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('❌ Error en verificación final:', e);
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
    startPeriodicChecking,
    checkFinalResult,
    cleanup
  };
};
