import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { clearGenerationState, getGenerationState } from '@/lib/videoGeneration';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { FlowState } from '@/types/videoFlow';
import { useVideoRecovery } from '@/hooks/useVideoRecovery';
import { useVideoMonitoring } from '@/hooks/useVideoMonitoring';
import { 
  validateFlowState, 
  initiateVideoGeneration 
} from '@/lib/videoGenerationLogic';

interface UseVideoGeneratorProps {
  flowState?: FlowState;
}

export const useVideoGenerator = (props?: UseVideoGeneratorProps) => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    showRecoveryOption,
    isRecovering,
    handleRecoverGeneration: baseHandleRecoverGeneration,
    handleCancelRecovery
  } = useVideoRecovery();

  const {
    timeRemaining,
    startCountdown: baseStartCountdown,
    startPeriodicChecking: baseStartPeriodicChecking,
    checkFinalResult: baseCheckFinalResult,
    cleanup
  } = useVideoMonitoring();

  // Wrapper functions to provide state setters to monitoring hooks
  const startCountdown = (requestId: string, scriptToCheck: string, setVideoResultParam: (result: string) => void, setIsGeneratingParam: (generating: boolean) => void, customStartTime?: number) => {
    baseStartCountdown(requestId, scriptToCheck, setVideoResultParam, setIsGeneratingParam, customStartTime);
  };

  const startPeriodicChecking = (requestId: string, scriptToCheck: string) => {
    baseStartPeriodicChecking(requestId, scriptToCheck, setVideoResult, setIsGenerating);
  };

  const checkFinalResult = (scriptToCheck: string) => {
    baseCheckFinalResult(scriptToCheck, setVideoResult, setIsGenerating);
  };

  const handleRecoverGeneration = () => {
    baseHandleRecoverGeneration(
      setScript,
      setCurrentRequestId,
      setIsGenerating,
      setVideoResult,
      startCountdown,
      startPeriodicChecking,
      checkFinalResult
    );
  };

  // Verificar si hay una generación pendiente al montar el componente
  useEffect(() => {
    const savedState = getGenerationState();
    if (savedState && savedState.status === 'pending') {
      const timeElapsed = Date.now() - savedState.timestamp;
      const MAX_GENERATION_TIME = COUNTDOWN_TIME * 1000; // COUNTDOWN_TIME en milisegundos
      
      // Si no ha expirado, bloquear el botón
      if (timeElapsed < MAX_GENERATION_TIME) {
        console.log('🔒 Detectada generación pendiente al cargar la app - bloqueando botón');
        setIsGenerating(true);
        setCurrentRequestId(savedState.requestId);
        setScript(savedState.script);
      } else {
        // Si ya expiró, limpiar el estado
        console.log('⏰ Generación pendiente expirada - limpiando estado');
        clearGenerationState();
      }
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Nueva función para cancelar la generación actual
  const handleCancelGeneration = () => {
    console.log('🛑 Cancelando generación de video por solicitud del usuario');
    
    // Limpiar todos los estados
    setIsGenerating(false);
    setVideoResult(null);
    setError(null);
    setCurrentRequestId(null);
    
    // Limpiar el almacenamiento local
    clearGenerationState();
    
    // Limpiar timers y monitoring
    cleanup();
    
    toast({
      title: "Generación cancelada",
      description: "La generación del video ha sido cancelada exitosamente.",
      variant: "default"
    });
  };

  const handleGenerateVideo = async () => {
    // Validación: si ya está generando, mostrar alerta
    if (isGenerating) {
      toast({
        title: "Video en proceso",
        description: "Ya tienes un video siendo generado. Espera a que termine o cancela la generación actual.",
        variant: "destructive"
      });
      return;
    }

    if (!script.trim()) {
      toast({ 
        title: "Guion requerido", 
        description: "Por favor, ingresa un guion para generar el video.", 
        variant: "destructive" 
      });
      return;
    }

    const flowState = props?.flowState;
    if (!validateFlowState(flowState)) {
      toast({ 
        title: "Configuración incompleta", 
        description: "Faltan datos de configuración. Por favor, completa el flujo de creación.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoResult(null);

    console.log('Iniciando nuevo proceso de generación de video');
    
    try {
      const requestId = await initiateVideoGeneration(
        script,
        user,
        flowState!,
        toast
      );
      
      setCurrentRequestId(requestId);
      startCountdown(requestId, script.trim(), setVideoResult, setIsGenerating);
      startPeriodicChecking(requestId, script.trim());
      
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

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
    setCurrentRequestId(null);
    clearGenerationState();
    cleanup();
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
      currentRequestId,
    },
    handlers: {
      setScript,
      handleGenerateVideo,
      handleRecoverGeneration,
      handleCancelRecovery,
      handleNewVideo,
      handleCancelGeneration, // Nueva función
    },
  };
};
