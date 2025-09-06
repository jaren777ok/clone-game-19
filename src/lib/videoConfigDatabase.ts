import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { FlowState, HeyGenApiKey, Avatar, Voice, VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization, Base64File, SubtitleCustomization } from '@/types/videoFlow';

export interface VideoConfigData {
  id: string;
  user_id: string;
  api_key_id: string | null;
  avatar_data: Avatar | null;
  voice_data: Voice | null;
  style_data: VideoStyle | null;
  presenter_customization: PresenterCustomization | null;
  card_customization: CardCustomization | null;
  subtitle_customization: SubtitleCustomization | null;
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
    hasScript: !!flowState.generatedScript,
    // 🔍 DEBUG: Agregar logs detallados de subtítulos
    hasSubtitleCustomization: !!flowState.subtitleCustomization,
    subtitleCustomizationDetails: flowState.subtitleCustomization ? {
      fontFamily: flowState.subtitleCustomization.fontFamily,
      subtitleEffect: flowState.subtitleCustomization.subtitleEffect,
      textColor: flowState.subtitleCustomization.textColor,
      backgroundColor: flowState.subtitleCustomization.backgroundColor,
      hasBackgroundColor: flowState.subtitleCustomization.hasBackgroundColor
    } : null
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
        },
        // 🔍 DEBUG: Verificar que subtítulos se mantengan con manual customization
        subtitleStillExists: !!flowState.subtitleCustomization
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
      second_avatar_data: flowState.selectedSecondAvatar ? JSON.parse(JSON.stringify(flowState.selectedSecondAvatar)) : null,
      voice_data: flowState.selectedVoice ? JSON.parse(JSON.stringify(flowState.selectedVoice)) : null,
      style_data: flowState.selectedStyle ? JSON.parse(JSON.stringify(flowState.selectedStyle)) : null,
      presenter_customization: flowState.presenterCustomization ? JSON.parse(JSON.stringify(flowState.presenterCustomization)) : null,
      card_customization: flowState.cardCustomization ? JSON.parse(JSON.stringify(flowState.cardCustomization)) : null,
      subtitle_customization: flowState.subtitleCustomization ? JSON.parse(JSON.stringify(flowState.subtitleCustomization)) : null,
      generated_script: flowState.generatedScript || null,
      current_step: flowState.step,
      manual_customization: manualCustomizationData,
      updated_at: new Date().toISOString()
    };

    // 🔍 DEBUG: Verificar datos antes de guardar
    console.log('🔍 DEBUG - Datos a guardar en Supabase:', {
      subtitle_customization_exists: !!configData.subtitle_customization,
      subtitle_customization_preview: configData.subtitle_customization ? {
        fontFamily: (configData.subtitle_customization as any).fontFamily,
        subtitleEffect: (configData.subtitle_customization as any).subtitleEffect,
        textColor: (configData.subtitle_customization as any).textColor
      } : null,
      current_step: configData.current_step,
      has_manual_customization: !!configData.manual_customization,
      // 📝 DEBUG: Verificar script
      has_generated_script: !!configData.generated_script,
      generated_script_length: configData.generated_script?.length || 0,
      generated_script_preview: configData.generated_script ? configData.generated_script.substring(0, 100) + '...' : 'No script'
    });

    console.log('🔄 Ejecutando upsert en Supabase...', {
      has_manual_customization: !!configData.manual_customization,
      current_step: configData.current_step,
      has_subtitle_customization: !!configData.subtitle_customization
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
        } : null,
        subtitle_customization_debug: configData.subtitle_customization
      });
      throw error;
    }

    console.log('✅ Configuración de video guardada exitosamente:', {
      id: data?.id,
      current_step: data?.current_step,
      has_manual_customization: !!data?.manual_customization,
      has_subtitle_customization: !!data?.subtitle_customization,
      // 📝 DEBUG: Verificar script guardado
      has_generated_script: !!(data as any)?.generated_script,
      generated_script_length: (data as any)?.generated_script?.length || 0,
      manual_customization_preview: data?.manual_customization ? {
        sessionId: (data.manual_customization as any)?.sessionId,
        imagesCount: (data.manual_customization as any)?.images?.length,
        videosCount: (data.manual_customization as any)?.videos?.length
      } : null,
      // 🔍 DEBUG: Verificar que subtítulos se guardaron
      subtitle_customization_saved: data?.subtitle_customization ? {
        fontFamily: (data.subtitle_customization as any)?.fontFamily,
        subtitleEffect: (data.subtitle_customization as any)?.subtitleEffect,
        textColor: (data.subtitle_customization as any)?.textColor
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
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // Fetch API key separately if needed
    let apiKeyData = null;
    if (data?.api_key_id) {
      const { data: keyData } = await supabase
        .from('heygen_api_keys')
        .select('id, api_key_name, api_key_encrypted, created_at')
        .eq('id', data.api_key_id)
        .maybeSingle();
      apiKeyData = keyData;
    }

    if (error) {
      console.error('❌ Error cargando configuración de video:', error);
      return null;
    }

    if (!data) {
      console.log('📭 No se encontró configuración guardada');
      return null;
    }

    // 🔍 DEBUG: Verificar datos cargados desde Supabase
    console.log('🔍 DEBUG - Datos cargados desde Supabase:', {
      step: (data as any).current_step,
      hasApiKey: !!apiKeyData,
      hasAvatar: !!(data as any).avatar_data,
      hasVoice: !!(data as any).voice_data,
      hasStyle: !!(data as any).style_data,
      hasManualCustomization: !!(data as any).manual_customization,
      hasSubtitleCustomization: !!(data as any).subtitle_customization,
      // 📝 DEBUG: Verificar script cargado
      hasGeneratedScript: !!(data as any).generated_script,
      generatedScriptLength: (data as any).generated_script?.length || 0,
      generatedScriptPreview: (data as any).generated_script ? (data as any).generated_script.substring(0, 100) + '...' : 'No script',
      subtitleCustomizationRaw: (data as any).subtitle_customization,
      subtitleCustomizationPreview: (data as any).subtitle_customization ? {
        fontFamily: ((data as any).subtitle_customization as any)?.fontFamily,
        subtitleEffect: ((data as any).subtitle_customization as any)?.subtitleEffect,
        textColor: ((data as any).subtitle_customization as any)?.textColor,
        backgroundColor: ((data as any).subtitle_customization as any)?.backgroundColor,
        hasBackgroundColor: ((data as any).subtitle_customization as any)?.hasBackgroundColor
      } : null
    });

    console.log('✅ Configuración cargada exitosamente:', {
      step: (data as any).current_step,
      hasApiKey: !!apiKeyData,
      hasAvatar: !!(data as any).avatar_data,
      hasVoice: !!(data as any).voice_data,
      hasStyle: !!(data as any).style_data,
      hasManualCustomization: !!(data as any).manual_customization,
      hasSubtitleCustomization: !!(data as any).subtitle_customization
    });

    // Reconstruct manual customization with base64 files from Supabase
    let manualCustomization: ManualCustomization | null = null;
    if ((data as any).manual_customization) {
      const manualData = (data as any).manual_customization as any;
      manualCustomization = {
        images: manualData.images || [],
        videos: manualData.videos || [],
        sessionId: manualData.sessionId
      };

      // 🔍 DEBUG: Verificar archivos manuales cargados
      console.log('🔍 DEBUG - Manual customization cargada:', {
        sessionId: manualCustomization.sessionId,
        imagesCount: manualCustomization.images.length,
        videosCount: manualCustomization.videos.length
      });
    }

    // 🔍 DEBUG: Verificar subtitle customization antes de crear FlowState
    const subtitleCustomization = (data as any).subtitle_customization ? (data as any).subtitle_customization as unknown as SubtitleCustomization : null;
    
    console.log('🔍 DEBUG - Subtitle customization convertida:', {
      exists: !!subtitleCustomization,
      data: subtitleCustomization
    });

    // Reconstruir el FlowState desde los datos de la DB
    const flowState: FlowState = {
      step: (data as any).current_step as FlowState['step'],
      selectedApiKey: apiKeyData,
      selectedAvatar: (data as any).avatar_data ? (data as any).avatar_data as unknown as Avatar : null,
      selectedSecondAvatar: (data as any).second_avatar_data ? (data as any).second_avatar_data as unknown as Avatar : null,
      selectedVoice: (data as any).voice_data ? (data as any).voice_data as unknown as Voice : null,
      selectedStyle: (data as any).style_data ? (data as any).style_data as unknown as VideoStyle : null,
      subtitleCustomization: subtitleCustomization,
      generatedScript: (data as any).generated_script,
      cardCustomization: (data as any).card_customization ? (data as any).card_customization as unknown as CardCustomization : null,
      presenterCustomization: (data as any).presenter_customization ? (data as any).presenter_customization as unknown as PresenterCustomization : null,
      apiVersionCustomization: null, // Not persisted in DB, only in localStorage
      manualCustomization
    };

    // 🔍 DEBUG: Verificar FlowState final
    console.log('🔍 DEBUG - FlowState final construido:', {
      step: flowState.step,
      hasSubtitleCustomization: !!flowState.subtitleCustomization,
      subtitleCustomizationFinal: flowState.subtitleCustomization,
      hasManualCustomization: !!flowState.manualCustomization
    });

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
