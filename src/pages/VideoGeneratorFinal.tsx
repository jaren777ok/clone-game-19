
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VideoGeneratorHeader from '@/components/video/VideoGeneratorHeader';
import VideoProcessingState from '@/components/video/VideoProcessingState';
import VideoResult from '@/components/video/VideoResult';
import { useVideoGenerator } from '@/hooks/useVideoGenerator';
import RecoveryNotification from '@/components/video/RecoveryNotification';
import ScriptForm from '@/components/video/ScriptForm';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';
import { useAuth } from '@/hooks/useAuth';
import { FlowState } from '@/types/videoFlow';
import { clearFlowState } from '@/utils/videoFlowUtils';
import { hasReachedPollingTime } from '@/lib/countdownUtils';
import { useVideoVerification } from '@/hooks/useVideoVerification';

const VideoGeneratorFinal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { flowState: currentFlowState, goToStep } = useVideoCreationFlow();
  const [effectiveFlowState, setEffectiveFlowState] = useState<FlowState | null>(null);
  const { state, handlers } = useVideoGenerator({ flowState: effectiveFlowState });
  const { forceVideoCheck } = useVideoVerification();

  // Determine effective flow state
  useEffect(() => {
    const navigationState = location.state as FlowState | undefined;
    
    console.log('🐛 DEBUG VideoGeneratorFinal - Navigation state:', {
      navigationState: navigationState,
      selectedStyle: navigationState?.selectedStyle,
      selectedStyleId: navigationState?.selectedStyle?.id
    });
    
    if (navigationState && navigationState.selectedApiKey && navigationState.selectedAvatar && 
        navigationState.selectedVoice && navigationState.selectedStyle) {
      console.log('✅ Usando estado de navegación:', {
        step: navigationState.step,
        hasScript: !!navigationState.generatedScript,
        selectedStyleId: navigationState.selectedStyle.id
      });
      setEffectiveFlowState(navigationState);
      return;
    }

    console.log('🐛 DEBUG VideoGeneratorFinal - Current flow state:', {
      currentFlowState: currentFlowState,
      selectedStyle: currentFlowState?.selectedStyle,
      selectedStyleId: currentFlowState?.selectedStyle?.id
    });
    
    if (currentFlowState && currentFlowState.selectedApiKey && currentFlowState.selectedAvatar && 
        currentFlowState.selectedVoice && currentFlowState.selectedStyle) {
      console.log('✅ Usando estado actual del hook:', {
        step: currentFlowState.step,
        hasScript: !!currentFlowState.generatedScript,
        selectedStyleId: currentFlowState.selectedStyle.id
      });
      setEffectiveFlowState(currentFlowState);
      return;
    }

    console.log('❌ No hay configuración válida, redirigiendo al flujo');
    navigate('/crear-video');
  }, [location.state, currentFlowState, navigate]);

  // Pre-fill script with generated script from flow
  useEffect(() => {
    if (effectiveFlowState?.generatedScript && !state.script) {
      handlers.setScript(effectiveFlowState.generatedScript);
    }
  }, [effectiveFlowState?.generatedScript, state.script, handlers]);

  // CRITICAL: Real-time automatic video detection while generating
  useEffect(() => {
    let realTimeCheckInterval: NodeJS.Timeout | null = null;
    
    if (state.isGenerating && !state.videoResult) {
      console.log('🚨 INICIANDO VERIFICACIÓN AUTOMÁTICA EN TIEMPO REAL - Cada 30 segundos');
      
      const realTimeCheck = async () => {
        if (!state.isGenerating || state.videoResult) return;
        
        console.log('🔍 Verificación automática en tiempo real ejecutándose...');
        const success = await forceVideoCheck(handlers.setVideoResult, handlers.setIsGenerating);
        
        if (success) {
          console.log('🎉 VIDEO ENCONTRADO CON VERIFICACIÓN AUTOMÁTICA EN TIEMPO REAL');
          if (realTimeCheckInterval) {
            clearInterval(realTimeCheckInterval);
            realTimeCheckInterval = null;
          }
        }
      };
      
      // Start checking immediately and then every 30 seconds
      realTimeCheck();
      realTimeCheckInterval = setInterval(realTimeCheck, 30 * 1000);
    }
    
    return () => {
      if (realTimeCheckInterval) {
        clearInterval(realTimeCheckInterval);
      }
    };
  }, [state.isGenerating, state.videoResult, forceVideoCheck, handlers]);

  const handleBack = () => {
    goToStep('neurocopy');
    navigate('/crear-video');
  };

  const handleVideoGenerated = async () => {
    if (user) {
      console.log('🎉 Video generado exitosamente, limpiando configuración');
      await clearFlowState(user);
    }
  };

  // CRITICAL EFFECT: Clean configuration when video is ready
  useEffect(() => {
    if (state.videoResult) {
      console.log('🎉 VideoGeneratorFinal - Video completado detectado AUTOMÁTICAMENTE:', {
        videoUrl: state.videoResult,
        isGenerating: state.isGenerating,
        timestamp: new Date().toISOString()
      });
      handleVideoGenerated();
    }
  }, [state.videoResult]);

  // Enhanced state logging
  console.log('🔍 VideoGeneratorFinal - Estado CRÍTICO MEJORADO:', {
    hasVideoResult: !!state.videoResult,
    videoResult: state.videoResult,
    isGenerating: state.isGenerating,
    timeRemaining: state.timeRemaining,
    effectiveFlowState: effectiveFlowState,
    selectedStyle: effectiveFlowState?.selectedStyle,
    selectedStyleId: effectiveFlowState?.selectedStyle?.id,
    hasHandleGenerateVideoWithFiles: !!handlers.handleGenerateVideoWithFiles,
    renderDecision: state.videoResult ? 'SUCCESS_SCREEN_AUTO' : (state.isGenerating ? 'PROCESSING_SCREEN' : 'SCRIPT_SCREEN')
  });

  // If no effective configuration yet, show loading
  if (!effectiveFlowState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-background rounded"></div>
          </div>
          <p className="text-muted-foreground">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  // CRITICAL PRIORITY: If videoResult exists, show success screen IMMEDIATELY AND AUTOMATICALLY
  if (state.videoResult) {
    console.log('🎉 VideoGeneratorFinal - MOSTRANDO PANTALLA DE ÉXITO AUTOMÁTICAMENTE con video:', state.videoResult);
    return (
      <VideoResult 
        videoUrl={state.videoResult} 
        onNewVideo={handlers.handleNewVideo}
      />
    );
  }

  // Secondary check: If generating, show processing screen
  if (state.isGenerating) {
    console.log('🔄 VideoGeneratorFinal - Mostrando pantalla de procesamiento con verificación automática activa');
    
    // Determine if we should show manual check button (during intensive verification phase)
    const startTime = Date.now() - (state.totalTime - state.timeRemaining) * 1000;
    const showManualCheck = hasReachedPollingTime(startTime);
    
    return (
      <VideoProcessingState 
        timeRemaining={state.timeRemaining}
        totalTime={state.totalTime}
        isRecovering={state.isRecovering}
        onManualCheck={showManualCheck ? handlers.checkVideoManually : undefined}
      />
    );
  }

  // Default: Show script screen
  console.log('📝 VideoGeneratorFinal - Mostrando pantalla de script');
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <VideoGeneratorHeader />

        {state.showRecoveryOption && (
          <RecoveryNotification 
            onRecover={handlers.handleRecoverGeneration}
            onCancel={handlers.handleCancelRecovery}
          />
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 sm:p-6 mb-6 sm:mb-8 cyber-border mx-4 sm:mx-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-lg font-semibold">Configuración seleccionada:</h2>
              <div className="flex items-center text-xs sm:text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="hidden sm:inline">Configuración completa</span>
                <span className="sm:hidden">Completa</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground">Clave API:</p>
                <p className="font-medium truncate">{effectiveFlowState.selectedApiKey?.api_key_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avatar:</p>
                <p className="font-medium truncate">{effectiveFlowState.selectedAvatar?.avatar_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Voz:</p>
                <p className="font-medium truncate">{effectiveFlowState.selectedVoice?.voice_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estilo:</p>
                <p className="font-medium truncate">{effectiveFlowState.selectedStyle?.name}</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              <span className="sm:hidden">CloneGame - Videos IA</span>
              <span className="hidden sm:inline">CloneGame - Generador de Videos IA</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg">
              Tu guión ha sido generado con NeuroCopy GPT. Puedes editarlo si deseas antes de crear tu video.
            </p>
          </div>

          <ScriptForm 
            script={state.script}
            setScript={handlers.setScript}
            onSubmit={handlers.handleGenerateVideo}
            onCancel={handlers.handleCancelGeneration}
            isGenerating={state.isGenerating}
            error={state.error}
            timeRemaining={state.timeRemaining}
            currentRequestId={state.currentRequestId}
            flowState={effectiveFlowState}
            onGenerateWithFiles={handlers.handleGenerateVideoWithFiles}
            onGenerateWithUrls={handlers.handleGenerateVideoWithUrls}
          />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VideoGeneratorFinal;
