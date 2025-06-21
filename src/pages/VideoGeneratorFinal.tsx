
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VideoProcessingState from '@/components/video/VideoProcessingState';
import VideoResult from '@/components/video/VideoResult';
import { useVideoGenerator } from '@/hooks/useVideoGenerator';
import RecoveryNotification from '@/components/video/RecoveryNotification';
import ScriptForm from '@/components/video/ScriptForm';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';

const VideoGeneratorFinal = () => {
  const navigate = useNavigate();
  const { flowState, goToStep } = useVideoCreationFlow();
  const { state, handlers } = useVideoGenerator({ flowState });
  const [hasCheckedFlow, setHasCheckedFlow] = useState(false);

  // Pre-fill script with generated script from flow
  useEffect(() => {
    if (flowState.generatedScript && !state.script) {
      handlers.setScript(flowState.generatedScript);
    }
  }, [flowState.generatedScript, state.script, handlers]);

  useEffect(() => {
    // Solo verificar una vez para evitar bucles
    if (!hasCheckedFlow) {
      const timeoutId = setTimeout(() => {
        if (!flowState.selectedApiKey || !flowState.selectedAvatar || !flowState.selectedVoice || !flowState.selectedStyle || !flowState.generatedScript) {
          console.log('Datos del flujo incompletos, redirigiendo...');
          navigate('/crear-video');
        }
        setHasCheckedFlow(true);
      }, 500); // Delay pequeño para permitir que se cargue el estado

      return () => clearTimeout(timeoutId);
    }
  }, [flowState, navigate, hasCheckedFlow]);

  const handleBack = () => {
    goToStep('neurocopy');
    navigate('/crear-video');
  };

  // Si aún no hemos verificado el flujo, mostrar loading
  if (!hasCheckedFlow) {
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
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modificar guión
          </Button>
        </div>

        {state.showRecoveryOption && (
          <RecoveryNotification 
            onRecover={handlers.handleRecoverGeneration}
            onCancel={handlers.handleCancelRecovery}
          />
        )}

        <div className="max-w-4xl mx-auto">
          {/* Mostrar información del flujo seleccionado */}
          {flowState.selectedApiKey && flowState.selectedAvatar && flowState.selectedVoice && flowState.selectedStyle && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 mb-8 cyber-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Configuración seleccionada:</h2>
                <div className="flex items-center text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Configuración completa
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Clave API:</p>
                  <p className="font-medium">{flowState.selectedApiKey.api_key_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avatar:</p>
                  <p className="font-medium">{flowState.selectedAvatar.avatar_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Voz:</p>
                  <p className="font-medium">{flowState.selectedVoice.voice_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estilo:</p>
                  <p className="font-medium">{flowState.selectedStyle.name}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              CloneGame - Generador de Videos IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Tu guión ha sido generado con NeuroCopy GPT. Puedes editarlo si deseas antes de crear tu video.
            </p>
          </div>

          <ScriptForm 
            script={state.script}
            setScript={handlers.setScript}
            onSubmit={handlers.handleGenerateVideo}
            isGenerating={state.isGenerating}
            error={state.error}
          />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VideoGeneratorFinal;
