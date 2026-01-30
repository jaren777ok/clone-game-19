import { useState, useEffect, useCallback } from 'react';
import { FlowState, HeyGenApiKey, Avatar, Voice, VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization, SubtitleCustomization } from '@/types/videoFlow';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useAuth } from '@/hooks/useAuth';
import { 
  determineInitialStep, 
  loadSavedFlowState, 
  saveFlowState, 
  clearFlowState 
} from '@/utils/videoFlowUtils';
import { saveVideoConfigImmediate } from '@/lib/videoConfigDatabase';
// Removed localStorage dependency - now using Supabase for file storage

export const useVideoCreationFlow = () => {
  const { user } = useAuth();
  const { apiKeys, loading: apiKeysLoading, loadApiKeys } = useApiKeys();
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'loading',
    selectedApiKey: null,
    selectedAvatar: null,
    selectedSecondAvatar: null,
    selectedVoice: null,
    selectedStyle: null,
    subtitleCustomization: null,
    generatedScript: null,
    cardCustomization: null,
    presenterCustomization: null,
    apiVersionCustomization: null,
    manualCustomization: null
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize flow state once
  useEffect(() => {
    if (isInitialized || !user) return;

    const initializeFlow = async () => {
      try {
        console.log('🚀 Inicializando flujo de creación de video para usuario:', user.id);
        
        const keys = await loadApiKeys();
        const savedState = await loadSavedFlowState(user);
        const initialState = determineInitialStep(savedState, keys);
        
        console.log('📋 Estado inicial determinado:', {
          step: initialState.step,
          hasApiKey: !!initialState.selectedApiKey,
          hasAvatar: !!initialState.selectedAvatar,
          hasSecondAvatar: !!initialState.selectedSecondAvatar,
          hasVoice: !!initialState.selectedVoice,
          hasStyle: !!initialState.selectedStyle,
          hasScript: !!initialState.generatedScript
        });
        
        setFlowState(initialState);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing flow:', error);
        setFlowState(prev => ({ ...prev, step: 'api-key' }));
        setIsInitialized(true);
      }
    };

    initializeFlow();
  }, [isInitialized, user, loadApiKeys]);

  // Save state to Supabase when it changes (with debouncing)
  useEffect(() => {
    if (!isInitialized || !user || flowState.step === 'loading') return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveFlowState(user, flowState);
      } catch (error) {
        console.error('Error saving flow state:', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [flowState, isInitialized, user]);

  // Navigation functions
  const selectApiKey = useCallback(async (apiKey: HeyGenApiKey) => {
    console.log('🔑 Seleccionando API Key:', apiKey.api_key_name);
    const newFlowState = {
      ...flowState,
      selectedApiKey: apiKey,
      step: 'neurocopy' as const,
      selectedAvatar: null,
      selectedSecondAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
      subtitleCustomization: null,
      generatedScript: null,
      cardCustomization: null,
      presenterCustomization: null,
      apiVersionCustomization: null,
      manualCustomization: null
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato para cambios críticos
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newFlowState);
      } catch (error) {
        console.error('Error guardando API Key inmediatamente:', error);
      }
    }
  }, [flowState, user]);

  const selectAvatar = useCallback(async (avatar: Avatar) => {
    console.log('👤 Seleccionando Avatar:', avatar.avatar_name);
    const newFlowState = {
      ...flowState,
      selectedAvatar: avatar,
      step: 'voice' as const
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato en Supabase
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newFlowState);
        console.log('💾 Avatar guardado en Supabase');
      } catch (error) {
        console.error('Error guardando avatar:', error);
      }
    }
  }, [flowState, user]);

  const selectSecondAvatar = useCallback(async (avatar: Avatar) => {
    console.log('👤 Seleccionando Segundo Avatar:', avatar.avatar_name);
    console.log('🔄 Multi-Avatar: Navegando directamente a subtitle-customization');
    const newFlowState = {
      ...flowState,
      selectedSecondAvatar: avatar,
      step: 'subtitle-customization' as const
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato en Supabase
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newFlowState);
        console.log('💾 Segundo avatar guardado en Supabase');
      } catch (error) {
        console.error('Error guardando segundo avatar:', error);
      }
    }
  }, [flowState, user]);

  const selectVoice = useCallback(async (voice: Voice) => {
    console.log('🎤 Seleccionando Voz:', voice.voice_name);
    
    let nextStep: FlowState['step'];
    
    if (flowState.selectedStyle?.id === 'style-7') {
      console.log('🔄 Multi-Avatar detectado: navegando a multi-avatar');
      nextStep = 'multi-avatar';
    } else {
      console.log('📝 Navegando a personalización de subtítulos');
      nextStep = 'subtitle-customization';
    }
    
    const newFlowState = {
      ...flowState,
      selectedVoice: voice,
      step: nextStep
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato en Supabase
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newFlowState);
        console.log('💾 Voz guardada en Supabase');
      } catch (error) {
        console.error('Error guardando voz:', error);
      }
    }
  }, [flowState, user]);

  const selectStyle = useCallback(async (style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization, apiVersionCustomization?: ApiVersionCustomization, manualCustomization?: ManualCustomization) => {
    console.log('🎨 Seleccionando Estilo:', style.name);
    console.log('📝 Navegando a selección de avatar para estilo:', style.name);
    
    const newFlowState = {
      ...flowState,
      selectedStyle: style,
      cardCustomization: cardCustomization || null,
      presenterCustomization: presenterCustomization || null,
      apiVersionCustomization: apiVersionCustomization || null,
      manualCustomization: manualCustomization || null,
      step: 'avatar' as const
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato en Supabase
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newFlowState);
        console.log('💾 Estilo guardado en Supabase');
      } catch (error) {
        console.error('Error guardando estilo:', error);
      }
    }
  }, [flowState, user]);

  const selectSubtitleCustomization = useCallback(async (subtitleCustomization: SubtitleCustomization) => {
    console.log('📝 Seleccionando personalización de subtítulos:', subtitleCustomization);
    
    const newFlowState = {
      ...flowState,
      subtitleCustomization,
      step: 'generator' as const
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato en Supabase
    if (user) {
      try {
        await saveVideoConfigImmediate(user, newFlowState);
        console.log('💾 Subtítulos guardados en Supabase');
      } catch (error) {
        console.error('Error guardando subtítulos:', error);
      }
    }
  }, [flowState, user]);

  // Legacy function kept for compatibility (no longer used with new flow)
  const selectManualCustomization = useCallback(async (manualCustomization: ManualCustomization, apiVersionCustomization: ApiVersionCustomization) => {
    console.warn('selectManualCustomization is deprecated in the new flow');
  }, []);

  const selectGeneratedScript = useCallback(async (script: string) => {
    console.log('📝 DEBUG selectGeneratedScript - Guardando script:', {
      scriptLength: script.length,
      scriptPreview: script.substring(0, 100) + '...',
      userId: user?.id
    });
    
    const newFlowState = {
      ...flowState,
      generatedScript: script,
      step: 'style' as const
    };
    
    setFlowState(newFlowState);
    
    // Guardado inmediato del script crítico
    if (user) {
      try {
        console.log('💾 DEBUG - Guardando script inmediatamente');
        await saveVideoConfigImmediate(user, newFlowState);
        console.log('✅ DEBUG - Script guardado exitosamente');
      } catch (error) {
        console.error('❌ DEBUG - Error guardando script:', error);
      }
    }
  }, [flowState, user]);

  const goToStep = useCallback((step: FlowState['step']) => {
    console.log('🔄 Navegando a paso:', step);
    setFlowState(prev => ({ ...prev, step }));
  }, []);

  const resetFlow = useCallback(async () => {
    console.log('🔄 Reiniciando flujo completo...');
    
    // Clear flow state in Supabase (including base64 files)
    if (user) {
      await clearFlowState(user);
    }
    
    // Reset to initial state
    setFlowState({
      step: 'api-key',
      selectedApiKey: null,
      selectedAvatar: null,
      selectedSecondAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
      subtitleCustomization: null,
      generatedScript: null,
      cardCustomization: null,
      presenterCustomization: null,
      apiVersionCustomization: null,
      manualCustomization: null
    });
    
    console.log('✅ Flujo reiniciado completamente');
  }, [user]);

  return {
    flowState,
    apiKeys,
    loading: apiKeysLoading || !isInitialized || !user,
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
  };
};
