import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useVideoGenerationDatabase } from './useVideoGenerationDatabase';
import { useVideoMonitoring } from './useVideoMonitoring';
import { initiateVideoGeneration } from '@/lib/videoGenerationLogic';
import { validateFlowState } from '@/lib/videoGenerationLogic';
import { FlowState } from '@/types/videoFlow';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { migrateLegacyData } from '@/lib/migrationUtils';

interface UseVideoGeneratorProps {
  flowState?: FlowState;
}

export const useVideoGenerator = (props?: UseVideoGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentRequestId, setCurrentRequestId] = useState<string>('');
  
  const { 
    currentGeneration,
    timeRemaining,
    showRecoveryOption, 
    isRecovering, 
    isLoading,
    handleStartGeneration,
    handleRecoverGeneration: baseHandleRecoverGeneration, 
    handleCancelRecovery,
    handleVideoCompleted,
    handleVideoExpired,
    refreshCurrentGeneration
  } = useVideoGenerationDatabase();
  
  const { 
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
      startCountdown
    );
  };

  // Check for existing generation on mount and migrate legacy data
  useEffect(() => {
    // Clean up any legacy localStorage data
    migrateLegacyData();
    
    if (currentGeneration && currentGeneration.status === 'processing') {
      setScript(currentGeneration.script);
      setCurrentRequestId(currentGeneration.request_id);
      
      if (timeRemaining > 0) {
        setIsGenerating(true);
      }
    }
  }, [currentGeneration, timeRemaining]);

  // Handle video completion
  useEffect(() => {
    if (videoResult && currentRequestId) {
      handleVideoCompleted(currentRequestId);
    }
  }, [videoResult, currentRequestId, handleVideoCompleted]);

  // Handle video expiration
  useEffect(() => {
    if (timeRemaining <= 0 && currentRequestId && isGenerating) {
      handleVideoExpired(currentRequestId);
      setIsGenerating(false);
    }
  }, [timeRemaining, currentRequestId, isGenerating, handleVideoExpired]);

  const handleCancelGeneration = () => {
    console.log('🛑 Cancelando generación de video por solicitud del usuario');
    
    if (currentRequestId) {
      handleVideoExpired(currentRequestId);
    }
    
    setIsGenerating(false);
    setVideoResult('');
    setError('');
    setCurrentRequestId('');
    cleanup();
    
    toast({
      title: "Generación cancelada",
      description: "La generación del video ha sido cancelada exitosamente.",
      variant: "default"
    });
  };

  const handleGenerateVideo = async () => {
    // Simple check for existing generation without triggering refresh
    if (currentGeneration && currentGeneration.status === 'processing' && timeRemaining > 0) {
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
    setError('');
    setVideoResult('');

    console.log('Iniciando nuevo proceso de generación de video');
    
    try {
      const result = await initiateVideoGeneration(
        script,
        user,
        flowState!,
        toast
      );
      
      const { requestId, webhookConfirmed } = result;
      setCurrentRequestId(requestId);
      
      // Only save to database if webhook confirmed receipt
      if (webhookConfirmed) {
        const success = await handleStartGeneration(script.trim(), requestId);
        if (!success) {
          throw new Error('No se pudo guardar el estado de generación');
        }
        
        startCountdown(requestId, script.trim(), setVideoResult, setIsGenerating);
        startPeriodicChecking(requestId, script.trim());
        
        toast({
          title: "Video en procesamiento",
          description: `Webhook confirmó recepción y comenzó el procesamiento.`
        });
      } else {
        // Webhook didn't confirm, but we don't want to throw an error
        setIsGenerating(false);
        toast({
          title: "Advertencia",
          description: "La solicitud fue enviada pero no se confirmó la recepción. Intenta de nuevo si no ves progreso.",
          variant: "destructive"
        });
        return;
      }
      
    } catch (err) {
      console.error('Error en generación:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
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
    setVideoResult('');
    setError('');
    setCurrentRequestId('');
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
      isLoading,
    },
    handlers: {
      setScript,
      handleGenerateVideo,
      handleRecoverGeneration,
      handleCancelRecovery,
      handleNewVideo,
      handleCancelGeneration,
    },
  };
};