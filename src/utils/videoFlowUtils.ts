
import { FlowState, HeyGenApiKey } from '@/types/videoFlow';
import { saveVideoConfig, loadVideoConfig, clearVideoConfig } from '@/lib/videoConfigDatabase';
import { User } from '@supabase/supabase-js';
import { loadFilesFromLocal, hasLocalFiles } from '@/lib/fileStorage';

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
      selectedVoice: null,
      selectedStyle: null,
      generatedScript: null,
      cardCustomization: null,
      presenterCustomization: null,
      apiVersionCustomization: null,
      manualCustomization: null
    };
  }

  // If there's a saved state with valid API key, use it conservatively
  if (savedState && savedState.selectedApiKey) {
    const savedKeyExists = availableKeys.some(key => key.id === savedState.selectedApiKey?.id);
    
    if (savedKeyExists) {
      // For manual style (style-5), check if manual customization is complete
      if (savedState.selectedStyle?.id === 'style-5' && savedState.manualCustomization && savedState.apiVersionCustomization) {
        console.log('📦 Found saved manual customization, checking local files...');
        
        // Try to restore files from localStorage
        const localFiles = loadFilesFromLocal(savedState.manualCustomization.sessionId);
        if (localFiles) {
          console.log('✅ Files restored from localStorage');
          const updatedManualCustomization = {
            ...savedState.manualCustomization,
            images: localFiles.images,
            videos: localFiles.videos
          };
          
          // If has all selections including generated script, go to generator
          if (savedState.generatedScript) {
            return {
              ...savedState,
              manualCustomization: updatedManualCustomization,
              step: 'generator'
            };
          }
          // If has all selections but no script, go to neurocopy
          return {
            ...savedState,
            manualCustomization: updatedManualCustomization,
            step: 'neurocopy',
            generatedScript: null
          };
        } else {
          console.log('❌ Could not restore files, going back to manual-upload');
          return {
            ...savedState,
            step: 'manual-upload'
          };
        }
      }
      
      // For non-manual styles
      if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedVoice && savedState.selectedStyle) {
        // If has all selections including generated script, go to generator
        if (savedState.generatedScript) {
          return {
            ...savedState,
            step: 'generator'
          };
        }
        // If has all selections but no script, go to neurocopy
        return {
          ...savedState,
          step: 'neurocopy',
          generatedScript: null
        };
      }
      // If has key, avatar, and voice, go to style
      if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedVoice) {
        return {
          ...savedState,
          step: 'style',
          selectedStyle: null,
          generatedScript: null,
          cardCustomization: null,
          presenterCustomization: null
        };
      }
      // If has key and avatar, go to voice
      if (savedState.selectedApiKey && savedState.selectedAvatar) {
        return {
          ...savedState,
          step: 'voice',
          selectedVoice: null,
          selectedStyle: null,
          generatedScript: null,
          cardCustomization: null,
          presenterCustomization: null
        };
      }
      // If only has key, go to avatar
      if (savedState.selectedApiKey) {
        return {
          ...savedState,
          step: 'avatar',
          selectedAvatar: null,
          selectedVoice: null,
          selectedStyle: null,
          generatedScript: null,
          cardCustomization: null,
          presenterCustomization: null
        };
      }
    }
  }

  // Default: go to API key selection
  return {
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
  };
};

// Funciones actualizadas para usar Supabase
export const loadSavedFlowState = async (user: User | null): Promise<FlowState | null> => {
  return await loadVideoConfig(user);
};

export const saveFlowState = async (user: User | null, state: FlowState): Promise<void> => {
  if (user) {
    await saveVideoConfig(user, state);
  }
};

export const clearFlowState = async (user: User | null): Promise<void> => {
  if (user) {
    await clearVideoConfig(user);
  }
};

// Funciones legacy mantenidas para compatibilidad (ahora vacías)
export const loadSavedFlowStateLocal = (): FlowState | null => {
  console.warn('loadSavedFlowStateLocal is deprecated, use loadSavedFlowState with user instead');
  return null;
};

export const saveFlowStateLocal = (state: FlowState): void => {
  console.warn('saveFlowStateLocal is deprecated, use saveFlowState with user instead');
};

export const clearFlowStateLocal = (): void => {
  console.warn('clearFlowStateLocal is deprecated, use clearFlowState with user instead');
};
