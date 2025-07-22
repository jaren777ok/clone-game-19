
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FlowState, VideoStyle, Avatar, Voice, ApiVersionCustomization, SubtitleCustomization, HeyGenApiKey, CardCustomization, PresenterCustomization, ManualCustomization } from '@/types/videoFlow';
import { getStyleInternalId } from '@/utils/styleMapping';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const defaultVideoStyles: VideoStyle[] = [
  {
    id: 'style-1',
    name: 'Estilo Noticia',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyAxLm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.qb8MJNv5fmCgCMQGOHGdyuwW04_NNJxpJgHfCTqQWb4'
  },
  {
    id: 'style-2',
    name: 'Estilo Noticiero',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%202.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyAyLm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.ZkOGHqMVTnLY6gGCxHzXUKlI_q5EKY-D8Z9xKNmP4sU'
  },
  {
    id: 'style-3',
    name: 'Estilo Educativo 1',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%203.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyAzLm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.ULKY_7QcMpw_VrRkzFO6-pfVLHCe9o5VIhJ3Jb3MjjI'
  },
  {
    id: 'style-4',
    name: 'Estilo Educativo 2',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%204.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyA0Lm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.6YBEK8ogdRLdUKrKdE2pWUkYNEOozUIoFFqHAGo3bqo'
  },
  {
    id: 'style-5',
    name: 'Manual 1',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%205.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyA1Lm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.n8K30BK5SdU6clddqOeg_ZnAnIh8J1FT9eBmz5Magog'
  },
  {
    id: 'style-6',
    name: 'Manual 2',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%206.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyA2Lm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.MnCiK4M0u6KUhDBZRyuU2nS9tAUxsGGGJdOY8HHnPAg'
  },
  {
    id: 'style-7',
    name: 'Multi Avatar',
    video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Multi-Avatar%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL011bHRpLUF2YXRhciAxLm1wNCIsImlhdCI6MTc1MzE2MjM2OCwiZXhwIjoxNzg0Njk4MzY4fQ.MTyrQzOS5hgMnhH1ag_UP2vgoIJjrfMd_wV5wRT2HO8'
  }
];

