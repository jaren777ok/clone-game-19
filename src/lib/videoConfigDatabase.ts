
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { FlowState, HeyGenApiKey, Avatar, Voice, VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization } from '@/types/videoFlow';

export interface VideoConfigData {
  id: string;
  user_id: string;
  api_key_id: string | null;
  avatar_data: Avatar | null;
  voice_data: Voice | null;
  style_data: VideoStyle | null;
  presenter_customization: PresenterCustomization | null;
  card_customization: CardCustomization | null;
  generated_script: string | null;
  current_step: FlowState['step'];
  created_at: string;
  updated_at: string;
}

export const saveVideoConfig = async (user: User, flowState: FlowState): Promise<void> => {
  if (!user) {
    console.warn('No user provided to saveVideoConfig');
    return;
  }

  console.log('💾 Guardando configuración de video en Supabase:', {
    userId: user.id,
    step: flowState.step,
    hasApiKey: !!flowState.selectedApiKey,
    hasAvatar: !!flowState.selectedAvatar,
    hasVoice: !!flowState.selectedVoice,
    hasStyle: !!flowState.selectedStyle,
    hasScript: !!flowState.generatedScript
  });

  try {
    // For manual customization, save only metadata (not File objects)
    let manualCustomizationData = null;
    if (flowState.manualCustomization) {
      manualCustomizationData = {
        sessionId: flowState.manualCustomization.sessionId,
        imageCount: flowState.manualCustomization.images.length,
        videoCount: flowState.manualCustomization.videos.length,
        imageNames: flowState.manualCustomization.images.map(f => f.name),
        videoNames: flowState.manualCustomization.videos.map(f => f.name)
      };
    }

    const configData = {
      user_id: user.id,
      api_key_id: flowState.selectedApiKey?.id || null,
      avatar_data: flowState.selectedAvatar ? JSON.parse(JSON.stringify(flowState.selectedAvatar)) : null,
      voice_data: flowState.selectedVoice ? JSON.parse(JSON.stringify(flowState.selectedVoice)) : null,
      style_data: flowState.selectedStyle ? JSON.parse(JSON.stringify(flowState.selectedStyle)) : null,
      presenter_customization: flowState.presenterCustomization ? JSON.parse(JSON.stringify(flowState.presenterCustomization)) : null,
      card_customization: flowState.cardCustomization ? JSON.parse(JSON.stringify(flowState.cardCustomization)) : null,
      generated_script: flowState.generatedScript || null,
      current_step: flowState.step,
      manual_customization: manualCustomizationData,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_video_configs')
      .upsert(configData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ Error guardando configuración de video:', error);
      throw error;
    }

    console.log('✅ Configuración de video guardada exitosamente');
  } catch (error) {
    console.error('💥 Error inesperado guardando configuración:', error);
    throw error;
  }
};

export const loadVideoConfig = async (user: User | null): Promise<FlowState | null> => {
  if (!user) {
    console.log('⚠️ No hay usuario autenticado para cargar configuración');
    return null;
  }

  console.log('📖 Cargando configuración de video desde Supabase:', {
    userId: user.id
  });

  try {
    const { data, error } = await supabase
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

    if (error) {
      console.error('❌ Error cargando configuración de video:', error);
      return null;
    }

    if (!data) {
      console.log('📭 No se encontró configuración guardada');
      return null;
    }

    console.log('✅ Configuración cargada exitosamente:', {
      step: data.current_step,
      hasApiKey: !!data.heygen_api_keys,
      hasAvatar: !!data.avatar_data,
      hasVoice: !!data.voice_data,
      hasStyle: !!data.style_data,
      hasManualCustomization: !!data.manual_customization
    });

    // Reconstruct manual customization with sessionId but empty File arrays
    let manualCustomization: ManualCustomization | null = null;
    if (data.manual_customization) {
      const manualData = data.manual_customization as any;
      manualCustomization = {
        images: [], // Will be loaded from localStorage later
        videos: [], // Will be loaded from localStorage later
        sessionId: manualData.sessionId
      };
    }

    // Reconstruir el FlowState desde los datos de la DB
    const flowState: FlowState = {
      step: data.current_step as FlowState['step'],
      selectedApiKey: data.heygen_api_keys ? {
        id: data.heygen_api_keys.id,
        api_key_name: data.heygen_api_keys.api_key_name,
        api_key_encrypted: data.heygen_api_keys.api_key_encrypted,
        created_at: data.heygen_api_keys.created_at
      } : null,
      selectedAvatar: data.avatar_data ? data.avatar_data as unknown as Avatar : null,
      selectedVoice: data.voice_data ? data.voice_data as unknown as Voice : null,
      selectedStyle: data.style_data ? data.style_data as unknown as VideoStyle : null,
      generatedScript: data.generated_script,
      cardCustomization: data.card_customization ? data.card_customization as unknown as CardCustomization : null,
      presenterCustomization: data.presenter_customization ? data.presenter_customization as unknown as PresenterCustomization : null,
      apiVersionCustomization: null, // Not persisted in DB, only in localStorage
      manualCustomization
    };

    return flowState;
  } catch (error) {
    console.error('💥 Error inesperado cargando configuración:', error);
    return null;
  }
};

export const clearVideoConfig = async (user: User | null): Promise<void> => {
  if (!user) {
    console.warn('No user provided to clearVideoConfig');
    return;
  }

  console.log('🗑️ Eliminando configuración de video de Supabase:', {
    userId: user.id
  });

  try {
    const { error } = await supabase
      .from('user_video_configs')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error eliminando configuración de video:', error);
      throw error;
    }

    console.log('✅ Configuración de video eliminada exitosamente');
  } catch (error) {
    console.error('💥 Error inesperado eliminando configuración:', error);
    throw error;
  }
};
