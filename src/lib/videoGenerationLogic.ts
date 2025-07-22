
import { User } from '@supabase/supabase-js';
import { FlowState } from '@/types/videoFlow';
import { saveGenerationState } from '@/lib/videoGeneration';
import { sendToWebhook, sendToEstiloNoticiaWebhook, sendToEstiloEducativoWebhook, sendToEducativo2Webhook, sendToManualWebhook, sendToManualWebhook2, sendToMultiAvatarWebhook } from '@/lib/webhookUtils';

export const validateFlowState = (flowState?: FlowState): boolean => {
  if (!flowState) return false;
  
  // For manual styles (style-5 and style-6), don't require apiVersionCustomization
  if (flowState.selectedStyle?.id === 'style-5' || flowState.selectedStyle?.id === 'style-6') {
    return !!(
      flowState.selectedApiKey &&
      flowState.selectedAvatar &&
      flowState.selectedVoice &&
      flowState.selectedStyle
    );
  }
  
  // For multi-avatar style (style-7), require both avatars
  if (flowState.selectedStyle?.id === 'style-7') {
    return !!(
      flowState.selectedApiKey &&
      flowState.selectedAvatar &&
      flowState.selectedSecondAvatar &&
      flowState.selectedVoice &&
      flowState.selectedStyle &&
      flowState.subtitleCustomization
    );
  }
  
  // All other styles require subtitleCustomization
  return !!(
    flowState.selectedApiKey &&
    flowState.selectedAvatar &&
    flowState.selectedVoice &&
    flowState.selectedStyle &&
    flowState.subtitleCustomization
  );
};

