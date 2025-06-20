
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface HeyGenApiKey {
  id: string;
  api_key_name: string;
  api_key_encrypted: string;
  created_at: string;
}

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
}

export interface VideoStyle {
  id: string;
  name: string;
  video_url: string;
}

export interface FlowState {
  step: 'loading' | 'api-key' | 'avatar' | 'style' | 'generator';
  selectedApiKey: HeyGenApiKey | null;
  selectedAvatar: Avatar | null;
  selectedStyle: VideoStyle | null;
}

export const useVideoCreationFlow = () => {
  const { user } = useAuth();
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'loading',
    selectedApiKey: null,
    selectedAvatar: null,
    selectedStyle: null
  });
  const [apiKeys, setApiKeys] = useState<HeyGenApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función simplificada para determinar el paso inicial
  const determineInitialStep = (savedState: FlowState | null, availableKeys: HeyGenApiKey[]): FlowState => {
    // Si no hay claves API disponibles, ir a configuración de API
    if (availableKeys.length === 0) {
      return {
        step: 'api-key',
        selectedApiKey: null,
        selectedAvatar: null,
        selectedStyle: null
      };
    }

    // Si hay un estado guardado válido, usarlo pero ser conservador
    if (savedState && savedState.selectedApiKey) {
      // Verificar si la clave API guardada todavía existe
      const savedKeyExists = availableKeys.some(key => key.id === savedState.selectedApiKey?.id);
      
      if (savedKeyExists) {
        // Si tiene todas las selecciones, ir a generator
        if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedStyle) {
          return {
            ...savedState,
            step: 'generator'
          };
        }
        // Si tiene clave y avatar, ir a style
        if (savedState.selectedApiKey && savedState.selectedAvatar) {
          return {
            ...savedState,
            step: 'style',
            selectedStyle: null
          };
        }
        // Si solo tiene clave, ir a avatar
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

    // Por defecto, ir a selección de clave
    return {
      step: 'api-key',
      selectedApiKey: null,
      selectedAvatar: null,
      selectedStyle: null
    };
  };

  // Cargar estado del localStorage al inicializar (solo una vez)
  useEffect(() => {
    if (!user || isInitialized) return;

    const initializeFlow = async () => {
      try {
        // Cargar claves API
        const { data: keysData, error } = await supabase
          .from('heygen_api_keys')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const keys = keysData || [];
        setApiKeys(keys);

        // Cargar estado guardado
        const savedState = localStorage.getItem('video_creation_flow');
        let parsedState: FlowState | null = null;
        
        if (savedState) {
          try {
            parsedState = JSON.parse(savedState);
          } catch (error) {
            console.error('Error parsing saved flow state:', error);
            localStorage.removeItem('video_creation_flow');
          }
        }

        // Determinar el paso inicial
        const initialState = determineInitialStep(parsedState, keys);
        setFlowState(initialState);
        setIsInitialized(true);

      } catch (error) {
        console.error('Error initializing flow:', error);
        setFlowState(prev => ({ ...prev, step: 'api-key' }));
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeFlow();
  }, [user, isInitialized]);

  // Guardar estado en localStorage cuando cambie (pero evitar loops)
  useEffect(() => {
    if (isInitialized && flowState.step !== 'loading') {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('video_creation_flow', JSON.stringify(flowState));
      }, 100); // Debounce para evitar múltiples escrituras

      return () => clearTimeout(timeoutId);
    }
  }, [flowState, isInitialized]);

  // Recargar claves API del usuario
  const loadApiKeys = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('heygen_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de navegación simplificadas
  const selectApiKey = (apiKey: HeyGenApiKey) => {
    setFlowState(prev => ({
      ...prev,
      selectedApiKey: apiKey,
      step: 'avatar',
      selectedAvatar: null,
      selectedStyle: null
    }));
  };

  const selectAvatar = (avatar: Avatar) => {
    setFlowState(prev => ({
      ...prev,
      selectedAvatar: avatar,
      step: 'style'
    }));
  };

  const selectStyle = (style: VideoStyle) => {
    setFlowState(prev => ({
      ...prev,
      selectedStyle: style,
      step: 'generator'
    }));
  };

  const goToStep = (step: FlowState['step']) => {
    setFlowState(prev => ({ ...prev, step }));
  };

  const resetFlow = () => {
    setFlowState({
      step: 'api-key',
      selectedApiKey: null,
      selectedAvatar: null,
      selectedStyle: null
    });
    localStorage.removeItem('video_creation_flow');
  };

  return {
    flowState,
    apiKeys,
    loading: loading || !isInitialized,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectStyle,
    goToStep,
    resetFlow
  };
};
