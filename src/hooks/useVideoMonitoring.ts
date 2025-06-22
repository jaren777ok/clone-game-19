
import { useState, useRef } from 'react';
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

  const startCountdown = (
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    const startTime = customStartTime || Date.now();
    console.log('Iniciando contador para requestId:', requestId, 'desde:', new Date(startTime));
    
    setGenerationStartTime(startTime);
    
    const handleTimeUpdate = (remaining: number) => {
      setTimeRemaining(remaining);
    };

    const handleTimeExpired = () => {
      checkFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
    };

    startCountdownInterval(startTime, handleTimeUpdate, handleTimeExpired, countdownIntervalRef);
  };

  const startPeriodicChecking = (
    requestId: string, 
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('Iniciando verificación periódica cada 30 segundos');
    
    const checkForVideo = async () => {
      try {
        const videoData = await checkVideoInDatabase(user, requestId, scriptToCheck);
        
        if (videoData?.video_url) {
          console.log('¡Video encontrado durante verificación!:', videoData.video_url);
          
          clearAllIntervals(pollingIntervalRef, countdownIntervalRef);
          
          setVideoResult(videoData.video_url);
          setIsGenerating(false);
          clearGenerationState();
          
          toast({
            title: "¡Video completado!",
            description: "Tu video ha sido generado exitosamente.",
          });
        }
      } catch (e) {
        console.error('Error durante verificación periódica:', e);
      }
    };

    startPollingInterval(checkForVideo, pollingIntervalRef);
  };

  const checkFinalResult = async (
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('Verificación final después del countdown');
    
    try {
      const videoUrl = await checkFinalVideoResult(user, scriptToCheck);
      
      if (videoUrl) {
        setVideoResult(videoUrl);
        toast({
          title: "¡Video completado!",
          description: "Tu video ha sido generado exitosamente.",
        });
      } else {
        toast({
          title: "Tiempo agotado",
          description: "El video está tomando más tiempo del esperado. Por favor contacta con soporte.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('Error en verificación final:', e);
    }
    
    setIsGenerating(false);
    clearGenerationState();
  };

  const cleanup = () => {
    clearAllIntervals(pollingIntervalRef, countdownIntervalRef);
  };

  return {
    timeRemaining,
    generationStartTime,
    startCountdown,
    startPeriodicChecking,
    checkFinalResult,
    cleanup
  };
};
