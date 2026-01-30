
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FlowState, SubtitleCustomization } from '@/types/videoFlow';
import { saveVideoConfigImmediate } from '@/lib/videoConfigDatabase';
import HeyGenApiKeyManager from '@/components/video/HeyGenApiKeyManager';
import AvatarSelector from '@/components/video/AvatarSelector';
import SecondAvatarSelector from '@/components/video/SecondAvatarSelector';
import VoiceSelector from '@/components/video/VoiceSelector';
import StyleSelector from '@/components/video/StyleSelector';
import NeuroCopyGenerator from '@/components/video/NeuroCopyGenerator';
import SubtitleCustomizer from '@/components/video/SubtitleCustomizer';
import ConfigurationComplete from '@/components/video/ConfigurationComplete';

const VideoCreationFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [aiApiKeys, setAiApiKeys] = useState({ openai_api_key: '', gemini_api_key: '' });
  
  // Detectar estado de navegación directa (desde el generador final)
  const navigationState = location.state as FlowState | undefined;
  const [overrideState, setOverrideState] = useState<FlowState | null>(null);
  
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

  // Si viene con estado de navegación válido, aplicarlo Y guardarlo en Supabase
  useEffect(() => {
    const syncNavigationState = async () => {
      if (navigationState && navigationState.selectedApiKey && navigationState.selectedStyle && 
          navigationState.selectedAvatar && navigationState.step) {
        console.log('✅ Usando estado de navegación directa:', {
          step: navigationState.step,
          hasApiKey: !!navigationState.selectedApiKey,
          hasStyle: !!navigationState.selectedStyle,
          hasAvatar: !!navigationState.selectedAvatar,
          hasVoice: !!navigationState.selectedVoice
        });
        setOverrideState(navigationState);
        
        // Guardar el estado en Supabase para persistencia
        if (user) {
          try {
            await saveVideoConfigImmediate(user, navigationState);
            console.log('💾 Estado de navegación sincronizado con Supabase');
          } catch (error) {
            console.error('Error sincronizando estado:', error);
          }
        }
      }
    };
    
    syncNavigationState();
  }, []);

  // Estado activo: priorizar overrideState si existe
  const activeFlowState = overrideState || flowState;

  // Load AI API keys for passing to StyleSelector -> CustomizeCardsModal
  useEffect(() => {
    const loadAiApiKeys = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_ai_api_keys')
        .select('openai_api_key, gemini_api_key')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setAiApiKeys({
          openai_api_key: data.openai_api_key || '',
          gemini_api_key: data.gemini_api_key || ''
        });
      }
    };
    
    loadAiApiKeys();
  }, [user?.id]);

  // Wrapper para handleBack que respeta el overrideState
  const handleBack = () => {
    const baseState = overrideState || flowState;
    const currentStep = baseState.step;
    
    switch (currentStep) {
      case 'neurocopy':
        if (overrideState) {
          setOverrideState({ ...baseState, step: 'api-key' });
        } else {
          goToStep('api-key');
        }
        break;
      case 'style':
        if (overrideState) {
          setOverrideState({ ...baseState, step: 'neurocopy' });
        } else {
          goToStep('neurocopy');
        }
        break;
      case 'avatar':
        if (overrideState) {
          setOverrideState({ ...baseState, step: 'style' });
        } else {
          goToStep('style');
        }
        break;
      case 'voice':
        if (overrideState) {
          setOverrideState({ ...baseState, step: 'avatar' });
        } else {
          goToStep('avatar');
        }
        break;
      case 'multi-avatar':
        console.log('🔄 Multi-Avatar: Regresando a voice desde multi-avatar');
        if (overrideState) {
          setOverrideState({ ...baseState, step: 'voice' });
        } else {
          goToStep('voice');
        }
        break;
      case 'subtitle-customization':
        // Si es Multi-Avatar y tiene segundo avatar, regresar a multi-avatar
        if (baseState.selectedStyle?.id === 'style-7' && baseState.selectedSecondAvatar) {
          console.log('🔄 Multi-Avatar: Regresando a multi-avatar desde subtitle-customization');
          if (overrideState) {
            setOverrideState({ ...baseState, step: 'multi-avatar' });
          } else {
            goToStep('multi-avatar');
          }
        } else {
          // Para otros estilos, regresar a voice
          if (overrideState) {
            setOverrideState({ ...baseState, step: 'voice' });
          } else {
            goToStep('voice');
          }
        }
        break;
      case 'generator':
        if (overrideState) {
          setOverrideState({ ...baseState, step: 'subtitle-customization' });
        } else {
          goToStep('subtitle-customization');
        }
        break;
      default:
        navigate('/');
        break;
    }
  };

  // Wrapper para selectSubtitleCustomization - ahora va a confirmación en lugar de directo al generador
  const handleSelectSubtitleCustomization = async (subtitleCustomization: SubtitleCustomization) => {
    const baseState = overrideState || flowState;
    const newState: FlowState = {
      ...baseState,
      subtitleCustomization,
      step: 'confirmation'
    };
    
    console.log('📝 Guardando subtítulos y mostrando confirmación:', {
      hasApiKey: !!newState.selectedApiKey,
      hasStyle: !!newState.selectedStyle,
      hasAvatar: !!newState.selectedAvatar,
      hasVoice: !!newState.selectedVoice
    });
    
    // Guardar inmediatamente en Supabase
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newState);
        console.log('💾 Estado completo guardado en Supabase');
      } catch (error) {
        console.error('Error guardando estado:', error);
      }
    }
    
    // Mostrar pantalla de confirmación
    setOverrideState(newState);
  };

  // Handler para continuar desde confirmación al generador
  const handleContinueToGenerator = () => {
    const baseState = overrideState || flowState;
    const finalState: FlowState = {
      ...baseState,
      step: 'generator'
    };
    
    console.log('🚀 Navegando al generador desde confirmación');
    navigate('/crear-video-generator', { 
      state: finalState,
      replace: false 
    });
  };

  // Handler para revisar configuración desde confirmación
  const handleReviewConfiguration = () => {
    const baseState = overrideState || flowState;
    const reviewState: FlowState = {
      ...baseState,
      step: 'subtitle-customization'
    };
    
    console.log('🔄 Regresando a revisar configuración');
    setOverrideState(reviewState);
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
  // Si hay overrideState, no mostrar loading
  if (!overrideState && (loading || flowState.step === 'loading')) {
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
  if (activeFlowState.step === 'generator') {
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

  // Renderizar el componente apropiado según el paso activo (overrideState tiene prioridad)
  switch (activeFlowState.step) {
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
      if (!activeFlowState.selectedApiKey) {
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
      if (!activeFlowState.generatedScript) {
        goToStep('neurocopy');
        return null;
      }
      return (
        <StyleSelector
          onSelectStyle={selectStyle}
          onBack={handleBack}
          generatedScript={activeFlowState.generatedScript || ''}
          aiApiKeys={aiApiKeys}
          selectedApiKey={activeFlowState.selectedApiKey}
        />
      );

    case 'avatar':
      if (!activeFlowState.selectedStyle) {
        goToStep('style');
        return null;
      }
      return (
        <AvatarSelector
          selectedApiKey={activeFlowState.selectedApiKey}
          onSelectAvatar={selectAvatar}
          onBack={handleBack}
        />
      );

    case 'voice':
      if (!activeFlowState.selectedAvatar || !activeFlowState.selectedApiKey) {
        goToStep('avatar');
        return null;
      }
      return (
        <VoiceSelector
          selectedApiKey={activeFlowState.selectedApiKey}
          onSelectVoice={selectVoice}
          onBack={handleBack}
        />
      );

    case 'multi-avatar':
      return (
        <SecondAvatarSelector
          selectedApiKey={activeFlowState.selectedApiKey}
          selectedFirstAvatar={activeFlowState.selectedAvatar!}
          onSelectSecondAvatar={selectSecondAvatar}
          onBack={handleBack}
        />
      );

    case 'subtitle-customization':
      // Si viene de navegación directa (overrideState), no validar
      if (!overrideState && !activeFlowState.selectedVoice) {
        goToStep('voice');
        return null;
      }
      return (
        <SubtitleCustomizer
          onSelectCustomization={handleSelectSubtitleCustomization}
          onBack={handleBack}
        />
      );

    case 'confirmation':
      return (
        <ConfigurationComplete
          flowState={activeFlowState}
          onContinue={handleContinueToGenerator}
          onReview={handleReviewConfiguration}
        />
      );

    default:
      return null;
  }
};

export default VideoCreationFlow;
