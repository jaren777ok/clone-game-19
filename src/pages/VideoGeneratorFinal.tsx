
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VideoProcessingState from '@/components/video/VideoProcessingState';
import VideoResult from '@/components/video/VideoResult';
import { useVideoGenerator } from '@/hooks/useVideoGenerator';
import RecoveryNotification from '@/components/video/RecoveryNotification';
import ScriptForm from '@/components/video/ScriptForm';
import TipsSection from '@/components/video/TipsSection';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';

const VideoGeneratorFinal = () => {
  const navigate = useNavigate();
  const { state, handlers } = useVideoGenerator();
  const { flowState, goToStep } = useVideoCreationFlow();
  const [hasCheckedFlow, setHasCheckedFlow] = useState(false);

  useEffect(() => {
    // Solo verificar una vez para evitar bucles
    if (!hasCheckedFlow) {
      const timeoutId = setTimeout(() => {
        if (!flowState.selectedApiKey || !flowState.selectedAvatar || !flowState.selectedStyle) {
          console.log('Datos del flujo incompletos, redirigiendo...');
          navigate('/crear-video');
        }
        setHasCheckedFlow(true);
      }, 500); // Delay pequeño para permitir que se cargue el estado

      return () => clearTimeout(timeoutId);
    }
  }, [flowState, navigate, hasCheckedFlow]);

  const handleBack = () => {
    goToStep('style');
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
            Cambiar estilo
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
          {flowState.selectedApiKey && flowState.selectedAvatar && flowState.selectedStyle && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Configuración seleccionada:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Clave API:</p>
                  <p className="font-medium">{flowState.selectedApiKey.api_key_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avatar:</p>
                  <p className="font-medium">{flowState.selectedAvatar.avatar_name}</p>
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
              Generador de Videos IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Escribe tu guión y genera tu video con el avatar y estilo seleccionados
            </p>
          </div>

          <ScriptForm 
            script={state.script}
            setScript={handlers.setScript}
            onSubmit={handlers.handleGenerateVideo}
            isGenerating={state.isGenerating}
            error={state.error}
          />

          <TipsSection />
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VideoGeneratorFinal;
