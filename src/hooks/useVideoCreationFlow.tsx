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

  // Función mejorada para determinar el paso inicial correcto
  const determineInitialStep = (savedState: FlowState | null, availableKeys: HeyGenApiKey[]) => {
    // Si no hay claves API disponibles, ir a configuración de API
    if (availableKeys.length === 0) {
      return {
        ...flowState,
        step: 'api-key' as const,
        selectedApiKey: null,
        selectedAvatar: null,
        selectedStyle: null
      };
    }

    // Si hay un estado guardado válido, verificar configuraciones
    if (savedState) {
      // Verificar si la clave API guardada todavía existe
      const savedKeyExists = savedState.selectedApiKey && 
        availableKeys.some(key => key.id === savedState.selectedApiKey?.id);
      
      if (savedKeyExists) {
        // Solo ir directamente al generador si está específicamente en ese paso
        // y tiene todas las selecciones completas
        if (savedState.step === 'generator' && 
            savedState.selectedApiKey && 
            savedState.selectedAvatar && 
            savedState.selectedStyle) {
          return {
            ...savedState,
            step: 'generator' as const
          };
        }
        
        // En todos los demás casos, ir al paso correspondiente pero conservar selecciones previas
        if (savedState.selectedApiKey && savedState.selectedAvatar && savedState.selectedStyle) {
          // Si tiene todo pero no está en generator, ir a style para permitir revisión
          return {
            ...savedState,
            step: 'style' as const
          };
        } else if (savedState.selectedApiKey && savedState.selectedAvatar) {
          // Si tiene clave y avatar, ir a style
          return {
            ...savedState,
            step: 'style' as const
          };
        } else if (savedState.selectedApiKey) {
          // Si solo tiene clave, ir a avatar pero conservar la clave seleccionada
          return {
            ...savedState,
            step: 'avatar' as const,
            selectedAvatar: null, // Resetear avatar para forzar nueva selección
            selectedStyle: null   // Resetear estilo también
          };
        }
      }
    }

    // Si hay claves disponibles pero no hay estado válido, mostrar selección de clave
    return {
      ...flowState,
      step: 'api-key' as const,
      selectedApiKey: null,
      selectedAvatar: null,
      selectedStyle: null
    };
  };

  // Cargar estado del localStorage al inicializar
  useEffect(() => {
    const initializeFlow = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Cargar claves API primero
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

        // Determinar el paso inicial correcto
        const initialState = determineInitialStep(parsedState, keys);
        setFlowState(initialState);

      } catch (error) {
        console.error('Error initializing flow:', error);
        setFlowState(prev => ({ ...prev, step: 'api-key' }));
      } finally {
        setLoading(false);
      }
    };

    initializeFlow();
  }, [user]);

  // Guardar estado en localStorage cuando cambie (pero no en loading)
  useEffect(() => {
    if (flowState.step !== 'loading') {
      localStorage.setItem('video_creation_flow', JSON.stringify(flowState));
    }
  }, [flowState]);

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

  // Funciones mejoradas para navegar en el flujo
  const selectApiKey = (apiKey: HeyGenApiKey) => {
    setFlowState(prev => ({
      ...prev,
      selectedApiKey: apiKey,
      step: 'avatar',
      // Resetear selecciones posteriores para forzar nueva selección
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
    loading,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectStyle,
    goToStep,
    resetFlow
  };
};
