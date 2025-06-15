
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
  step: 'api-key' | 'avatar' | 'style' | 'generator';
  selectedApiKey: HeyGenApiKey | null;
  selectedAvatar: Avatar | null;
  selectedStyle: VideoStyle | null;
}

export const useVideoCreationFlow = () => {
  const { user } = useAuth();
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'api-key',
    selectedApiKey: null,
    selectedAvatar: null,
    selectedStyle: null
  });
  const [apiKeys, setApiKeys] = useState<HeyGenApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar estado del localStorage al inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setFlowState(parsed);
      } catch (error) {
        console.error('Error parsing saved flow state:', error);
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('video_creation_flow', JSON.stringify(flowState));
  }, [flowState]);

  // Cargar claves API del usuario
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

      // Si hay claves guardadas y no hay una seleccionada, ir a selección
      if (data && data.length > 0 && !flowState.selectedApiKey) {
        setFlowState(prev => ({ ...prev, step: 'api-key' }));
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para navegar en el flujo
  const selectApiKey = (apiKey: HeyGenApiKey) => {
    setFlowState(prev => ({
      ...prev,
      selectedApiKey: apiKey,
      step: 'avatar'
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
