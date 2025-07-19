
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

      // Manejo especial para style-7 (Multi-Avatar)
      if (savedState.selectedStyle?.id === 'style-7') {
        console.log('🎭 Detectado estilo Multi-Avatar (style-7)');
        
        // Si tiene primer avatar, voz, estilo pero NO segundo avatar → ir a multi-avatar
        if (savedState.selectedAvatar && 
            savedState.selectedVoice && 
            savedState.selectedStyle && 
            !savedState.selectedSecondAvatar) {
          console.log('➡️ Multi-Avatar: Falta segundo avatar, dirigiendo a multi-avatar');
          return {
            ...savedState,
            step: 'multi-avatar',
            generatedScript: null
          };
        }
        
        // Si tiene ambos avatares pero no personalización de subtítulos
        if (savedState.selectedAvatar && 
            savedState.selectedSecondAvatar && 
            savedState.selectedVoice && 
            savedState.selectedStyle && 
            !savedState.subtitleCustomization) {
          console.log('➡️ Multi-Avatar: Ambos avatares presentes, dirigiendo a subtitle-customization');
          return {
            ...savedState,
            step: 'subtitle-customization',
            generatedScript: null
          };
        }
        
        // Si tiene todo incluyendo personalización de subtítulos pero no script
        if (savedState.selectedAvatar && 
            savedState.selectedSecondAvatar && 
            savedState.selectedVoice && 
            savedState.selectedStyle && 
            savedState.subtitleCustomization && 
            !savedState.generatedScript) {
          console.log('➡️ Multi-Avatar: Todo configurado, dirigiendo a neurocopy');
          return {
            ...savedState,
            step: 'neurocopy',
            generatedScript: null
          };
        }
        
        // Si tiene todo incluyendo script generado → ir a generator
        if (savedState.selectedAvatar && 
            savedState.selectedSecondAvatar && 
            savedState.selectedVoice && 
            savedState.selectedStyle && 
            savedState.subtitleCustomization && 
            savedState.generatedScript) {
          console.log('➡️ Multi-Avatar: Configuración completa, dirigiendo a generator');
          return {
            ...savedState,
            step: 'generator'
          };
        }
      }
      
      // For manual styles (style-5 and style-6), check if manual customization is complete
      if ((savedState.selectedStyle?.id === 'style-5' || savedState.selectedStyle?.id === 'style-6') && savedState.manualCustomization && savedState.apiVersionCustomization) {
        console.log('📦 Found saved manual customization, checking local files...');
        
        // Files are now loaded directly from Supabase as base64
        if (savedState.manualCustomization.images.length > 0 && savedState.manualCustomization.videos.length > 0) {
          console.log('✅ Archivos cargados desde Supabase:', {
            images: savedState.manualCustomization.images.length,
            videos: savedState.manualCustomization.videos.length,
            sessionId: savedState.manualCustomization.sessionId
          });
          
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
        } else {
          console.log('❌ No se encontraron archivos válidos, regresando a neurocopy');
          return {
            ...savedState,
            step: 'neurocopy'
          };
        }
      }
      
      // For non-manual styles (excluding style-7 which is handled above)
      if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedVoice && savedState.selectedStyle && savedState.selectedStyle.id !== 'style-7') {
        // If has all selections including generated script, go to generator
        if (savedState.generatedScript) {
          return {
            ...savedState,
            step: 'generator'
          };
        }
        
        // All styles now require subtitle customization
        if (savedState.subtitleCustomization) {
          // Has subtitle customization, go to neurocopy
          return {
            ...savedState,
            step: 'neurocopy',
            generatedScript: null
          };
        } else {
          // Needs subtitle customization
          return {
            ...savedState,
            step: 'subtitle-customization',
            generatedScript: null
          };
        }
      }
      // If has key, avatar, and voice, go to style
      if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedVoice) {
        return {
          ...savedState,
          step: 'style',
          selectedStyle: null,
          generatedScript: null,
          subtitleCustomization: null,
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
          subtitleCustomization: null,
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
          subtitleCustomization: null,
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
