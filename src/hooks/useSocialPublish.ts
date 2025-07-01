
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBlotatomApiKeys, BlotatomApiKey } from '@/hooks/useBlotatomApiKeys';

export type SocialStep = 
  | 'api-key-check' 
  | 'api-key-input' 
  | 'generate-caption' 
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

export const useSocialPublish = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { apiKeys, loadApiKeys, saveApiKey } = useBlotatomApiKeys();

  const [state, setState] = useState<SocialPublishState>({
    isOpen: false,
    step: 'api-key-check',
    videoUrl: '',
    script: '',
    selectedApiKey: null,
    generatedCaption: '',
    editedCaption: '',
    selectedNetwork: null,
    isLoading: false,
    error: null
  });

  const openModal = useCallback(async (videoUrl: string, script: string) => {
    console.log('Opening social publish modal:', { videoUrl, script });
    
    setState(prev => ({
      ...prev,
      isOpen: true,
      step: 'api-key-check',
      videoUrl,
      script,
      selectedApiKey: null,
      generatedCaption: '',
      editedCaption: '',
      selectedNetwork: null,
      isLoading: true,
      error: null
    }));

    // Load API keys and check if user has any
    const keys = await loadApiKeys();
    
    if (keys.length > 0) {
      setState(prev => ({
        ...prev,
        selectedApiKey: keys[0],
        step: 'generate-caption',
        isLoading: false
      }));
    } else {
      setState(prev => ({
        ...prev,
        step: 'api-key-input',
        isLoading: false
      }));
    }
  }, [loadApiKeys]);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      step: 'api-key-check',
      videoUrl: '',
      script: '',
      selectedApiKey: null,
      generatedCaption: '',
      editedCaption: '',
      selectedNetwork: null,
      isLoading: false,
      error: null
    }));
  }, []);

  const handleApiKeySaved = useCallback(async (name: string, apiKey: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await saveApiKey(name, apiKey);
      const keys = await loadApiKeys();
      
      if (keys.length > 0) {
        setState(prev => ({
          ...prev,
          selectedApiKey: keys[0],
          step: 'generate-caption',
          isLoading: false
        }));
        
        toast({
          title: "Clave API guardada",
          description: "Tu clave API de Blotato ha sido guardada exitosamente."
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error al guardar la clave API',
        isLoading: false 
      }));
    }
  }, [saveApiKey, loadApiKeys, toast]);

  const generateCaption = useCallback(async () => {
    if (!state.script) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Generating caption for script:', state.script);
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: state.script })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // Set timeout for 5 minutes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La generación de caption tardó más de 5 minutos')), 5 * 60 * 1000);
      });

      const responsePromise = response.json();
      const data = await Promise.race([responsePromise, timeoutPromise]);
      
      console.log('Caption response:', data);
      
      if (Array.isArray(data) && data[0]?.caption) {
        const caption = data[0].caption;
        setState(prev => ({
          ...prev,
          generatedCaption: caption,
          editedCaption: caption,
          step: 'select-network',
          isLoading: false
        }));
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error generando caption',
        isLoading: false 
      }));
    }
  }, [state.script]);

  const selectNetwork = useCallback((network: SocialNetwork) => {
    setState(prev => ({
      ...prev,
      selectedNetwork: network
    }));
  }, []);

  const publishToNetwork = useCallback(async () => {
    if (!state.selectedApiKey || !state.selectedNetwork || !state.editedCaption) return;

    try {
      setState(prev => ({ ...prev, step: 'publishing', isLoading: true, error: null }));
      
      const decryptedApiKey = atob(state.selectedApiKey.api_key_encrypted);
      
      const payload = {
        caption: state.editedCaption,
        network: state.selectedNetwork,
        videoUrl: state.videoUrl,
        apiKey: decryptedApiKey
      };
      
      console.log('Publishing to network:', payload);
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/REDES', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // Set timeout for 7 minutes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La publicación tardó más de 7 minutos')), 7 * 60 * 1000);
      });

      const responsePromise = response.json();
      const data = await Promise.race([responsePromise, timeoutPromise]);
      
      console.log('Publish response:', data);
      
      if (Array.isArray(data) && data[0]?.Estado) {
        if (data[0].Estado === 'Exito') {
          setState(prev => ({
            ...prev,
            step: 'success',
            isLoading: false
          }));
        } else {
          setState(prev => ({
            ...prev,
            step: 'error',
            error: 'Error en la publicación. Intenta nuevamente en 5 minutos.',
            isLoading: false
          }));
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Error publicando en red social',
        isLoading: false 
      }));
    }
  }, [state.selectedApiKey, state.selectedNetwork, state.editedCaption, state.videoUrl]);

  const updateCaption = useCallback((caption: string) => {
    setState(prev => ({
      ...prev,
      editedCaption: caption
    }));
  }, []);

  const retryFromError = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 'select-network',
      error: null
    }));
  }, []);

  return {
    state,
    openModal,
    closeModal,
    handleApiKeySaved,
    generateCaption,
    selectNetwork,
    publishToNetwork,
    updateCaption,
    retryFromError
  };
};