export const initiateVideoGeneration = async (
  script: string,
  user: User | null,
  flowState: FlowState,
  toast: any,
  requestId: string  // ← RECIBIR EL REQUEST ID ya generado
): Promise<{ requestId: string }> => {
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // 🔍 DEBUG: Verificar que recibimos el requestId correcto
  console.log('🔍 DEBUG - initiateVideoGeneration START con requestId recibido:', {
    requestId: requestId,
    userId: user.id,
    selectedStyle: flowState.selectedStyle?.id,
    hasSubtitleCustomization: !!flowState.subtitleCustomization,
    subtitleCustomizationFull: flowState.subtitleCustomization,
    subtitleCustomizationPreview: flowState.subtitleCustomization ? {
      fontFamily: flowState.subtitleCustomization.fontFamily,
      subtitleEffect: flowState.subtitleCustomization.subtitleEffect,
      textColor: flowState.subtitleCustomization.textColor,
      backgroundColor: flowState.subtitleCustomization.backgroundColor,
      hasBackgroundColor: flowState.subtitleCustomization.hasBackgroundColor,
      Tamañofuente: flowState.subtitleCustomization.Tamañofuente,
      'Fixed size': flowState.subtitleCustomization['Fixed size'],
      fill: flowState.subtitleCustomization.fill
    } : null
  });

  // REMOVIDO: Ya no generamos requestId aquí, usamos el que recibimos
  // const timestamp = Date.now();
  // const random = Math.random().toString(36).substring(2, 8);
  // const requestId = `${timestamp}-${random}`;
  
  // Extraer timestamp del requestId para logging
  const timestamp = parseInt(requestId.split('-')[0]);
  
  // Desencriptar la clave API
  let decryptedApiKey: string;
  try {
    decryptedApiKey = atob(flowState.selectedApiKey!.api_key_encrypted);
    console.log('🔓 Clave API desencriptada correctamente:', {
      requestId: requestId,
      encryptedKeyPreview: flowState.selectedApiKey!.api_key_encrypted.substring(0, 20) + '...',
      decryptedKeyPreview: decryptedApiKey.substring(0, 8) + '...',
      decryptedKeyLength: decryptedApiKey.length
    });
  } catch (error) {
    console.error('❌ Error desencriptando la clave API:', error);
    throw new Error('Error al procesar la clave API');
  }

  if (!decryptedApiKey || decryptedApiKey.length === 0) {
    console.error('❌ Clave API desencriptada está vacía');
    throw new Error('Clave API inválida después de desencriptar');
  }
  
  console.log('🎬 Iniciando generación de video (usando requestId del tracking):', {
    requestId: requestId,
    timestamp: timestamp,
    timestampDate: new Date(timestamp).toISOString(),
    userId: user.id,
    scriptLength: script.length,
    selectedApiKey: flowState.selectedApiKey?.api_key_name,
    selectedAvatar: flowState.selectedAvatar?.avatar_name,
    selectedVoice: flowState.selectedVoice?.voice_name,
    selectedStyle: flowState.selectedStyle?.name,
    presenterName: flowState.presenterCustomization?.nombrePresentador,
    cardCustomization: flowState.cardCustomization,
    apiKeyDecrypted: true,
    // 🔍 DEBUG: Verificar subtítulos en el log principal
    hasSubtitleCustomization: !!flowState.subtitleCustomization
  });

  // Preparar payload base con clave API desencriptada y requestId sincronizado
  const basePayload = {
    script: script.trim(),
    userId: user.id,
    requestId: requestId, // ← USAR EL REQUEST ID RECIBIDO
    timestamp: new Date(timestamp).toISOString(),
    appMode: "produccion",
    ClaveAPI: decryptedApiKey, // Usando la clave desencriptada
    AvatarID: flowState.selectedAvatar!.avatar_id,
    VoiceID: flowState.selectedVoice!.voice_id,
    Estilo: flowState.selectedStyle!.id,
    nombrePresentador: flowState.presenterCustomization?.nombrePresentador || flowState.selectedAvatar!.avatar_name,
    width: flowState.apiVersionCustomization?.width || 1280,
    height: flowState.apiVersionCustomization?.height || 720,
    // Personalización de subtítulos (para todos los estilos)
    subtitleCustomization: flowState.subtitleCustomization ? {
      fontFamily: flowState.subtitleCustomization.fontFamily || "",
      subtitleEffect: flowState.subtitleCustomization.subtitleEffect || "",
      placementEffect: flowState.subtitleCustomization.placementEffect || "",
      textTransform: flowState.subtitleCustomization.textTransform || "",
      backgroundColor: flowState.subtitleCustomization.hasBackgroundColor 
        ? flowState.subtitleCustomization.backgroundColor 
        : "",
      textColor: flowState.subtitleCustomization.textColor || "",
      Tamañofuente: flowState.subtitleCustomization.Tamañofuente || 700,
      "Fixed size": flowState.subtitleCustomization["Fixed size"] || 5.5,
      fill: flowState.subtitleCustomization.fill || ""
    } : null,
    // Campo split para todos los webhooks
    split: flowState.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
  };

  // 🔍 DEBUG: Verificar payload completo antes de enviar
  console.log('🔍 DEBUG - Payload completo preparado con requestId sincronizado:', {
    requestId: requestId,
    hasSubtitleCustomization: !!basePayload.subtitleCustomization,
    subtitleCustomizationPayload: basePayload.subtitleCustomization,
    Estilo: basePayload.Estilo,
    split: basePayload.split
  });

  // Guardar estado de generación en localStorage (solo para UI)
  saveGenerationState({
    requestId,
    script: script.trim(),
    timestamp,
    status: 'pending'
  });

  // Determinar webhook según el estilo
  let webhookType = 'veroia'; // default
  if (flowState.selectedStyle!.id === 'style-1') {
    webhookType = 'Estilo1';
  } else if (flowState.selectedStyle!.id === 'style-3') {
    webhookType = 'ESTILO_EDUCATIVO1';
  } else if (flowState.selectedStyle!.id === 'style-4') {
    webhookType = 'EDUCATIVO_2';
  } else if (flowState.selectedStyle!.id === 'style-5') {
    webhookType = 'MANUAL';
  } else if (flowState.selectedStyle!.id === 'style-2') {
    webhookType = 'veroia';
  } else if (flowState.selectedStyle!.id === 'style-6') {
    webhookType = 'MANUAL2';
  } else if (flowState.selectedStyle!.id === 'style-7') {
    webhookType = 'MultiAvatar';
  }

  console.log('📤 Enviando payload al webhook con requestId sincronizado:', {
    requestId: requestId,
    webhook: webhookType,
    payloadSize: JSON.stringify(basePayload).length,
    presenterName: basePayload.nombrePresentador,
    apiKeyUsed: decryptedApiKey.substring(0, 8) + '...',
    // 🔍 DEBUG: Verificar subtítulos antes de envío
    hasSubtitleCustomization: !!basePayload.subtitleCustomization,
    subtitleFields: basePayload.subtitleCustomization ? Object.keys(basePayload.subtitleCustomization) : []
  });

  try {
    // Enviar a webhook y esperar confirmación
    let webhookConfirmed = false;
    
    if (flowState.selectedStyle!.id === 'style-1') {
      // Estilo Noticia
      const noticiaPayload = {
        ...basePayload,
        fecha: flowState.cardCustomization?.fecha || new Date().toLocaleDateString('es-ES'),
        titulo: flowState.cardCustomization?.titulo || 'Noticia importante',
        subtitulo: flowState.cardCustomization?.subtitulo || 'Información relevante'
      };
      
      console.log('📰 Enviando a webhook Estilo Noticia con requestId sincronizado:', {
        requestId: requestId,
        fecha: noticiaPayload.fecha,
        titulo: noticiaPayload.titulo,
        subtitulo: noticiaPayload.subtitulo,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      
      webhookConfirmed = await sendToEstiloNoticiaWebhook(noticiaPayload);
    } else if (flowState.selectedStyle!.id === 'style-3') {
      // Estilo Educativo 1
      console.log('🎓 Enviando a webhook Estilo Educativo 1 con requestId sincronizado:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      webhookConfirmed = await sendToEstiloEducativoWebhook(basePayload);
    } else if (flowState.selectedStyle!.id === 'style-4') {
      // Estilo Educativo 2
      console.log('🎓 Enviando a webhook Estilo Educativo 2 con requestId sincronizado:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      webhookConfirmed = await sendToEducativo2Webhook(basePayload);
    } else if (flowState.selectedStyle!.id === 'style-5') {
      // Estilo Manual - sin nombre del presentador
      if (!flowState.manualCustomization?.images || !flowState.manualCustomization?.videos) {
        throw new Error('Archivos requeridos para Estilo Manual no encontrados');
      }
      
      // Crear payload especial para manual sin nombrePresentador
      const manualPayload = {
        script: script.trim(),
        userId: user.id,
        requestId: requestId, // ← USAR EL REQUEST ID SINCRONIZADO
        timestamp: new Date(timestamp).toISOString(),
        appMode: "produccion",
        ClaveAPI: decryptedApiKey,
        AvatarID: flowState.selectedAvatar!.avatar_id,
        VoiceID: flowState.selectedVoice!.voice_id,
        Estilo: flowState.selectedStyle!.id,
        width: flowState.apiVersionCustomization?.width || 1280,
        height: flowState.apiVersionCustomization?.height || 720,
        // 🔍 DEBUG: CRÍTICO - Personalización de subtítulos para estilo manual
        subtitleCustomization: flowState.subtitleCustomization ? {
          fontFamily: flowState.subtitleCustomization.fontFamily || "",
          subtitleEffect: flowState.subtitleCustomization.subtitleEffect || "",
          placementEffect: flowState.subtitleCustomization.placementEffect || "",
          textTransform: flowState.subtitleCustomization.textTransform || "",
          backgroundColor: flowState.subtitleCustomization.hasBackgroundColor 
            ? flowState.subtitleCustomization.backgroundColor 
            : "",
          textColor: flowState.subtitleCustomization.textColor || "",
          Tamañofuente: flowState.subtitleCustomization.Tamañofuente || 700,
          "Fixed size": flowState.subtitleCustomization["Fixed size"] || 5.5,
          fill: flowState.subtitleCustomization.fill || ""
        } : null,
        // Campo split para estilo manual
        split: flowState.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
      };

      // 🔍 DEBUG: Verificar payload manual específicamente
      console.log('🔍 DEBUG - MANUAL Payload con requestId sincronizado:', {
        requestId: requestId,
        hasSubtitleCustomization: !!manualPayload.subtitleCustomization,
        subtitleCustomizationComplete: manualPayload.subtitleCustomization,
        split: manualPayload.split,
        payloadKeys: Object.keys(manualPayload)
      });
      
      console.log('📁 Enviando a webhook Estilo Manual con requestId sincronizado:', {
        requestId: requestId,
        imagesCount: flowState.manualCustomization.images.length,
        videosCount: flowState.manualCustomization.videos.length,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...',
        // 🔍 DEBUG: Confirmar subtítulos en el log
        hasSubtitleCustomization: !!manualPayload.subtitleCustomization,
        subtitleEffect: manualPayload.subtitleCustomization?.subtitleEffect,
        fontFamily: manualPayload.subtitleCustomization?.fontFamily,
        textColor: manualPayload.subtitleCustomization?.textColor
      });
      
      webhookConfirmed = await sendToManualWebhook(
        manualPayload, 
        flowState.manualCustomization.sessionId
      );
    } else if (flowState.selectedStyle!.id === 'style-6') {
      // Estilo Manual 2 - sin nombre del presentador
      if (!flowState.manualCustomization?.images || !flowState.manualCustomization?.videos) {
        throw new Error('Archivos requeridos para Estilo Manual 2 no encontrados');
      }
      
      // Crear payload especial para manual 2 sin nombrePresentador
      const manual2Payload = {
        script: script.trim(),
        userId: user.id,
        requestId: requestId, // ← USAR EL REQUEST ID SINCRONIZADO
        timestamp: new Date(timestamp).toISOString(),
        appMode: "produccion",
        ClaveAPI: decryptedApiKey,
        AvatarID: flowState.selectedAvatar!.avatar_id,
        VoiceID: flowState.selectedVoice!.voice_id,
        Estilo: flowState.selectedStyle!.id,
        width: flowState.apiVersionCustomization?.width || 1280,
        height: flowState.apiVersionCustomization?.height || 720,
        // Personalización de subtítulos para estilo manual 2
        subtitleCustomization: flowState.subtitleCustomization ? {
          fontFamily: flowState.subtitleCustomization.fontFamily || "",
          subtitleEffect: flowState.subtitleCustomization.subtitleEffect || "",
          placementEffect: flowState.subtitleCustomization.placementEffect || "",
          textTransform: flowState.subtitleCustomization.textTransform || "",
          backgroundColor: flowState.subtitleCustomization.hasBackgroundColor 
            ? flowState.subtitleCustomization.backgroundColor 
            : "",
          textColor: flowState.subtitleCustomization.textColor || "",
          Tamañofuente: flowState.subtitleCustomization.Tamañofuente || 700,
          "Fixed size": flowState.subtitleCustomization["Fixed size"] || 5.5,
          fill: flowState.subtitleCustomization.fill || ""
        } : null,
        // Campo split para estilo manual 2
        split: flowState.subtitleCustomization?.subtitleEffect === 'highlight' ? "word" : "line"
      };
      
      console.log('📁 Enviando a webhook Estilo Manual 2 con requestId sincronizado:', {
        requestId: requestId,
        imagesCount: flowState.manualCustomization.images.length,
        videosCount: flowState.manualCustomization.videos.length,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      
      webhookConfirmed = await sendToManualWebhook2(
        manual2Payload, 
        flowState.manualCustomization.sessionId
      );
    } else if (flowState.selectedStyle!.id === 'style-7') {
      // Estilo Multi-Avatar
      console.log('👥 Enviando a webhook Estilo Multi-Avatar con requestId sincronizado:', {
        requestId: requestId,
        firstAvatar: flowState.selectedAvatar!.avatar_name,
        secondAvatar: flowState.selectedSecondAvatar!.avatar_name,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      
      // Crear payload especial para multi-avatar
      const multiAvatarPayload = {
        ...basePayload,
        'AvatarID-1': flowState.selectedAvatar!.avatar_id,
        'AvatarID-2': flowState.selectedSecondAvatar!.avatar_id
      };
      
      // Remover el AvatarID original ya que enviamos AvatarID-1 y AvatarID-2
      delete multiAvatarPayload.AvatarID;
      
      webhookConfirmed = await sendToMultiAvatarWebhook(multiAvatarPayload);
    } else if (flowState.selectedStyle!.id === 'style-2') {
      // Estilo Noticiero - webhook estándar
      console.log('🎥 Enviando a webhook estándar (Estilo Noticiero) con requestId sincronizado:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      webhookConfirmed = await sendToWebhook(basePayload);
    } else {
      // Fallback para otros estilos no definidos
      console.log('🎥 Enviando a webhook estándar (fallback) con requestId sincronizado:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      webhookConfirmed = await sendToWebhook(basePayload);
    }

    if (webhookConfirmed) {
      console.log('✅ Webhook confirmó recepción con requestId sincronizado:', {
        requestId: requestId,
        timestamp: new Date().toISOString(),
        apiKeyDecryptedAndSent: true
      });

      toast({
        title: "Solicitud recibida",
        description: `Webhook confirmó recepción. ID: ${requestId.substring(0, 8)}...`
      });
    } else {
      console.warn('⚠️ Webhook no confirmó recepción, pero no hubo error:', {
        requestId: requestId,
        timestamp: new Date().toISOString()
      });
    }

    return { requestId };

  } catch (error) {
    console.error('❌ Error enviando al webhook:', {
      requestId: requestId,
      error: error,
      timestamp: new Date().toISOString(),
      apiKeyWasDecrypted: !!decryptedApiKey
    });
    throw new Error(`Error de conexión con webhook: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};
