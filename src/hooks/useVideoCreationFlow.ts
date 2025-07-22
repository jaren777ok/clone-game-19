import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FlowState, VideoStyle, Avatar, Voice, ApiVersionCustomization, SubtitleCustomization } from '@/types/videoFlow';
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
    step: 'api-key',
    videoStyles: defaultVideoStyles,
    apiKey: '',
    selectedAvatar: null,
    selectedVoice: null,
    selectedStyle: null,
    videoScript: '',
    subtitleCustomization: null,
    manualCustomization: null,
    selectedSecondAvatar: null
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadSavedConfiguration = async () => {
      if (!user?.id) return;

      try {
        console.log('🔄 Cargando configuración guardada para usuario:', user.id);
        
        const { data: savedConfig, error } = await supabase
          .from('video_configurations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('📝 No hay configuración guardada, iniciando desde cero');
            return;
          }
          throw error;
        }

        if (savedConfig) {
          console.log('✅ Configuración cargada:', savedConfig);
          
          // Reconstruir el estado desde la configuración guardada
          const newFlowState: FlowState = {
            step: savedConfig.current_step || 'api-key',
            videoStyles: defaultVideoStyles,
            apiKey: '', // No guardar API key por seguridad
            selectedAvatar: savedConfig.selected_avatar || null,
            selectedVoice: savedConfig.selected_voice || null,
            selectedStyle: savedConfig.selected_style || null,
            videoScript: savedConfig.video_script || '',
            subtitleCustomization: savedConfig.subtitle_customization_saved || null,
            manualCustomization: savedConfig.manual_customization_preview || null,
            selectedSecondAvatar: savedConfig.selected_second_avatar || null
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
        }
      } catch (error) {
        console.error('❌ Error cargando configuración:', error);
      }
    };

    loadSavedConfiguration();
  }, [user?.id, toast]);

  const saveConfiguration = async (state: FlowState) => {
    if (!user?.id) return;

    try {
      const configData = {
        user_id: user.id,
        current_step: state.step,
        selected_avatar: state.selectedAvatar,
        selected_voice: state.selectedVoice,
        selected_style: state.selectedStyle,
        video_script: state.videoScript,
        subtitle_customization_saved: state.subtitleCustomization,
        manual_customization_preview: state.manualCustomization,
        selected_second_avatar: state.selectedSecondAvatar,
        has_subtitle_customization: !!state.subtitleCustomization,
        has_manual_customization: !!state.manualCustomization
      };

      console.log('💾 Guardando configuración de video en Supabase:', {
        userId: user.id,
        step: state.step,
        hasApiKey: !!state.apiKey,
        hasAvatar: !!state.selectedAvatar,
        hasVoice: !!state.selectedVoice,
        hasStyle: !!state.selectedStyle,
        hasScript: !!state.videoScript,
        hasSubtitleCustomization: !!state.subtitleCustomization,
        subtitleCustomizationDetails: state.subtitleCustomization
      });

      const debugData = {
        subtitle_customization_exists: !!state.subtitleCustomization,
        subtitle_customization_preview: state.subtitleCustomization ? {
          fontFamily: state.subtitleCustomization.fontFamily,
          subtitleEffect: state.subtitleCustomization.subtitleEffect,
          textColor: state.subtitleCustomization.textColor
        } : null,
        current_step: state.step,
        has_manual_customization: !!state.manualCustomization
      };
      
      console.log('🔍 DEBUG - Datos a guardar en Supabase:', debugData);

      console.log('🔄 Ejecutando upsert en Supabase...', {
        has_manual_customization: !!state.manualCustomization,
        current_step: state.step,
        has_subtitle_customization: !!state.subtitleCustomization
      });

      const { data, error } = await supabase
        .from('video_configurations')
        .upsert(configData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Configuración de video guardada exitosamente:', data);
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
    }
  };

  const navigateToStep = (step: FlowState['step']) => {
    console.log('🔄 Navegando a paso:', step);
    const newState = { ...flowState, step };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const setApiKey = (apiKey: string) => {
    const newState = { ...flowState, apiKey };
    setFlowState(newState);
    // No guardamos la API key por seguridad
  };

  const selectAvatar = (avatar: Avatar) => {
    const newState = { ...flowState, selectedAvatar: avatar };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const selectVoice = (voice: Voice) => {
    const newState = { ...flowState, selectedVoice: voice };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const selectStyle = (style: VideoStyle) => {
    console.log('🎨 Estilo seleccionado:', style);
    const newState = { ...flowState, selectedStyle: style };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const setVideoScript = (script: string) => {
    const newState = { ...flowState, videoScript: script };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const setSubtitleCustomization = (customization: SubtitleCustomization | null) => {
    console.log('🎨 Configuración de subtítulos actualizada:', customization);
    const newState = { ...flowState, subtitleCustomization: customization };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const setManualCustomization = (customization: any) => {
    console.log('📝 Configuración manual actualizada:', customization);
    const newState = { ...flowState, manualCustomization: customization };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const selectSecondAvatar = (avatar: Avatar) => {
    const newState = { ...flowState, selectedSecondAvatar: avatar };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const goBack = () => {
    const currentStep = flowState.step;
    console.log('⬅️ Retrocediendo desde:', currentStep);
    
    // Multi-Avatar: Manejar retroceso específico
    if (currentStep === 'multi-avatar') {
      console.log('🔄 Multi-Avatar: Regresando a subtitle-customization desde multi-avatar');
      navigateToStep('subtitle-customization');
      return;
    }
    
    // Subtitle Customization: Retroceder según el estilo
    if (currentStep === 'subtitle-customization') {
      console.log('🔄 Multi-Avatar: Regresando a multi-avatar desde subtitle-customization');
      navigateToStep('multi-avatar'); // Cambiado: siempre va a multi-avatar
      return;
    }

    // Resto de casos existentes
    const stepOrder: FlowState['step'][] = [
      'api-key',
      'avatar',
      'voice', 
      'style',
      'subtitle-customization',
      'multi-avatar',
      'script'
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      navigateToStep(stepOrder[currentIndex - 1]);
    }
  };

  const resetFlow = () => {
    const newState: FlowState = {
      step: 'api-key',
      videoStyles: defaultVideoStyles,
      apiKey: '',
      selectedAvatar: null,
      selectedVoice: null,
      selectedStyle: null,
      videoScript: '',
      subtitleCustomization: null,
      manualCustomization: null,
      selectedSecondAvatar: null
    };
    setFlowState(newState);
    saveConfiguration(newState);
  };

  const canProceedToScript = () => {
    const { apiKey, selectedAvatar, selectedVoice, selectedStyle, subtitleCustomization, selectedSecondAvatar } = flowState;
    
    const hasBasics = !!(apiKey && selectedAvatar && selectedVoice && selectedStyle);
    
    // Para estilos que requieren segundo avatar
    if (selectedStyle?.id === 'style-7') {
      return hasBasics && !!selectedSecondAvatar && !!subtitleCustomization;
    }
    
    // Para otros estilos
    return hasBasics && !!subtitleCustomization;
  };

  return {
    flowState,
    navigateToStep,
    setApiKey,
    selectAvatar,
    selectVoice,
    selectStyle,
    setVideoScript,
    setSubtitleCustomization,
    setManualCustomization,
    selectSecondAvatar,
    goBack,
    resetFlow,
    canProceedToScript,
    getStyleInternalId: (style: VideoStyle) => getStyleInternalId(style)
  };
};
