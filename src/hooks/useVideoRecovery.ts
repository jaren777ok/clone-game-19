
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  getGenerationState, 
  clearGenerationState 
} from '@/lib/videoGeneration';
import { checkVideoInDatabase } from '@/lib/databaseUtils';
import { isTimeExpired } from '@/lib/countdownUtils';

export const useVideoRecovery = () => {
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const savedState = getGenerationState();
    if (savedState && savedState.status === 'pending') {
      if (!isTimeExpired(savedState.timestamp)) {
        setShowRecoveryOption(true);
        toast({
          title: "Procesamiento pendiente",
          description: "Detectamos un video en procesamiento. ¿Quieres continuar verificando?",
        });
      } else {
        clearGenerationState();
      }
    }
  }, [toast]);

  const handleRecoverGeneration = async (
    setScript: (script: string) => void,
    setCurrentRequestId: (id: string) => void,
    setIsGenerating: (generating: boolean) => void,
    setVideoResult: (result: string) => void,
    startCountdown: (requestId: string, script: string, startTime?: number) => void,
    startPeriodicChecking: (requestId: string, script: string) => void,
    checkFinalResult: (script: string) => void
  ) => {
    const savedState = getGenerationState();
    if (savedState) {
      setIsRecovering(true);
      setIsGenerating(true);
      setShowRecoveryOption(false);
      setCurrentRequestId(savedState.requestId);
      setScript(savedState.script);
      
      const timeElapsed = Date.now() - savedState.timestamp;
      const timeElapsedSeconds = Math.floor(timeElapsed / 1000);
      const remainingTime = Math.max(0, 3420 - timeElapsedSeconds); // 57 * 60 = 3420
      
      console.log('Recuperando generación:', {
        timestampOriginal: new Date(savedState.timestamp),
        tiempoTranscurrido: timeElapsedSeconds,
        tiempoRestante: remainingTime
      });
      
      toast({ 
        title: "Recuperando procesamiento", 
        description: "Verificando el estado de tu video..." 
      });
      
      if (user) {
        try {
          const videoData = await checkVideoInDatabase(user, savedState.requestId, savedState.script);
          if (videoData?.video_url) {
            setVideoResult(videoData.video_url);
            setIsGenerating(false);
            setIsRecovering(false);
            clearGenerationState();
            toast({ 
              title: "¡Video recuperado!", 
              description: "Tu video estaba listo y ha sido recuperado." 
            });
          } else {
            setIsRecovering(false);
            if (remainingTime > 0) {
              startCountdown(savedState.requestId, savedState.script, savedState.timestamp);
              startPeriodicChecking(savedState.requestId, savedState.script);
            } else {
              checkFinalResult(savedState.script);
            }
          }
        } catch (error) {
          console.error('Error recovering video:', error);
          setIsRecovering(false);
          setIsGenerating(false);
        }
      }
    }
  };

  const handleCancelRecovery = () => {
    clearGenerationState();
    setShowRecoveryOption(false);
    toast({ 
      title: "Procesamiento cancelado", 
      description: "El estado anterior ha sido eliminado." 
    });
  };

  return {
    showRecoveryOption,
    isRecovering,
    handleRecoverGeneration,
    handleCancelRecovery
  };
};
