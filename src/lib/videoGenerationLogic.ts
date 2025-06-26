import { User } from '@supabase/supabase-js';
import { FlowState } from '@/types/videoFlow';
import { saveGenerationState } from '@/lib/videoGeneration';
import { sendToWebhook, sendToEstiloNoticiaWebhook, sendToEstiloEducativoWebhook, sendToEducativo2Webhook } from '@/lib/webhookUtils';

export const validateFlowState = (flowState?: FlowState): boolean => {
  if (!flowState) return false;
  
  return !!(
    flowState.selectedApiKey &&
    flowState.selectedAvatar &&
    flowState.selectedVoice &&
    flowState.selectedStyle
  );
};

export const initiateVideoGeneration = async (
  script: string,
  user: User | null,
  flowState: FlowState,
  toast: any
): Promise<string> => {
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Generar requestId único basado en timestamp + random
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const requestId = `${timestamp}-${random}`;
  
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
  
  console.log('🎬 Iniciando generación de video:', {
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
    apiKeyDecrypted: true
  });

  // Guardar estado de generación
  saveGenerationState({
    requestId,
    script: script.trim(),
    timestamp,
    status: 'pending'
  });

  // Preparar payload base con clave API desencriptada
  const basePayload = {
    script: script.trim(),
    userId: user.id,
    requestId: requestId,
    timestamp: new Date(timestamp).toISOString(),
    appMode: "produccion",
    ClaveAPI: decryptedApiKey, // Usando la clave desencriptada
    AvatarID: flowState.selectedAvatar!.avatar_id,
    VoiceID: flowState.selectedVoice!.voice_id,
    Estilo: flowState.selectedStyle!.id,
    nombrePresentador: flowState.presenterCustomization?.nombrePresentador || flowState.selectedAvatar!.avatar_name
  };

  // Determinar webhook según el estilo
  let webhookType = 'veroia'; // default
  if (flowState.selectedStyle!.id === 'style-1') {
    webhookType = 'Estilo1';
  } else if (flowState.selectedStyle!.id === 'style-3') {
    webhookType = 'ESTILO_EDUCATIVO1';
  } else if (flowState.selectedStyle!.id === 'style-4') {
    webhookType = 'EDUCATIVO_2';
  }

  console.log('📤 Enviando payload al webhook:', {
    requestId: requestId,
    webhook: webhookType,
    payloadSize: JSON.stringify(basePayload).length,
    presenterName: basePayload.nombrePresentador,
    apiKeyUsed: decryptedApiKey.substring(0, 8) + '...' // Solo mostrar los primeros 8 caracteres por seguridad
  });

  try {
    if (flowState.selectedStyle!.id === 'style-1') {
      // Estilo Noticia
      const noticiaPayload = {
        ...basePayload,
        fecha: flowState.cardCustomization?.fecha || new Date().toLocaleDateString('es-ES'),
        titulo: flowState.cardCustomization?.titulo || 'Noticia importante',
        subtitulo: flowState.cardCustomization?.subtitulo || 'Información relevante'
      };
      
      console.log('📰 Enviando a webhook Estilo Noticia con datos adicionales:', {
        requestId: requestId,
        fecha: noticiaPayload.fecha,
        titulo: noticiaPayload.titulo,
        subtitulo: noticiaPayload.subtitulo,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      
      await sendToEstiloNoticiaWebhook(noticiaPayload);
    } else if (flowState.selectedStyle!.id === 'style-3') {
      // Estilo Educativo 1
      console.log('🎓 Enviando a webhook Estilo Educativo 1:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      await sendToEstiloEducativoWebhook(basePayload);
    } else if (flowState.selectedStyle!.id === 'style-4') {
      // Estilo Educativo 2
      console.log('🎓 Enviando a webhook Estilo Educativo 2:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      await sendToEducativo2Webhook(basePayload);
    } else {
      // Webhook estándar (Estilo Noticiero y otros)
      console.log('🎥 Enviando a webhook estándar:', {
        requestId: requestId,
        presenterName: basePayload.nombrePresentador,
        apiKeyConfirmed: decryptedApiKey.substring(0, 8) + '...'
      });
      await sendToWebhook(basePayload);
    }

    console.log('✅ Payload enviado exitosamente al webhook:', {
      requestId: requestId,
      timestamp: new Date().toISOString(),
      apiKeyDecryptedAndSent: true
    });

    toast({
      title: "Video en procesamiento",
      description: `Solicitud enviada correctamente. ID: ${requestId.substring(0, 8)}...`
    });

    return requestId;

  } catch (error) {
    console.error('❌ Error enviando al webhook:', {
      requestId: requestId,
      error: error,
      timestamp: new Date().toISOString(),
      apiKeyWasDecrypted: !!decryptedApiKey
    });
    throw error;
  }
};
