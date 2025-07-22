
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useVideoGenerationDatabase } from './useVideoGenerationDatabase';
import { useVideoMonitoring } from './useVideoMonitoring';
import { useVideoVerification } from './useVideoVerification';
import { initiateVideoGeneration } from '@/lib/videoGenerationLogic';
import { validateFlowState } from '@/lib/videoGenerationLogic';
import { FlowState, ApiVersionCustomization } from '@/types/videoFlow';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { migrateLegacyData } from '@/lib/migrationUtils';
import { sendDirectToManualWebhook, sendDirectToManualWebhookWithUrls, sendDirectToManualWebhook2, sendDirectToManualWebhook2WithUrls } from '@/lib/webhookUtils';

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
  
  const { forceVideoCheck } = useVideoVerification();
  
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
    checkVideoManually: baseCheckVideoManually,
    cleanup 
  } = useVideoMonitoring();

  // Enhanced wrapper functions with multi-strategy verification
  const startCountdown = (requestId: string, setVideoResultParam: (result: string) => void, setIsGeneratingParam: (generating: boolean) => void, customStartTime?: number) => {
    console.log('🚀 useVideoGenerator - Iniciando countdown MEJORADO con verificación automática:', {
      requestId,
      customStartTime,
      hasSetVideoResult: !!setVideoResultParam,
      hasSetIsGenerating: !!setIsGeneratingParam
    });
    baseStartCountdown(requestId, setVideoResultParam, setIsGeneratingParam, customStartTime);
  };

  const startPeriodicChecking = () => {
    baseStartPeriodicChecking();
  };

  const checkFinalResult = () => {
    baseCheckFinalResult();
  };

  const checkVideoManually = () => {
    if (currentRequestId) {
      console.log('🔍 useVideoGenerator - Verificación manual MEJORADA');
      return baseCheckVideoManually(currentRequestId, setVideoResult, setIsGenerating);
    } else {
      // Fallback: use multi-strategy verification even without specific requestId
      console.log('🔍 useVideoGenerator - Verificación manual sin requestId específico - usando estrategia múltiple');
      return forceVideoCheck(setVideoResult, setIsGenerating);
    }
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

  // CRITICAL: Enhanced effect to monitor videoResult changes
  useEffect(() => {
    if (videoResult) {
      console.log('🎉 useVideoGenerator - videoResult actualizado (CRÍTICO - AUTO DISPLAY):', {
        videoUrl: videoResult,
        isGenerating: isGenerating,
        timestamp: new Date().toISOString()
      });
      
      // Force isGenerating = false when videoResult exists
      if (isGenerating) {
        console.log('🔄 useVideoGenerator - FORZANDO isGenerating = false (videoResult existe)');
        setIsGenerating(false);
      }
    }
  }, [videoResult, isGenerating]);

  // CRITICAL: Enhanced background checking with improved timing
  useEffect(() => {
    let backgroundCheckInterval: NodeJS.Timeout | null = null;
    
    if (isGenerating && currentRequestId && !videoResult) {
      console.log('🔄 Iniciando verificación de fondo MEJORADA cada 30 segundos para detectar videos completados');
      
      const backgroundCheck = async () => {
        if (!isGenerating || videoResult) return;
        
        console.log('🔍 Verificación de fondo CRÍTICA ejecutándose...');
        const success = await forceVideoCheck(setVideoResult, setIsGenerating);
        
        if (success) {
          console.log('✅ Video encontrado en verificación de fondo CRÍTICA');
          if (backgroundCheckInterval) {
            clearInterval(backgroundCheckInterval);
            backgroundCheckInterval = null;
          }
        }
      };
      
      // Start background checking after 3 minutes (earlier than before)
      setTimeout(() => {
        if (isGenerating && !videoResult) {
          backgroundCheck();
          backgroundCheckInterval = setInterval(backgroundCheck, 30 * 1000);
        }
      }, 3 * 60 * 1000);
    }
    
    return () => {
      if (backgroundCheckInterval) {
        clearInterval(backgroundCheckInterval);
      }
    };
  }, [isGenerating, currentRequestId, videoResult, forceVideoCheck]);

  // Check for existing generation on mount and migrate legacy data
  useEffect(() => {
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
      console.log('✅ useVideoGenerator - Manejando video completado:', {
        videoResult,
        currentRequestId
      });
      handleVideoCompleted(currentRequestId);
    }
  }, [videoResult, currentRequestId, handleVideoCompleted]);

  // Handle video expiration - only expire if generation has been running and timeRemaining is truly 0
  useEffect(() => {
    if (timeRemaining <= 0 && currentRequestId && isGenerating && currentGeneration) {
      // Only expire if the video has been created for more than 30 seconds
      const createdAt = new Date(currentGeneration.created_at);
      const now = new Date();
      const timeSinceCreation = (now.getTime() - createdAt.getTime()) / 1000; // seconds
      
      if (timeSinceCreation > 30) {
        console.log('⏰ Video expirado - marcando como expired');
        handleVideoExpired(currentRequestId);
        setIsGenerating(false);
      }
    }
  }, [timeRemaining, currentRequestId, isGenerating, handleVideoExpired, currentGeneration]);

  const handleCancelGeneration = async () => {
    console.log('🛑 Cancelando generación de video por solicitud del usuario');
    
    await handleCancelRecovery();
    
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

    console.log('🚀 useVideoGenerator - Iniciando nuevo proceso de generación de video');
    
    try {
      // Generate unique requestId - UNA SOLA VEZ
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const requestId = `${timestamp}-${random}`;
      setCurrentRequestId(requestId);

      console.log('🔍 useVideoGenerator - Generado requestId único:', {
        requestId: requestId,
        timestamp: timestamp,
        random: random
      });

      // Create database entry IMMEDIATELY 
      const success = await handleStartGeneration(script.trim(), requestId);
      if (!success) {
        throw new Error('No se pudo guardar el estado de generación');
      }

      // Start countdown with enhanced functions
      console.log('🎯 useVideoGenerator - Iniciando countdown MEJORADO');
      startCountdown(requestId, setVideoResult, setIsGenerating);
      startPeriodicChecking();

      toast({
        title: "Video en procesamiento",
        description: `Procesamiento iniciado. ID: ${requestId.substring(0, 8)}...`
      });

      // Send to webhook in background
      initiateVideoGeneration(
        script,
        user,
        flowState!,
        toast,
        requestId
      ).catch(err => {
        console.error('Error enviando al webhook (background):', err);
      });
      
    } catch (err) {
      console.error('Error en generación:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo iniciar la generación. Por favor, intenta de nuevo.", 
        variant: "destructive" 
      });
    }
  };

  const handleGenerateVideoWithFiles = async (
    images: File[], 
    videos: File[], 
    apiVersionCustomization: ApiVersionCustomization,
    flowState: FlowState,
    onProgress?: (current: number, total: number, type: 'image') => void
  ) => {
    console.log('🔍 DEBUG - handleGenerateVideoWithFiles called with flowState:', {
      hasFlowState: !!flowState,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      styleId: flowState?.selectedStyle?.id
    });

    if (currentGeneration && currentGeneration.status === 'processing' && timeRemaining > 0) {
      toast({
        title: "Video en proceso",
        description: "Ya tienes un video siendo generado. Espera a que termine o cancela la generación actual.",
        variant: "destructive"
      });
      throw new Error("Video en proceso");
    }

    if (!script.trim()) {
      toast({ 
        title: "Guion requerido", 
        description: "Por favor, ingresa un guion para generar el video.", 
        variant: "destructive" 
      });
      throw new Error("Guion requerido");
    }

    if (!validateFlowState(flowState)) {
      toast({ 
        title: "Configuración incompleta", 
        description: "Faltan datos de configuración. Por favor, completa el flujo de creación.", 
        variant: "destructive" 
      });
      throw new Error("Configuración incompleta");
    }

    setIsGenerating(true);
    setError('');
    setVideoResult('');

    console.log('Iniciando generación de video con archivos manuales');
    
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const requestId = `${timestamp}-${random}`;
      setCurrentRequestId(requestId);

      const decryptedApiKey = atob(flowState!.selectedApiKey!.api_key_encrypted);
      
      const payload = {
        script: script.trim(),
        userId: user?.id || '',
        requestId,
        timestamp: new Date().toISOString(),
        appMode: 'production',
        ClaveAPI: decryptedApiKey,
        AvatarID: flowState!.selectedAvatar?.avatar_id,
        VoiceID: flowState!.selectedVoice?.voice_id,
        Estilo: flowState!.selectedStyle?.id,
        width: apiVersionCustomization?.width || 1280,
        height: apiVersionCustomization?.height || 720,
        subtitleCustomization: flowState!.subtitleCustomization ? {
          fontFamily: flowState!.subtitleCustomization.fontFamily || "",
          subtitleEffect: flowState!.subtitleCustomization.subtitleEffect || "",
          placementEffect: flowState!.subtitleCustomization.placementEffect || "",
          textTransform: flowState!.subtitleCustomization.textTransform || "",
          backgroundColor: flowState!.subtitleCustomization.hasBackgroundColor 
            ? flowState!.subtitleCustomization.backgroundColor 
            : "",
          textColor: flowState!.subtitleCustomization.textColor || "",
          Tamañofuente: flowState!.subtitleCustomization.Tamañofuente || 700,
          "Fixed size": flowState!.subtitleCustomization["Fixed size"] || 5.5,
          fill: flowState!.subtitleCustomization.fill || ""
        } : null,
        split: flowState!.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
      };

      if (flowState!.selectedStyle?.id === 'style-6') {
        await sendDirectToManualWebhook2(payload, images, videos, onProgress);
      } else {
        await sendDirectToManualWebhook(payload, images, videos, onProgress);
      }
      
      const success = await handleStartGeneration(script.trim(), requestId);
      if (!success) {
        throw new Error('No se pudo guardar el estado de generación');
      }

      startCountdown(requestId, setVideoResult, setIsGenerating);
      startPeriodicChecking();

      toast({
        title: "Video en procesamiento",
        description: `Procesamiento iniciado. ID: ${requestId.substring(0, 8)}...`
      });
      
    } catch (err) {
      console.error('Error en generación con archivos:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo iniciar la generación. Por favor, intenta de nuevo.", 
        variant: "destructive" 
      });
      
      throw err;
    }
  };

  const handleGenerateVideoWithUrls = async (
    driveUrls: any,
    apiVersionCustomization: ApiVersionCustomization,
    flowState: FlowState
  ) => {
    console.log('🔍 DEBUG - handleGenerateVideoWithUrls called with flowState:', {
      hasFlowState: !!flowState,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      styleId: flowState?.selectedStyle?.id
    });

    if (currentGeneration && currentGeneration.status === 'processing' && timeRemaining > 0) {
      toast({
        title: "Video en proceso",
        description: "Ya tienes un video siendo generado. Espera a que termine o cancela la generación actual.",
        variant: "destructive"
      });
      throw new Error("Video en proceso");
    }

    if (!script.trim()) {
      toast({ 
        title: "Guion requerido", 
        description: "Por favor, ingresa un guion para generar el video.", 
        variant: "destructive" 
      });
      throw new Error("Guion requerido");
    }

    if (!validateFlowState(flowState)) {
      toast({ 
        title: "Configuración incompleta", 
        description: "Faltan datos de configuración. Por favor, completa el flujo de creación.", 
        variant: "destructive" 
      });
      throw new Error("Configuración incompleta");
    }

    setIsGenerating(true);
    setError('');
    setVideoResult('');

    console.log('Iniciando generación de video con URLs de Drive');
    
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const requestId = `${timestamp}-${random}`;
      setCurrentRequestId(requestId);

      const decryptedApiKey = atob(flowState!.selectedApiKey!.api_key_encrypted);
      
      const payload = {
        script: script.trim(),
        userId: user?.id || '',
        requestId,
        timestamp: new Date().toISOString(),
        appMode: 'production',
        ClaveAPI: decryptedApiKey,
        AvatarID: flowState!.selectedAvatar?.avatar_id,
        VoiceID: flowState!.selectedVoice?.voice_id,
        Estilo: flowState!.selectedStyle?.id,
        width: apiVersionCustomization?.width || 1280,
        height: apiVersionCustomization?.height || 720,
        subtitleCustomization: flowState!.subtitleCustomization ? {
          fontFamily: flowState!.subtitleCustomization.fontFamily || "",
          subtitleEffect: flowState!.subtitleCustomization.subtitleEffect || "",
          placementEffect: flowState!.subtitleCustomization.placementEffect || "",
          textTransform: flowState!.subtitleCustomization.textTransform || "",
          backgroundColor: flowState!.subtitleCustomization.hasBackgroundColor 
            ? flowState!.subtitleCustomization.backgroundColor 
            : "",
          textColor: flowState!.subtitleCustomization.textColor || "",
          Tamañofuente: flowState!.subtitleCustomization.Tamañofuente || 700,
          "Fixed size": flowState!.subtitleCustomization["Fixed size"] || 5.5,
          fill: flowState!.subtitleCustomization.fill || ""
        } : null,
        split: flowState!.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
      };

      if (flowState!.selectedStyle?.id === 'style-6') {
        await sendDirectToManualWebhook2WithUrls(payload, driveUrls);
      } else {
        await sendDirectToManualWebhookWithUrls(payload, driveUrls);
      }
      
      const success = await handleStartGeneration(script.trim(), requestId);
      if (!success) {
        throw new Error('No se pudo guardar el estado de generación');
      }

      startCountdown(requestId, setVideoResult, setIsGenerating);
      startPeriodicChecking();

      toast({
        title: "Video en procesamiento",
        description: `Procesamiento iniciado. ID: ${requestId.substring(0, 8)}...`
      });
      
    } catch (err) {
      console.error('Error en generación con URLs:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo iniciar la generación. Por favor, intenta de nuevo.", 
        variant: "destructive" 
      });
      
      throw err;
    }
  };

  const handleNewVideo = () => {
    setScript('');
    setVideoResult('');
    setError('');
    setCurrentRequestId('');
    cleanup();
  };

  // Enhanced logging
  console.log('🔍 useVideoGenerator - Estado CRÍTICO MEJORADO:', {
    isGenerating,
    hasVideoResult: !!videoResult,
    videoResultUrl: videoResult,
    currentRequestId,
    timeRemaining,
    timestamp: new Date().toISOString()
  });

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
      setVideoResult,
      setIsGenerating,
      handleGenerateVideo,
      handleGenerateVideoWithFiles,
      handleGenerateVideoWithUrls,
      handleRecoverGeneration,
      handleCancelRecovery,
      handleNewVideo,
      handleCancelGeneration,
      checkVideoManually,
    },
  };
};
