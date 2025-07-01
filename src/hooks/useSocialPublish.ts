
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBlotatomApiKeys } from '@/hooks/useBlotatomApiKeys';
import { useSocialPublishState, SocialNetwork } from '@/hooks/useSocialPublishState';
import { useCaptionGeneration } from '@/hooks/useCaptionGeneration';
import { useSocialNetworkPublish } from '@/hooks/useSocialNetworkPublish';

export type { SocialNetwork } from '@/hooks/useSocialPublishState';
export type { SocialStep, SocialPublishState } from '@/hooks/useSocialPublishState';

export const useSocialPublish = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loadApiKeys, saveApiKey } = useBlotatomApiKeys();
  const { state, updateState, openModal: openModalState, closeModal } = useSocialPublishState();
  const { generateCaption: generateCaptionApi } = useCaptionGeneration();
  const { publishToNetwork: publishToNetworkApi } = useSocialNetworkPublish();

  const openModal = useCallback(async (videoUrl: string, script: string) => {
    console.log('🚀 Opening social publish modal:', { videoUrl, script });
    
    if (!user) {
      console.error('❌ No user authenticated');
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar en redes sociales",
        variant: "destructive"
      });
      return;
    }

    // Abrir modal inmediatamente
    openModalState(videoUrl, script);

    try {
      console.log('🔍 Checking for existing API keys...');
      const keys = await loadApiKeys();
      
      console.log('📋 API keys found:', keys.length);
      
      if (keys.length > 0) {
        console.log('✅ API keys found, proceeding to caption generation');
        updateState({
          selectedApiKey: keys[0],
          step: 'generate-caption'
        });
      } else {
        console.log('❌ No API keys found, showing input form');
        updateState({
          step: 'api-key-input'
        });
      }
    } catch (error) {
      console.error('💥 Error loading API keys:', error);
      updateState({
        step: 'api-key-input',
        error: null
      });
      console.log('⚠️ Error loading keys, showing API key form as fallback');
    }
  }, [loadApiKeys, user, toast, openModalState, updateState]);

  const handleApiKeySaved = useCallback(async (name: string, apiKey: string) => {
    try {
      console.log('💾 Saving API key:', name);
      updateState({ isLoading: true, error: null });
      
      await saveApiKey(name, apiKey);
      const keys = await loadApiKeys();
      
      if (keys.length > 0) {
        console.log('✅ API key saved, proceeding to caption generation');
        updateState({
          selectedApiKey: keys[0],
          step: 'generate-caption',
          isLoading: false
        });
        
        toast({
          title: "Clave API guardada",
          description: "Tu clave API de Blotato ha sido guardada exitosamente."
        });
      } else {
        throw new Error('No se pudo cargar la clave API guardada');
      }
    } catch (error) {
      console.error('💥 Error saving API key:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Error al guardar la clave API',
        isLoading: false 
      });
    }
  }, [saveApiKey, loadApiKeys, toast, updateState]);

  const generateCaption = useCallback(async () => {
    if (!state.script) return;

    try {
      updateState({ isLoading: true, error: null });
      
      const caption = await generateCaptionApi(state.script);
      
      updateState({
        generatedCaption: caption,
        editedCaption: caption,
        isLoading: false
      });
    } catch (error) {
      console.error('Error generating caption:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Error generando caption',
        isLoading: false 
      });
    }
  }, [state.script, generateCaptionApi, updateState]);

  const selectNetwork = useCallback((network: SocialNetwork) => {
    updateState({ selectedNetwork: network });
  }, [updateState]);

  const publishToNetwork = useCallback(async () => {
    if (!state.selectedApiKey || !state.selectedNetwork || !state.editedCaption) return;

    try {
      updateState({ step: 'publishing', isLoading: true, error: null });
      
      await publishToNetworkApi(
        state.selectedApiKey,
        state.selectedNetwork,
        state.editedCaption,
        state.videoUrl
      );
      
      updateState({
        step: 'success',
        isLoading: false
      });
    } catch (error) {
      console.error('Error publishing:', error);
      updateState({ 
        step: 'error',
        error: error instanceof Error ? error.message : 'Error publicando en red social',
        isLoading: false 
      });
    }
  }, [state.selectedApiKey, state.selectedNetwork, state.editedCaption, state.videoUrl, publishToNetworkApi, updateState]);

  const updateCaption = useCallback((caption: string) => {
    updateState({ editedCaption: caption });
  }, [updateState]);

  const navigateToSelectNetwork = useCallback(() => {
    updateState({ step: 'select-network' });
  }, [updateState]);

  const retryFromError = useCallback(() => {
    updateState({
      step: 'select-network',
      error: null
    });
  }, [updateState]);

  return {
    state,
    openModal,
    closeModal,
    handleApiKeySaved,
    generateCaption,
    selectNetwork,
    publishToNetwork,
    updateCaption,
    navigateToSelectNetwork,
    retryFromError
  };
};
