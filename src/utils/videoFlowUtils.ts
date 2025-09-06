
import { FlowState, HeyGenApiKey } from '@/types/videoFlow';
import { saveVideoConfig, loadVideoConfig, clearVideoConfig } from '@/lib/videoConfigDatabase';
import { User } from '@supabase/supabase-js';
// No longer using localStorage for file storage

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
  }

  // If there's a saved state with valid API key, use it conservatively
  if (savedState && savedState.selectedApiKey) {
    const savedKeyExists = availableKeys.some(key => key.id === savedState.selectedApiKey?.id);
    
    if (savedKeyExists) {
      console.log('🔍 Analizando estado guardado:', {
        selectedStyle: savedState.selectedStyle?.id,
        hasFirstAvatar: !!savedState.selectedAvatar,
        hasSecondAvatar: !!savedState.selectedSecondAvatar,
        hasVoice: !!savedState.selectedVoice,
        hasSubtitleCustomization: !!savedState.subtitleCustomization,
        hasGeneratedScript: !!savedState.generatedScript
      });

      // NEW FLOW ORDER: api-key → neurocopy → style → avatar → voice → multi-avatar → subtitle-customization → generator

      // Check if flow is complete (has script + all required selections)
      if (savedState.generatedScript && savedState.selectedStyle && savedState.selectedAvatar && savedState.selectedVoice && savedState.subtitleCustomization) {
        // Special check for multi-avatar style
        if (savedState.selectedStyle.id === 'style-7' && savedState.selectedSecondAvatar) {
          console.log('✅ Configuración completa para Multi-Avatar, dirigiendo a generator');
          return { ...savedState, step: 'generator' };
        } else if (savedState.selectedStyle.id !== 'style-7') {
          console.log('✅ Configuración completa para estilo normal, dirigiendo a generator');
          return { ...savedState, step: 'generator' };
        }
      }

      // Check subtitle customization step
      if (savedState.generatedScript && savedState.selectedStyle && savedState.selectedAvatar && savedState.selectedVoice) {
        // For style-7, need second avatar before subtitle customization
        if (savedState.selectedStyle.id === 'style-7' && !savedState.selectedSecondAvatar) {
          console.log('➡️ Multi-Avatar: Falta segundo avatar, dirigiendo a multi-avatar');
          return { ...savedState, step: 'multi-avatar', subtitleCustomization: null };
        }
        // For style-7 with second avatar, or other styles, go to subtitle customization
        if (!savedState.subtitleCustomization) {
          console.log('➡️ Dirigiendo a subtitle-customization');
          return { ...savedState, step: 'subtitle-customization', subtitleCustomization: null };
        }
      }

      // Check voice selection step
      if (savedState.generatedScript && savedState.selectedStyle && savedState.selectedAvatar && !savedState.selectedVoice) {
        console.log('➡️ Dirigiendo a voice');
        return { ...savedState, step: 'voice', selectedVoice: null, selectedSecondAvatar: null, subtitleCustomization: null };
      }

      // Check avatar selection step
      if (savedState.generatedScript && savedState.selectedStyle && !savedState.selectedAvatar) {
        console.log('➡️ Dirigiendo a avatar');
        return { ...savedState, step: 'avatar', selectedAvatar: null, selectedSecondAvatar: null, selectedVoice: null, subtitleCustomization: null };
      }

      // Check style selection step
      if (savedState.generatedScript && !savedState.selectedStyle) {
        console.log('➡️ Dirigiendo a style');
        return { 
          ...savedState, 
          step: 'style', 
          selectedStyle: null, 
          selectedAvatar: null, 
          selectedSecondAvatar: null, 
          selectedVoice: null, 
          subtitleCustomization: null,
          cardCustomization: null,
          presenterCustomization: null,
          apiVersionCustomization: null,
          manualCustomization: null
        };
      }

      // Check neurocopy step - if has API key but no script
      if (savedState.selectedApiKey && !savedState.generatedScript) {
        console.log('➡️ Dirigiendo a neurocopy');
        return { 
          ...savedState, 
          step: 'neurocopy',
          generatedScript: null,
          selectedStyle: null, 
          selectedAvatar: null, 
          selectedSecondAvatar: null, 
          selectedVoice: null, 
          subtitleCustomization: null,
          cardCustomization: null,
          presenterCustomization: null,
          apiVersionCustomization: null,
          manualCustomization: null
        };
      }
    }
  }

  // Default: go to API key selection
  return {
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
