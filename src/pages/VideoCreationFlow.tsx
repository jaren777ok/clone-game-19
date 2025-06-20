
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';
import HeyGenApiKeyManager from '@/components/video/HeyGenApiKeyManager';
import AvatarSelector from '@/components/video/AvatarSelector';
import StyleSelector from '@/components/video/StyleSelector';

const VideoCreationFlow = () => {
  const navigate = useNavigate();
  const {
    flowState,
    apiKeys,
    loading,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectStyle,
    goToStep,
    resetFlow
  } = useVideoCreationFlow();

  const handleBack = () => {
    if (flowState.step === 'api-key') {
      navigate('/dashboard');
    } else if (flowState.step === 'avatar') {
      goToStep('api-key');
    } else if (flowState.step === 'style') {
      goToStep('avatar');
    }
  };

  const handleProceedToGenerator = () => {
    // Solo navegar si tenemos todas las selecciones necesarias
    if (flowState.selectedApiKey && flowState.selectedAvatar && flowState.selectedStyle) {
      navigate('/crear-video-generator');
    }
  };

  // Mostrar pantalla de carga mientras se determina el estado inicial
  if (loading || flowState.step === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-background rounded"></div>
          </div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Si el flujo está completo pero aún estamos aquí, mostrar botón para ir al generador
  if (flowState.step === 'generator') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-6">
            <div className="w-8 h-8 bg-background rounded"></div>
          </div>
          <h2 className="text-2xl font-bold mb-4">¡Configuración Completa!</h2>
          <p className="text-muted-foreground mb-6">
            Has completado la configuración del video. Ahora puedes proceder al generador.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleProceedToGenerator}
              className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Ir al Generador de Videos
            </button>
            <button
              onClick={() => goToStep('style')}
              className="w-full border border-border text-muted-foreground px-6 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              Revisar Configuración
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar el componente apropiado según el paso actual
  switch (flowState.step) {
    case 'api-key':
      return (
        <HeyGenApiKeyManager
          apiKeys={apiKeys}
          onSelectApiKey={selectApiKey}
          onRefreshKeys={loadApiKeys}
          onBack={handleBack}
        />
      );

    case 'avatar':
      if (!flowState.selectedApiKey) {
        goToStep('api-key');
        return null;
      }
      return (
        <AvatarSelector
          selectedApiKey={flowState.selectedApiKey}
          onSelectAvatar={selectAvatar}
          onBack={handleBack}
        />
      );

    case 'style':
      if (!flowState.selectedAvatar) {
        goToStep('avatar');
        return null;
      }
      return (
        <StyleSelector
          onSelectStyle={selectStyle}
          onBack={handleBack}
        />
      );

    default:
      return null;
  }
};

export default VideoCreationFlow;
