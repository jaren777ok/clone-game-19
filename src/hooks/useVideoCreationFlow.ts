
import { useState, useEffect, useCallback } from 'react';
import { FlowState, HeyGenApiKey, Avatar, Voice, VideoStyle } from '@/types/videoFlow';
import { useApiKeys } from '@/hooks/useApiKeys';
import { 
  determineInitialStep, 
  loadSavedFlowState, 
  saveFlowState, 
  clearFlowState 
} from '@/utils/videoFlowUtils';

export const useVideoCreationFlow = () => {
  const { apiKeys, loading: apiKeysLoading, loadApiKeys } = useApiKeys();
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'loading',
    selectedApiKey: null,
    selectedAvatar: null,
    selectedVoice: null,
    selectedStyle: null,
    generatedScript: null
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize flow state once
  useEffect(() => {
    if (isInitialized) return;

    const initializeFlow = async () => {
      try {
        const keys = await loadApiKeys();
        const savedState = loadSavedFlowState();
        const initialState = determineInitialStep(savedState, keys);
        
        setFlowState(initialState);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing flow:', error);
        setFlowState(prev => ({ ...prev, step: 'api-key' }));
        setIsInitialized(true);
      }
    };

    initializeFlow();
  }, [isInitialized, loadApiKeys]);

  // Save state to localStorage when it changes (with debouncing)
  useEffect(() => {
    if (!isInitialized || flowState.step === 'loading') return;

    const timeoutId = setTimeout(() => {
      saveFlowState(flowState);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [flowState, isInitialized]);

  // Navigation functions
  const selectApiKey = useCallback((apiKey: HeyGenApiKey) => {
    setFlowState(prev => ({
      ...prev,
      selectedApiKey: apiKey,
      step: 'avatar',
      selectedAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
      generatedScript: null
    }));
  }, []);

  const selectAvatar = useCallback((avatar: Avatar) => {
    setFlowState(prev => ({
      ...prev,
      selectedAvatar: avatar,
      step: 'voice'
    }));
  }, []);

  const selectVoice = useCallback((voice: Voice) => {
    setFlowState(prev => ({
      ...prev,
      selectedVoice: voice,
      step: 'style'
    }));
  }, []);

  const selectStyle = useCallback((style: VideoStyle) => {
    setFlowState(prev => ({
      ...prev,
      selectedStyle: style,
      step: 'neurocopy'
    }));
  }, []);

  const selectGeneratedScript = useCallback((script: string) => {
    setFlowState(prev => ({
      ...prev,
      generatedScript: script,
      step: 'generator'
    }));
  }, []);

  const goToStep = useCallback((step: FlowState['step']) => {
    setFlowState(prev => ({ ...prev, step }));
  }, []);

  const resetFlow = useCallback(() => {
    setFlowState({
      step: 'api-key',
      selectedApiKey: null,
      selectedAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
      generatedScript: null
    });
    clearFlowState();
  }, []);

  return {
    flowState,
    apiKeys,
    loading: apiKeysLoading || !isInitialized,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectVoice,
    selectStyle,
    selectGeneratedScript,
    goToStep,
    resetFlow
  };
};
