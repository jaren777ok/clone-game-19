
import { useState, useCallback } from 'react';
import { BlotatomApiKey } from '@/hooks/useBlotatomApiKeys';

export type SocialStep = 
  | 'generate-caption' 
  | 'api-key-input' 
  | 'select-network' 
  | 'publishing' 
  | 'success' 
  | 'error';

export type SocialNetwork = 'instagram' | 'tiktok';

export interface SocialPublishState {
  isOpen: boolean;
  step: SocialStep;
  videoUrl: string;
  script: string;
  selectedApiKey: BlotatomApiKey | null;
  generatedCaption: string;
  editedCaption: string;
  selectedNetwork: SocialNetwork | null;
  isLoading: boolean;
  error: string | null;
}

export const useSocialPublishState = () => {
  const [state, setState] = useState<SocialPublishState>({
    isOpen: false,
    step: 'api-key-input',
    videoUrl: '',
    script: '',
    selectedApiKey: null,
    generatedCaption: '',
    editedCaption: '',
    selectedNetwork: null,
    isLoading: false,
    error: null
  });

  const updateState = useCallback((updates: Partial<SocialPublishState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      isOpen: false,
      step: 'api-key-input',
      videoUrl: '',
      script: '',
      selectedApiKey: null,
      generatedCaption: '',
      editedCaption: '',
      selectedNetwork: null,
      isLoading: false,
      error: null
    });
  }, []);

  const openModal = useCallback((videoUrl: string, script: string) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      videoUrl,
      script,
      selectedApiKey: null,
      generatedCaption: '',
      editedCaption: '',
      selectedNetwork: null,
      isLoading: false,
      error: null
    }));
  }, []);

  const closeModal = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    state,
    updateState,
    resetState,
    openModal,
    closeModal
  };
};
