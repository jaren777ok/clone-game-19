import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useVideoGenerationDatabase } from './useVideoGenerationDatabase';
import { useVideoMonitoring } from './useVideoMonitoring';
import { initiateVideoGeneration } from '@/lib/videoGenerationLogic';
import { validateFlowState } from '@/lib/videoGenerationLogic';
import { FlowState, ApiVersionCustomization } from '@/types/videoFlow';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { migrateLegacyData } from '@/lib/migrationUtils';
import { sendDirectToManualWebhook, sendDirectToManualWebhookWithUrls, sendDirectToManualWebhook2, sendDirectToManualWebhook2WithUrls } from '@/lib/webhookUtils';
import { clearVideoConfig } from '@/lib/videoConfigDatabase';

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
    checkVideoManually: baseCheckVideoManually,
    cleanup,
    // Expose the monitoring properties
    canCheckVideo,
    isChecking,
    timeUntilButton,
    debugInfo: monitoringDebugInfo,
    setGenerationStartTime // Add this to directly set the start time
  } = useVideoMonitoring();

  // Wrapper functions to provide state setters to monitoring hooks
  const startCountdown = (requestId: string, scriptToCheck: string, setVideoResultParam: (result: string) => void, setIsGeneratingParam: (generating: boolean) => void, customStartTime?: number) => {
    baseStartCountdown(requestId, scriptToCheck, setVideoResultParam, setIsGeneratingParam, customStartTime);
  };

  const checkVideoManually = () => {
    if (currentRequestId && script) {
      return baseCheckVideoManually(currentRequestId, script, setVideoResult, setIsGenerating);
    }
    return Promise.resolve(false);
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
  // CHANGED: No auto-recover to prevent blocking the textarea
  useEffect(() => {
    // Clean up any legacy localStorage data
    migrateLegacyData();
    
    // Don't auto-set isGenerating to true just because there's a previous generation
    // This was blocking the textarea. Let the user explicitly recover or cancel.
    if (currentGeneration && currentGeneration.status === 'processing') {
      console.log('🔍 [RECOVERY] Generación previa detectada (no auto-recuperando):', {
        requestId: currentGeneration.request_id,
        startTime: currentGeneration.created_at,
        timeRemaining: timeRemaining
      });
      
      // Only set the script, but don't start generating automatically
      setScript(currentGeneration.script);
      setCurrentRequestId(currentGeneration.request_id);
      // NOTE: isGenerating stays false until user explicitly recovers
    }
  }, [currentGeneration]);

  // Handle video completion and clear config
  useEffect(() => {
    if (videoResult && currentRequestId) {
      handleVideoCompleted(currentRequestId);
      
      // Limpiar configuración después de video exitoso
      if (user) {
        clearVideoConfig(user).then(() => {
          console.log('✅ Configuración limpiada después de video exitoso');
        }).catch(error => {
          console.error('Error limpiando configuración:', error);
        });
      }
    }
  }, [videoResult, currentRequestId, handleVideoCompleted, user]);

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
    
    // Use the proper cancel recovery function that handles cleanup
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

    console.log('Iniciando nuevo proceso de generación de video');
    
    try {
      // Generate unique requestId - UNA SOLA VEZ
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const requestId = `${timestamp}-${random}`;
      setCurrentRequestId(requestId);

      console.log('🔍 DEBUG - Generado requestId único:', {
        requestId: requestId,
        timestamp: timestamp,
        random: random
      });

      // Create database entry IMMEDIATELY 
      const success = await handleStartGeneration(script.trim(), requestId);
      if (!success) {
        throw new Error('No se pudo guardar el estado de generación');
      }

      // Start simplified countdown immediately
      startCountdown(requestId, script.trim(), setVideoResult, setIsGenerating);

      toast({
        title: "Video en procesamiento",
        description: `Procesamiento iniciado. ID: ${requestId.substring(0, 8)}...`
      });

      // Send to webhook in background PASANDO EL MISMO REQUEST ID
      initiateVideoGeneration(
        script,
        user,
        props?.flowState!,
        toast,
        requestId  // ← PASAR EL REQUEST ID AL WEBHOOK
      ).catch(err => {
        console.error('Error enviando al webhook (background):', err);
        // Webhook error doesn't stop the process - video will expire naturally if webhook fails
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

    // Simple check for existing generation without triggering refresh
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
      // Generate unique requestId - UNA SOLA VEZ
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const requestId = `${timestamp}-${random}`;
      setCurrentRequestId(requestId);

      console.log('🔍 DEBUG - handleGenerateVideoWithFiles generado requestId único:', {
        requestId: requestId,
        timestamp: timestamp,
        random: random
      });

      // Decrypt API key
      const decryptedApiKey = atob(flowState!.selectedApiKey!.api_key_encrypted);
      
      // Build payload for webhook with default dimensions for manual style
      const payload = {
        script: script.trim(),
        userId: user?.id || '',
        requestId, // ← USAR EL REQUEST ID GENERADO UNA SOLA VEZ
        timestamp: new Date().toISOString(),
        appMode: 'production',
        ClaveAPI: decryptedApiKey,
        AvatarID: flowState!.selectedAvatar?.avatar_id,
        VoiceID: flowState!.selectedVoice?.voice_id,
        Estilo: flowState!.selectedStyle?.id,
        width: apiVersionCustomization?.width || 1280,
        height: apiVersionCustomization?.height || 720,
        // 🔍 CRÍTICO: Incluir subtitleCustomization completo
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
        // Campo split
        split: flowState!.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
      };

      console.log('🔍 DEBUG - Payload con subtitleCustomization y requestId sincronizado:', {
        requestId,
        hasSubtitleCustomization: !!payload.subtitleCustomization,
        subtitleCustomizationData: payload.subtitleCustomization,
        split: payload.split,
        styleId: payload.Estilo
      });

      // Send directly to webhook with files FIRST, with progress callback
      // Use different webhook based on style
      if (flowState!.selectedStyle?.id === 'style-6') {
        await sendDirectToManualWebhook2(payload, images, videos, onProgress);
      } else {
        await sendDirectToManualWebhook(payload, images, videos, onProgress);
      }
      
      // ONLY if webhook is successful, create database entry and start tracking
      const success = await handleStartGeneration(script.trim(), requestId);
      if (!success) {
        throw new Error('No se pudo guardar el estado de generación');
      }

      // Start countdown and monitoring ONLY after successful webhook call
      startCountdown(requestId, script.trim(), setVideoResult, setIsGenerating);

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

    // Simple check for existing generation without triggering refresh
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
      // Generate unique requestId - UNA SOLA VEZ
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const requestId = `${timestamp}-${random}`;
      setCurrentRequestId(requestId);

      console.log('🔍 DEBUG - handleGenerateVideoWithUrls generado requestId único:', {
        requestId: requestId,
        timestamp: timestamp,
        random: random
      });

      // Decrypt API key
      const decryptedApiKey = atob(flowState!.selectedApiKey!.api_key_encrypted);
      
      // Build payload for webhook with default dimensions for manual style
      const payload = {
        script: script.trim(),
        userId: user?.id || '',
        requestId, // ← USAR EL REQUEST ID GENERADO UNA SOLA VEZ
        timestamp: new Date().toISOString(),
        appMode: 'production',
        ClaveAPI: decryptedApiKey,
        AvatarID: flowState!.selectedAvatar?.avatar_id,
        VoiceID: flowState!.selectedVoice?.voice_id,
        Estilo: flowState!.selectedStyle?.id,
        width: apiVersionCustomization?.width || 1280,
        height: apiVersionCustomization?.height || 720,
        // 🔍 CRÍTICO: Incluir subtitleCustomization completo
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
        // Campo split
        split: flowState!.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
      };

      console.log('🔍 DEBUG - Payload con subtitleCustomization (URLs) y requestId sincronizado:', {
        requestId,
        hasSubtitleCustomization: !!payload.subtitleCustomization,
        subtitleCustomizationData: payload.subtitleCustomization,
        split: payload.split,
        styleId: payload.Estilo
      });

      // Send to webhook with Drive URLs instead of files
      // Use different webhook based on style
      if (flowState!.selectedStyle?.id === 'style-6') {
        await sendDirectToManualWebhook2WithUrls(payload, driveUrls);
      } else {
        await sendDirectToManualWebhookWithUrls(payload, driveUrls);
      }
      
      // ONLY if webhook is successful, create database entry and start tracking
      const success = await handleStartGeneration(script.trim(), requestId);
      if (!success) {
        throw new Error('No se pudo guardar el estado de generación');
      }

      // Start countdown and monitoring ONLY after successful webhook call
      startCountdown(requestId, script.trim(), setVideoResult, setIsGenerating);

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
      // Add the monitoring properties to the state
      canCheckVideo,
      isChecking,
      timeUntilButton,
      debugInfo: `RequestId: ${currentRequestId} | Generating: ${isGenerating} | TimeLeft: ${Math.floor(timeRemaining/60)}min`
    },
    handlers: {
      setScript,
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
