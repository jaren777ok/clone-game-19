
import React, { useEffect } from 'react';
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

  useEffect(() => {
    // Si llegamos al paso del generador, redirigir a la página del generador actual
    if (flowState.step === 'generator') {
      navigate('/crear-video-generator');
    }
  }, [flowState.step, navigate]);

  const handleBack = () => {
    if (flowState.step === 'api-key') {
      navigate('/dashboard');
    } else if (flowState.step === 'avatar') {
      goToStep('api-key');
    } else if (flowState.step === 'style') {
      goToStep('avatar');
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
