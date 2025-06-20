
import { FlowState, HeyGenApiKey } from '@/types/videoFlow';

export const determineInitialStep = (
  savedState: FlowState | null, 
  availableKeys: HeyGenApiKey[]
): FlowState => {
  // If no API keys available, go to API key setup
  if (availableKeys.length === 0) {
    return {
      step: 'api-key',
      selectedApiKey: null,
      selectedAvatar: null,
      selectedStyle: null
    };
  }

  // If there's a saved state with valid API key, use it conservatively
  if (savedState && savedState.selectedApiKey) {
    const savedKeyExists = availableKeys.some(key => key.id === savedState.selectedApiKey?.id);
    
    if (savedKeyExists) {
      // If has all selections, go to generator
      if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedStyle) {
        return {
          ...savedState,
          step: 'generator'
        };
      }
      // If has key and avatar, go to style
      if (savedState.selectedApiKey && savedState.selectedAvatar) {
        return {
          ...savedState,
          step: 'style',
          selectedStyle: null
        };
      }
      // If only has key, go to avatar
      if (savedState.selectedApiKey) {
        return {
          ...savedState,
          step: 'avatar',
          selectedAvatar: null,
          selectedStyle: null
        };
      }
    }
  }

  // Default: go to API key selection
  return {
    step: 'api-key',
    selectedApiKey: null,
    selectedAvatar: null,
    selectedStyle: null
  };
};

export const loadSavedFlowState = (): FlowState | null => {
  const savedState = localStorage.getItem('video_creation_flow');
  if (!savedState) return null;
  
  try {
    return JSON.parse(savedState);
  } catch (error) {
    console.error('Error parsing saved flow state:', error);
    localStorage.removeItem('video_creation_flow');
    return null;
  }
};

export const saveFlowState = (state: FlowState): void => {
  localStorage.setItem('video_creation_flow', JSON.stringify(state));
};

export const clearFlowState = (): void => {
  localStorage.removeItem('video_creation_flow');
};
