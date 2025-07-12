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

const VideoGeneratorFinal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { flowState: currentFlowState, goToStep } = useVideoCreationFlow();
  const [effectiveFlowState, setEffectiveFlowState] = useState<FlowState | null>(null);
  const { state, handlers } = useVideoGenerator({ flowState: effectiveFlowState });

  // Determinar el estado efectivo del flujo
  useEffect(() => {
    // Prioridad 1: Estado pasado via navegación
    const navigationState = location.state as FlowState | undefined;
    
    if (navigationState && navigationState.selectedApiKey && navigationState.selectedAvatar && 
        navigationState.selectedVoice && navigationState.selectedStyle) {
      console.log('✅ Usando estado de navegación:', {
        step: navigationState.step,
        hasScript: !!navigationState.generatedScript
      });
      setEffectiveFlowState(navigationState);
      return;
    }

    // Prioridad 2: Estado actual del hook
    if (currentFlowState && currentFlowState.selectedApiKey && currentFlowState.selectedAvatar && 
        currentFlowState.selectedVoice && currentFlowState.selectedStyle) {
      console.log('✅ Usando estado actual del hook:', {
        step: currentFlowState.step,
        hasScript: !!currentFlowState.generatedScript
      });
      setEffectiveFlowState(currentFlowState);
      return;
    }

    // Si no hay configuración válida, redirigir al flujo
    console.log('❌ No hay configuración válida, redirigiendo al flujo');
    navigate('/crear-video');
  }, [location.state, currentFlowState, navigate]);

  // Pre-fill script with generated script from flow
  useEffect(() => {
    if (effectiveFlowState?.generatedScript && !state.script) {
      handlers.setScript(effectiveFlowState.generatedScript);
    }
  }, [effectiveFlowState?.generatedScript, state.script, handlers]);

  const handleBack = () => {
    goToStep('neurocopy');
    navigate('/crear-video');
  };

  // Limpiar configuración cuando se genera exitosamente un video
  const handleVideoGenerated = async () => {
    if (user) {
      console.log('🎉 Video generado exitosamente, limpiando configuración');
      await clearFlowState(user);
    }
  };

  // Agregar el efecto para limpiar configuración cuando el video esté listo
  useEffect(() => {
    if (state.videoResult) {
      handleVideoGenerated();
    }
  }, [state.videoResult]);

  // Si no tenemos configuración efectiva aún, mostrar loading
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

  if (state.isGenerating) {
    return (
      <VideoProcessingState 
        timeRemaining={state.timeRemaining}
        totalTime={state.totalTime}
        isRecovering={state.isRecovering}
      />
    );
  }

  if (state.videoResult) {
    return (
      <VideoResult 
        videoUrl={state.videoResult} 
        onNewVideo={handlers.handleNewVideo}
      />
    );
  }

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
          {/* Mostrar información del flujo seleccionado */}
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
          />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VideoGeneratorFinal;
