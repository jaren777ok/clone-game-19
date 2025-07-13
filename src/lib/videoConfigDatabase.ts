
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { FlowState, HeyGenApiKey, Avatar, Voice, VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization, Base64File } from '@/types/videoFlow';

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
    // For manual customization, save complete base64 files in Supabase
    let manualCustomizationData = null;
    if (flowState.manualCustomization) {
      const totalSize = flowState.manualCustomization.images.reduce((acc, img) => acc + img.size, 0) + 
                       flowState.manualCustomization.videos.reduce((acc, vid) => acc + vid.size, 0);
      
      console.log('📁 Preparando datos de configuración manual:', {
        images: flowState.manualCustomization.images.length,
        videos: flowState.manualCustomization.videos.length,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        sessionId: flowState.manualCustomization.sessionId,
        base64DataPreview: {
          firstImageSize: flowState.manualCustomization.images[0]?.data.length || 0,
          firstVideoSize: flowState.manualCustomization.videos[0]?.data.length || 0
        }
      });

      manualCustomizationData = {
        sessionId: flowState.manualCustomization.sessionId,
        images: flowState.manualCustomization.images,
        videos: flowState.manualCustomization.videos
      };
      
      // Validate total size (warn if > 50MB)
      if (totalSize > 50 * 1024 * 1024) {
        console.warn('⚠️ Archivos muy grandes - tamaño total:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
      }

      // Validate that we actually have base64 data
      const hasValidData = manualCustomizationData.images.some(img => img.data && img.data.length > 0) || 
                          manualCustomizationData.videos.some(vid => vid.data && vid.data.length > 0);
      
      if (!hasValidData) {
        throw new Error('No se encontraron datos base64 válidos en los archivos');
      }

      console.log('✅ Datos de configuración manual validados correctamente');
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

    console.log('🔄 Ejecutando upsert en Supabase...', {
      has_manual_customization: !!configData.manual_customization,
      current_step: configData.current_step
    });
    
    const { data, error } = await supabase
      .from('user_video_configs')
      .upsert(configData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando configuración de video:', error);
      console.error('📋 Datos que se intentaron guardar:', {
        ...configData,
        manual_customization: configData.manual_customization ? {
          sessionId: configData.manual_customization.sessionId,
          imagesCount: configData.manual_customization.images?.length,
          videosCount: configData.manual_customization.videos?.length,
          firstImageDataLength: configData.manual_customization.images?.[0]?.data?.length
        } : null
      });
      throw error;
    }

    console.log('✅ Configuración de video guardada exitosamente:', {
      id: data?.id,
      current_step: data?.current_step,
      has_manual_customization: !!data?.manual_customization,
      manual_customization_preview: data?.manual_customization ? {
        sessionId: (data.manual_customization as any)?.sessionId,
        imagesCount: (data.manual_customization as any)?.images?.length,
        videosCount: (data.manual_customization as any)?.videos?.length
      } : null
    });
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

    // Reconstruct manual customization with base64 files from Supabase
    let manualCustomization: ManualCustomization | null = null;
    if (data.manual_customization) {
      const manualData = data.manual_customization as any;
      manualCustomization = {
        images: manualData.images || [],
        videos: manualData.videos || [],
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
