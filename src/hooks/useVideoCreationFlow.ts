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
  const selectApiKey = useCallback((apiKey: HeyGenApiKey) => {
    console.log('🔑 Seleccionando API Key:', apiKey.api_key_name);
    setFlowState(prev => ({
      ...prev,
      selectedApiKey: apiKey,
      step: 'neurocopy',
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
    }));
  }, []);

  const selectAvatar = useCallback((avatar: Avatar) => {
    console.log('👤 Seleccionando Avatar:', avatar.avatar_name);
    setFlowState(prev => ({
      ...prev,
      selectedAvatar: avatar,
      step: 'voice'
    }));
  }, []);

  const selectSecondAvatar = useCallback((avatar: Avatar) => {
    console.log('👤 Seleccionando Segundo Avatar:', avatar.avatar_name);
    console.log('🔄 Multi-Avatar: Navegando directamente a subtitle-customization');
    setFlowState(prev => ({
      ...prev,
      selectedSecondAvatar: avatar,
      step: 'subtitle-customization'
    }));
  }, []);

  const selectVoice = useCallback((voice: Voice) => {
    console.log('🎤 Seleccionando Voz:', voice.voice_name);
    
    setFlowState(prev => {
      let nextStep: FlowState['step'];
      
      if (prev.selectedStyle?.id === 'style-7') {
        // Estilo Multi-Avatar - ir a selección del segundo avatar
        console.log('🔄 Multi-Avatar detectado: navegando a multi-avatar');
        nextStep = 'multi-avatar';
      } else {
        // Todos los demás estilos van a personalización de subtítulos
        console.log('📝 Navegando a personalización de subtítulos');
        nextStep = 'subtitle-customization';
      }
      
      return {
        ...prev,
        selectedVoice: voice,
        step: nextStep
      };
    });
  }, []);

  const selectStyle = useCallback((style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization, apiVersionCustomization?: ApiVersionCustomization, manualCustomization?: ManualCustomization) => {
    console.log('🎨 Seleccionando Estilo:', style.name);
    console.log('📝 Navegando a selección de avatar para estilo:', style.name);
    
    setFlowState(prev => ({
      ...prev,
      selectedStyle: style,
      cardCustomization: cardCustomization || null,
      presenterCustomization: presenterCustomization || null,
      apiVersionCustomization: apiVersionCustomization || null,
      manualCustomization: manualCustomization || null,
      step: 'avatar'
    }));
  }, []);

  const selectSubtitleCustomization = useCallback((subtitleCustomization: SubtitleCustomization) => {
    console.log('📝 Seleccionando personalización de subtítulos:', subtitleCustomization);
    
    setFlowState(prev => ({
      ...prev,
      subtitleCustomization,
      step: 'generator'
    }));
  }, []);

  // Legacy function kept for compatibility (no longer used with new flow)
  const selectManualCustomization = useCallback(async (manualCustomization: ManualCustomization, apiVersionCustomization: ApiVersionCustomization) => {
    console.warn('selectManualCustomization is deprecated in the new flow');
  }, []);

  const selectGeneratedScript = useCallback((script: string) => {
    console.log('📝 Seleccionando Script generado, longitud:', script.length);
    
    setFlowState(prev => ({
      ...prev,
      generatedScript: script,
      step: 'style'
    }));
  }, []);

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
