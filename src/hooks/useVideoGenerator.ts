
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  GenerationState,
  getGenerationState,
  saveGenerationState,
  clearGenerationState,
} from '@/lib/videoGeneration';
import { COUNTDOWN_TIME, calculateTimeRemaining, isTimeExpired } from '@/lib/countdownUtils';
import { sendToWebhook } from '@/lib/webhookUtils';
import { checkVideoInDatabase, checkFinalVideoResult, checkPendingGenerationOnStart, syncGenerationState } from '@/lib/databaseUtils';
import { clearAllIntervals, startCountdownInterval, startPollingInterval } from '@/lib/intervalUtils';

export const useVideoGenerator = () => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performIntelligentSync = async () => {
      const savedState = getGenerationState();
      if (savedState && savedState.status === 'pending' && user) {
        console.log('Estado pendiente detectado, iniciando sincronización inteligente...');
        
        if (isTimeExpired(savedState.timestamp)) {
          console.log('Estado expirado, limpiando localStorage');
          clearGenerationState();
          return;
        }

        // Verificación inteligente: buscar video ya generado
        const existingVideo = await syncGenerationState(user, savedState.requestId, savedState.script);
        
        if (existingVideo?.video_url) {
          console.log('¡Sincronización exitosa! Video encontrado:', existingVideo.video_url);
          
          // Mostrar video inmediatamente sin pasar por pantalla de recuperación
          setVideoResult(existingVideo.video_url);
          setScript(savedState.script);
          clearGenerationState();
          
          toast({
            title: "¡Video recuperado!",
            description: "Tu video ya estaba generado y ha sido sincronizado automáticamente.",
          });
        } else {
          console.log('Video aún no generado, mostrando opción de recuperación');
          
          // Video aún no está generado, mostrar opción de recuperación
          setScript(savedState.script);
          setCurrentRequestId(savedState.requestId);
          setShowRecoveryOption(true);
          
          toast({
            title: "Procesamiento pendiente",
            description: "Detectamos un video en procesamiento. ¿Quieres continuar verificando?",
          });
        }
      }
    };

    if (user) {
      performIntelligentSync();
    }
  }, [user, toast]);

  useEffect(() => {
    return () => {
      clearAllIntervals(pollingIntervalRef, countdownIntervalRef);
    };
  }, []);

  const startCountdown = (requestId: string, scriptToCheck: string, customStartTime?: number) => {
    const startTime = customStartTime || Date.now();
    console.log('Iniciando contador para requestId:', requestId, 'desde:', new Date(startTime));
    
    setGenerationStartTime(startTime);
    
    const handleTimeUpdate = (remaining: number) => {
      setTimeRemaining(remaining);
    };

    const handleTimeExpired = () => {
      checkFinalResult(scriptToCheck);
    };

    startCountdownInterval(startTime, handleTimeUpdate, handleTimeExpired, countdownIntervalRef);
  };

  const startPeriodicChecking = (requestId: string, scriptToCheck: string) => {
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

  const checkFinalResult = async (scriptToCheck: string) => {
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
        setError('El procesamiento tomó más tiempo del esperado. Contacta con soporte.');
        toast({
          title: "Tiempo agotado",
          description: "El video está tomando más tiempo del esperado. Por favor contacta con soporte.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('Error en verificación final:', e);
      setError('Error al verificar el resultado final');
    }
    
    setIsGenerating(false);
    clearGenerationState();
  };

  const handleGenerateVideo = async () => {
    if (!script.trim()) {
      toast({ 
        title: "Guion requerido", 
        description: "Por favor, ingresa un guion para generar el video.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoResult(null);
    setShowRecoveryOption(false);

    const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
    setCurrentRequestId(requestId);
    
    const generationState: GenerationState = { 
      script: script.trim(), 
      requestId, 
      timestamp: Date.now(), 
      status: 'pending' 
    };
    saveGenerationState(generationState);

    console.log('Iniciando nuevo proceso de generación de video con requestId:', requestId);
    
    try {
      await sendToWebhook(script.trim(), requestId, user?.id);
      
      startCountdown(requestId, script.trim());
      startPeriodicChecking(requestId, script.trim());
      
      toast({
        title: "Solicitud enviada",
        description: "Tu video se está procesando. Te notificaremos cuando esté listo.",
      });
      
    } catch (err) {
      console.error('Error en generación:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      clearGenerationState();
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo enviar la solicitud. Por favor, intenta de nuevo.", 
        variant: "destructive" 
      });
    }
  };

  const handleRecoverGeneration = async () => {
    const savedState = getGenerationState();
    if (savedState && user) {
      setIsRecovering(true);
      setIsGenerating(true);
      setShowRecoveryOption(false);
      setCurrentRequestId(savedState.requestId);
      
      const timeElapsed = Date.now() - savedState.timestamp;
      const timeElapsedSeconds = Math.floor(timeElapsed / 1000);
      const remainingTime = Math.max(0, COUNTDOWN_TIME - timeElapsedSeconds);
      
      console.log('Recuperando generación con verificación inteligente:', {
        timestampOriginal: new Date(savedState.timestamp),
        tiempoTranscurrido: timeElapsedSeconds,
        tiempoRestante: remainingTime
      });
      
      toast({ 
        title: "Recuperando procesamiento", 
        description: "Verificando el estado de tu video..." 
      });
      
      // Usar sincronización inteligente para verificar estado
      const existingVideo = await syncGenerationState(user, savedState.requestId, savedState.script);
      
      if (existingVideo?.video_url) {
        console.log('Video encontrado durante recuperación:', existingVideo.video_url);
        setVideoResult(existingVideo.video_url);
        setIsGenerating(false);
        setIsRecovering(false);
        clearGenerationState();
        toast({ 
          title: "¡Video recuperado!", 
          description: "Tu video estaba listo y ha sido recuperado." 
        });
      } else {
        console.log('Video aún no generado, continuando verificación...');
        setIsRecovering(false);
        if (remainingTime > 0) {
          startCountdown(savedState.requestId, savedState.script, savedState.timestamp);
          startPeriodicChecking(savedState.requestId, savedState.script);
        } else {
          checkFinalResult(savedState.script);
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

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
    setGenerationStartTime(null);
    setShowRecoveryOption(false);
    setIsRecovering(false);
    setTimeRemaining(COUNTDOWN_TIME);
    setCurrentRequestId(null);
    clearGenerationState();
    
    clearAllIntervals(pollingIntervalRef, countdownIntervalRef);
  };

  return {
    state: {
      script,
      isGenerating,
      videoResult,
      error,
      showRecoveryOption,
      isRecovering,
      timeRemaining,
      totalTime: COUNTDOWN_TIME,
    },
    handlers: {
      setScript,
      handleGenerateVideo,
      handleRecoverGeneration,
      handleCancelRecovery,
      handleNewVideo,
    },
  };
};
