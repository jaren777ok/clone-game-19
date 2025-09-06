
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';
import { useAuth } from '@/hooks/useAuth';
import HeyGenApiKeyManager from '@/components/video/HeyGenApiKeyManager';
import AvatarSelector from '@/components/video/AvatarSelector';
import SecondAvatarSelector from '@/components/video/SecondAvatarSelector';
import VoiceSelector from '@/components/video/VoiceSelector';
import StyleSelector from '@/components/video/StyleSelector';
import NeuroCopyGenerator from '@/components/video/NeuroCopyGenerator';
import SubtitleCustomizer from '@/components/video/SubtitleCustomizer';

const VideoCreationFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    flowState,
    apiKeys,
    loading,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectSecondAvatar,
    selectVoice,
    selectStyle,
    selectSubtitleCustomization,
    selectManualCustomization,
    selectGeneratedScript,
    goToStep,
    resetFlow
  } = useVideoCreationFlow();

  const handleBack = () => {
    switch (flowState.step) {
      case 'neurocopy':
        goToStep('api-key');
        break;
      case 'style':
        goToStep('neurocopy');
        break;
      case 'avatar':
        goToStep('style');
        break;
      case 'voice':
        goToStep('avatar');
        break;
      case 'multi-avatar':
        // Para Multi-Avatar, regresar a voice selection
        console.log('🔄 Multi-Avatar: Regresando a voice desde multi-avatar');
        goToStep('voice');
        break;
      case 'subtitle-customization':
        // Si es Multi-Avatar y tiene segundo avatar, regresar a multi-avatar
        if (flowState.selectedStyle?.id === 'style-7' && flowState.selectedSecondAvatar) {
          console.log('🔄 Multi-Avatar: Regresando a multi-avatar desde subtitle-customization');
          goToStep('multi-avatar');
        } else {
          // Para otros estilos, regresar a voice
          goToStep('voice');
        }
        break;
      case 'generator':
        goToStep('subtitle-customization');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleProceedToGenerator = () => {
    // Validar que tenemos todas las selecciones necesarias incluyendo el script
    const isValidForMultiAvatar = flowState.selectedStyle?.id === 'style-7' 
      ? !!(flowState.selectedApiKey && flowState.selectedAvatar && flowState.selectedSecondAvatar && flowState.selectedVoice && flowState.selectedStyle && flowState.generatedScript)
      : !!(flowState.selectedApiKey && flowState.selectedAvatar && flowState.selectedVoice && flowState.selectedStyle && flowState.generatedScript);

    if (isValidForMultiAvatar) {
      console.log('✅ Navegando al generador con configuración completa');
      // Navegar directamente pasando el estado via location
      navigate('/crear-video-generator', { 
        state: flowState,
        replace: false 
      });
    } else {
      console.warn('⚠️ Configuración incompleta para navegar al generador');
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
            Has completado la configuración del video incluyendo la generación del guión. Ahora puedes proceder al generador.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleProceedToGenerator}
              className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Ir al Generador de Videos
            </button>
            <button
              onClick={() => goToStep('subtitle-customization')}
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

    case 'neurocopy':
      if (!flowState.selectedApiKey) {
        goToStep('api-key');
        return null;
      }
      return (
        <NeuroCopyGenerator
          onBack={handleBack}
          onUseScript={selectGeneratedScript}
        />
      );

    case 'style':
      if (!flowState.generatedScript) {
        goToStep('neurocopy');
        return null;
      }
      return (
        <StyleSelector
          onSelectStyle={selectStyle}
          onBack={handleBack}
        />
      );

    case 'avatar':
      if (!flowState.selectedStyle) {
        goToStep('style');
        return null;
      }
      return (
        <AvatarSelector
          selectedApiKey={flowState.selectedApiKey}
          onSelectAvatar={selectAvatar}
          onBack={handleBack}
        />
      );

    case 'voice':
      if (!flowState.selectedAvatar || !flowState.selectedApiKey) {
        goToStep('avatar');
        return null;
      }
      return (
        <VoiceSelector
          selectedApiKey={flowState.selectedApiKey}
          onSelectVoice={selectVoice}
          onBack={handleBack}
        />
      );

    case 'multi-avatar':
      return (
        <SecondAvatarSelector
          selectedApiKey={flowState.selectedApiKey}
          selectedFirstAvatar={flowState.selectedAvatar!}
          onSelectSecondAvatar={selectSecondAvatar}
          onBack={handleBack}
        />
      );

    case 'subtitle-customization':
      if (!flowState.selectedVoice) {
        goToStep('voice');
        return null;
      }
      return (
        <SubtitleCustomizer
          onSelectCustomization={selectSubtitleCustomization}
          onBack={handleBack}
        />
      );

    default:
      return null;
  }
};

export default VideoCreationFlow;
