
import { useState, useEffect, useCallback } from 'react';
import { FlowState, HeyGenApiKey, Avatar, Voice, VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization } from '@/types/videoFlow';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useAuth } from '@/hooks/useAuth';
import { 
  determineInitialStep, 
  loadSavedFlowState, 
  saveFlowState, 
  clearFlowState 
} from '@/utils/videoFlowUtils';

export const useVideoCreationFlow = () => {
  const { user } = useAuth();
  const { apiKeys, loading: apiKeysLoading, loadApiKeys } = useApiKeys();
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'loading',
    selectedApiKey: null,
    selectedAvatar: null,
    selectedVoice: null,
    selectedStyle: null,
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
      step: 'avatar',
      selectedAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
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

  const selectVoice = useCallback((voice: Voice) => {
    console.log('🎤 Seleccionando Voz:', voice.voice_name);
    setFlowState(prev => ({
      ...prev,
      selectedVoice: voice,
      step: 'style'
    }));
  }, []);

  const selectStyle = useCallback((style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization, apiVersionCustomization?: ApiVersionCustomization, manualCustomization?: ManualCustomization) => {
    console.log('🎨 Seleccionando Estilo:', style.name);
    console.log('📐 Configuración de API:', apiVersionCustomization);
    
    // Check if it's manual style requiring file upload
    if (style.id === 'style-5') {
      setFlowState(prev => ({
        ...prev,
        selectedStyle: style,
        step: 'manual-upload'
      }));
    } else {
      setFlowState(prev => ({
        ...prev,
        selectedStyle: style,
        cardCustomization: cardCustomization || null,
        presenterCustomization: presenterCustomization || null,
        apiVersionCustomization: apiVersionCustomization || null,
        manualCustomization: manualCustomization || null,
        step: 'neurocopy'
      }));
    }
  }, []);

  const selectManualCustomization = useCallback((manualCustomization: ManualCustomization, apiVersionCustomization: ApiVersionCustomization) => {
    console.log('📁 Seleccionando archivos manuales:', {
      images: manualCustomization.images.length,
      videos: manualCustomization.videos.length
    });
    setFlowState(prev => ({
      ...prev,
      manualCustomization,
      apiVersionCustomization,
      step: 'neurocopy'
    }));
  }, []);

  const selectGeneratedScript = useCallback((script: string) => {
    console.log('📝 Seleccionando Script generado, longitud:', script.length);
    setFlowState(prev => ({
      ...prev,
      generatedScript: script,
      step: 'generator'
    }));
  }, []);

  const goToStep = useCallback((step: FlowState['step']) => {
    console.log('🔄 Navegando a paso:', step);
    setFlowState(prev => ({ ...prev, step }));
  }, []);

  const resetFlow = useCallback(async () => {
    console.log('🔄 Reseteando flujo de creación');
    setFlowState({
      step: 'api-key',
      selectedApiKey: null,
      selectedAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
      generatedScript: null,
      cardCustomization: null,
      presenterCustomization: null,
      apiVersionCustomization: null,
      manualCustomization: null
    });
    
    if (user) {
      await clearFlowState(user);
    }
  }, [user]);

  return {
    flowState,
    apiKeys,
    loading: apiKeysLoading || !isInitialized || !user,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectVoice,
    selectStyle,
    selectManualCustomization,
    selectGeneratedScript,
    goToStep,
    resetFlow
  };
};
