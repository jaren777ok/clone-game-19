
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { verifyVideoExists, recoverLostVideo } from '@/lib/databaseUtils';
import { clearGenerationState } from '@/lib/videoGeneration';
import { useVideoVerification } from './useVideoVerification';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { checkRecentCompletedVideos, forceVideoCheck } = useVideoVerification();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const intensiveCheckRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const clearAllIntervals = useCallback(() => {
    console.log('🧹 Limpiando todos los intervalos de monitoreo');
    [pollingIntervalRef, countdownIntervalRef, recoveryIntervalRef, intensiveCheckRef].forEach(ref => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  }, []);

  const videoDetected = useCallback(async (videoData: any, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void) => {
    console.log('🎉 VIDEO DETECTADO - FORZANDO ACTUALIZACIÓN INMEDIATA:', {
      videoUrl: videoData.video_url,
      title: videoData.title,
      requestId: videoData.request_id,
      timestamp: new Date().toISOString()
    });
    
    // Stop all processes immediately
    isActiveRef.current = false;
    clearAllIntervals();
    
    // Force immediate UI update
    console.log('🔄 EJECUTANDO setVideoResult y setIsGenerating(false) INMEDIATAMENTE');
    setVideoResult(videoData.video_url);
    setIsGenerating(false);
    clearGenerationState();
    
    toast({
      title: "¡Video completado!",
      description: videoData.title || "Tu video ha sido generado exitosamente.",
    });
    
  }, [clearAllIntervals, toast]);

  // Enhanced final verification using multi-strategy approach
  const executeFinalVerification = useCallback(async (
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🎯 VERIFICACIÓN FINAL MEJORADA - Timer llegó a 00:00');
    
    try {
      // Use multi-strategy verification
      const videoData = await checkRecentCompletedVideos();
      
      if (videoData) {
        console.log('🎉 VIDEO ENCONTRADO CON ESTRATEGIA MÚLTIPLE:', videoData);
        await videoDetected(videoData, setVideoResult, setIsGenerating);
        return;
      }

      // Video not found
      console.log('⏰ No se encontró video después de verificación múltiple');
      handleVideoNotFound(setVideoResult, setIsGenerating);
      
    } catch (error) {
      console.error('❌ Error en verificación final mejorada:', error);
      handleVideoNotFound(setVideoResult, setIsGenerating);
    }
  }, [checkRecentCompletedVideos, videoDetected]);

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
      description: "Tu video está tardando un poco más de lo normal. Revisa 'Videos Guardados' en 10-15 minutos.",
      variant: "default"
    });
  }, [toast]);

  // Enhanced countdown with intensive checking in final minutes
  const startCountdown = useCallback((
    requestId: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number,
    isRecovering?: boolean
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('🚀 Iniciando monitoreo MEJORADO con verificación intensiva:', {
      requestId: requestId,
      startTime: new Date(startTime).toISOString(),
      userId: user?.id,
      isRecovering: !!isRecovering
    });
    
    setGenerationStartTime(startTime);
    isActiveRef.current = true;
    
    // Main countdown timer
    const updateCountdown = async () => {
      if (!isActiveRef.current) return;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      updateTimeRemaining(remaining);
      
      // When timer reaches 00:00 - execute enhanced final verification
      if (remaining <= 0) {
        console.log('⏰ TIMER LLEGÓ A 00:00 - EJECUTANDO VERIFICACIÓN FINAL MEJORADA');
        
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        
        await executeFinalVerification(setVideoResult, setIsGenerating);
        return;
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // Intensive checking in the last 2 minutes (every 10 seconds)
    setTimeout(() => {
      if (!isActiveRef.current) return;
      
      console.log('🎯 INICIANDO VERIFICACIÓN INTENSIVA - Cada 10 segundos en últimos 2 minutos');
      
      const intensiveCheck = async () => {
        if (!isActiveRef.current) return;
        
        console.log('🔍 Verificación intensiva ejecutándose...');
        const videoData = await checkRecentCompletedVideos();
        
        if (videoData && isActiveRef.current) {
          console.log('✅ VIDEO ENCONTRADO EN VERIFICACIÓN INTENSIVA:', videoData);
          await videoDetected(videoData, setVideoResult, setIsGenerating);
        }
      };
      
      intensiveCheck();
      intensiveCheckRef.current = setInterval(intensiveCheck, 10 * 1000); // Every 10 seconds
      
    }, (COUNTDOWN_TIME - 120) * 1000); // Start 2 minutes before end

    // Recovery mode or normal mode setup
    if (isRecovering) {
      console.log('🔄 MODO RECUPERACIÓN - Verificaciones cada 30 segundos');
      
      const recoveryCheck = async () => {
        if (!isActiveRef.current) return;
        
        const videoData = await verifyVideoExists(user, requestId) || await checkRecentCompletedVideos();
        if (videoData && isActiveRef.current) {
          await videoDetected(videoData, setVideoResult, setIsGenerating);
        }
      };
      
      setTimeout(recoveryCheck, 5000);
      recoveryIntervalRef.current = setInterval(recoveryCheck, 30 * 1000);
      
    } else {
      // Regular verification from minute 25
      setTimeout(() => {
        if (!isActiveRef.current) return;
        
        console.log('🎯 INICIANDO VERIFICACIONES REGULARES DESDE MINUTO 25');
        
        const regularCheck = async () => {
          if (!isActiveRef.current) return;
          
          const videoData = await verifyVideoExists(user, requestId) || 
                           await recoverLostVideo(user, requestId) || 
                           await checkRecentCompletedVideos();
          
          if (videoData && isActiveRef.current) {
            await videoDetected(videoData, setVideoResult, setIsGenerating);
          }
        };
        
        regularCheck();
        pollingIntervalRef.current = setInterval(regularCheck, 60 * 1000);
        
      }, 25 * 60 * 1000);
    }

  }, [updateTimeRemaining, user, videoDetected, executeFinalVerification, checkRecentCompletedVideos]);

  // Enhanced manual check using multi-strategy
  const checkVideoManually = useCallback(async (
    requestId: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🔍 VERIFICACIÓN MANUAL MEJORADA');
    return await forceVideoCheck(setVideoResult, setIsGenerating);
  }, [forceVideoCheck]);

  // Legacy functions for compatibility
  const startPeriodicChecking = useCallback(() => {
    console.log('⚠️ startPeriodicChecking (legacy) - funcionalidad incluida en startCountdown');
  }, []);

  const checkFinalResult = useCallback(() => {
    console.log('⚠️ checkFinalResult (legacy) - usar executeFinalVerification');
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