export const useVideoCreationFlow = () => {
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'loading',
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
    manualCustomization: null,
    videoStyles: defaultVideoStyles,
    apiKey: '',
    videoScript: ''
  });

  const [apiKeys, setApiKeys] = useState<HeyGenApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadApiKeys = async () => {
    if (!user?.id) return;

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
    }
  };

  useEffect(() => {
    const initializeFlow = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Inicializando flujo para usuario:', user.id);
        
        // Cargar API keys
        await loadApiKeys();
        
        // Cargar configuración guardada
        const { data: savedConfig, error } = await supabase
          .from('user_video_configs')
          .select(`
            *,
            heygen_api_keys:api_key_id (
              id,
              api_key_name,
              api_key_encrypted,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (savedConfig) {
          console.log('✅ Configuración cargada:', savedConfig);
          
          // Reconstruir el estado desde la configuración guardada
          const newFlowState: FlowState = {
            step: (savedConfig.current_step as FlowState['step']) || 'api-key',
            selectedApiKey: savedConfig.heygen_api_keys ? {
              id: savedConfig.heygen_api_keys.id,
              api_key_name: savedConfig.heygen_api_keys.api_key_name,
              api_key_encrypted: savedConfig.heygen_api_keys.api_key_encrypted,
              created_at: savedConfig.heygen_api_keys.created_at
            } : null,
            selectedAvatar: savedConfig.avatar_data ? (savedConfig.avatar_data as unknown as Avatar) : null,
            selectedSecondAvatar: savedConfig.second_avatar_data ? (savedConfig.second_avatar_data as unknown as Avatar) : null,
            selectedVoice: savedConfig.voice_data ? (savedConfig.voice_data as unknown as Voice) : null,
            selectedStyle: savedConfig.style_data ? (savedConfig.style_data as unknown as VideoStyle) : null,
            subtitleCustomization: savedConfig.subtitle_customization ? (savedConfig.subtitle_customization as unknown as SubtitleCustomization) : null,
            generatedScript: savedConfig.generated_script || null,
            cardCustomization: savedConfig.card_customization ? (savedConfig.card_customization as unknown as CardCustomization) : null,
            presenterCustomization: savedConfig.presenter_customization ? (savedConfig.presenter_customization as unknown as PresenterCustomization) : null,
            apiVersionCustomization: null,
            manualCustomization: savedConfig.manual_customization ? (savedConfig.manual_customization as unknown as ManualCustomization) : null,
            videoStyles: defaultVideoStyles,
            apiKey: savedConfig.heygen_api_keys?.api_key_encrypted || '',
            videoScript: savedConfig.generated_script || ''
          };

          setFlowState(newFlowState);
          
          // Mostrar toast de recuperación si hay progreso guardado
          if (savedConfig.current_step !== 'api-key') {
            toast({
              title: "Progreso recuperado",
              description: "Se ha cargado tu progreso anterior.",
              duration: 3000
            });
          }
        } else {
          console.log('📝 No hay configuración guardada, iniciando desde api-key');
          setFlowState(prev => ({ ...prev, step: 'api-key' }));
        }
      } catch (error) {
        console.error('❌ Error inicializando flujo:', error);
        setFlowState(prev => ({ ...prev, step: 'api-key' }));
      } finally {
        setLoading(false);
      }
    };

    initializeFlow();
  }, [user?.id, toast]);

  const saveConfiguration = async (state: FlowState) => {
    if (!user?.id) return;

    try {
      const configData = {
        user_id: user.id,
        api_key_id: state.selectedApiKey?.id || null,
        avatar_data: state.selectedAvatar ? JSON.parse(JSON.stringify(state.selectedAvatar)) : null,
        second_avatar_data: state.selectedSecondAvatar ? JSON.parse(JSON.stringify(state.selectedSecondAvatar)) : null,
        voice_data: state.selectedVoice ? JSON.parse(JSON.stringify(state.selectedVoice)) : null,
        style_data: state.selectedStyle ? JSON.parse(JSON.stringify(state.selectedStyle)) : null,
        presenter_customization: state.presenterCustomization ? JSON.parse(JSON.stringify(state.presenterCustomization)) : null,
        card_customization: state.cardCustomization ? JSON.parse(JSON.stringify(state.cardCustomization)) : null,
        subtitle_customization: state.subtitleCustomization ? JSON.parse(JSON.stringify(state.subtitleCustomization)) : null,
        generated_script: state.generatedScript || null,
        current_step: state.step,
        manual_customization: state.manualCustomization ? JSON.parse(JSON.stringify(state.manualCustomization)) : null,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Guardando configuración:', {
        userId: user.id,
        step: state.step,
        hasApiKey: !!state.selectedApiKey,
        hasAvatar: !!state.selectedAvatar,
        hasVoice: !!state.selectedVoice,
        hasStyle: !!state.selectedStyle,
        hasScript: !!state.generatedScript,
        hasSubtitleCustomization: !!state.subtitleCustomization
      });

      const { data, error } = await supabase
        .from('user_video_configs')
        .upsert(configData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Configuración guardada exitosamente:', data);
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
    }
  };

  const goToStep = (step: FlowState['step']) => {
    console.log('🔄 Navegando a paso:', step);
    const newState = { ...flowState, step };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const selectApiKey = (apiKey: HeyGenApiKey) => {
    const newState = { 
      ...flowState, 
      selectedApiKey: apiKey,
      apiKey: apiKey.api_key_encrypted
    };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Navegar automáticamente al siguiente paso
    setTimeout(() => goToStep('avatar'), 100);
  };

  const selectAvatar = (avatar: Avatar) => {
    const newState = { ...flowState, selectedAvatar: avatar };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Navegar automáticamente al siguiente paso
    setTimeout(() => goToStep('voice'), 100);
  };

  const selectSecondAvatar = (avatar: Avatar) => {
    const newState = { ...flowState, selectedSecondAvatar: avatar };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Navegar automáticamente al siguiente paso
    setTimeout(() => goToStep('subtitle-customization'), 100);
  };

  const selectVoice = (voice: Voice) => {
    const newState = { ...flowState, selectedVoice: voice };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Navegar automáticamente al siguiente paso
    setTimeout(() => goToStep('style'), 100);
  };

  const selectStyle = (style: VideoStyle) => {
    console.log('🎨 Estilo seleccionado:', style);
    const newState = { ...flowState, selectedStyle: style };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Determinar el siguiente paso según el estilo
    setTimeout(() => {
      if (style.id === 'style-7') {
        // Multi Avatar requiere selección de segundo avatar
        goToStep('multi-avatar');
      } else if (style.id === 'style-5' || style.id === 'style-6') {
        // Estilos manuales van directo a neurocopy
        goToStep('neurocopy');
      } else {
        // Otros estilos van a subtitle customization
        goToStep('subtitle-customization');
      }
    }, 100);
  };

  const selectSubtitleCustomization = (customization: SubtitleCustomization | null) => {
    console.log('🎨 Configuración de subtítulos actualizada:', customization);
    const newState = { ...flowState, subtitleCustomization: customization };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Navegar automáticamente al siguiente paso
    setTimeout(() => goToStep('neurocopy'), 100);
  };

  const selectManualCustomization = (customization: any) => {
    console.log('📝 Configuración manual actualizada:', customization);
    const newState = { ...flowState, manualCustomization: customization };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const selectGeneratedScript = (script: string) => {
    console.log('📝 Script generado seleccionado:', script?.substring(0, 100) + '...');
    
    // Aplicar límite de 955 caracteres
    const limitedScript = script.length > 955 ? script.substring(0, 955) : script;
    
    const newState = { 
      ...flowState, 
      generatedScript: limitedScript,
      videoScript: limitedScript
    };
    setFlowState(newState);
    saveConfiguration(newState);
    
    // Navegar automáticamente al generador
    setTimeout(() => goToStep('generator'), 100);
  };

  const resetFlow = () => {
    const newState: FlowState = {
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
      manualCustomization: null,
      videoStyles: defaultVideoStyles,
      apiKey: '',
      videoScript: ''
    };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  return {
    flowState,
    apiKeys,
    loading,
    loadApiKeys,
    selectApiKey,
    selectAvatar,
    selectSecondAvatar,
    selectVoice,
    selectStyle,
    selectSubtitleCustomization,
    selectManualCustomization,
    selectGeneratedScript,
    goToStep,
    resetFlow
  };
};
