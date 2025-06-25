
import { User } from '@supabase/supabase-js';
import { FlowState } from '@/types/videoFlow';
import { saveGenerationState } from '@/lib/videoGeneration';
import { sendToWebhook, sendToEstiloNoticiaWebhook } from '@/lib/webhookUtils';

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
  
  console.log('🎬 Iniciando generación de video:', {
    requestId: requestId,
    timestamp: timestamp,
    timestampDate: new Date(timestamp).toISOString(),
    userId: user.id,
    scriptLength: script.length,
    selectedApiKey: flowState.selectedApiKey?.api_key_name,
    selectedAvatar: flowState.selectedAvatar?.avatar_name,
    selectedVoice: flowState.selectedVoice?.voice_name,
    selectedStyle: flowState.selectedStyle?.name
  });

  // Guardar estado de generación
  saveGenerationState({
    requestId,
    script: script.trim(),
    timestamp,
    status: 'pending'
  });

  // Preparar payload base
  const basePayload = {
    script: script.trim(),
    userId: user.id,
    requestId: requestId,
    timestamp: new Date(timestamp).toISOString(),
    appMode: "produccion",
    ClaveAPI: flowState.selectedApiKey!.api_key_encrypted,
    AvatarID: flowState.selectedAvatar!.avatar_id,
    VoiceID: flowState.selectedVoice!.voice_id,
    Estilo: flowState.selectedStyle!.id,
    nombrePresentador: flowState.presenterName || flowState.selectedAvatar!.avatar_name
  };

  console.log('📤 Enviando payload al webhook:', {
    requestId: requestId,
    webhook: flowState.selectedStyle!.id === 'estilo-noticia' ? 'Estilo1' : 'veroia',
    payloadSize: JSON.stringify(basePayload).length
  });

  try {
    if (flowState.selectedStyle!.id === 'estilo-noticia') {
      const noticiaPayload = {
        ...basePayload,
        fecha: flowState.newsDate || new Date().toLocaleDateString('es-ES'),
        titulo: flowState.newsTitle || 'Noticia importante',
        subtitulo: flowState.newsSubtitle || 'Información relevante'
      };
      
      console.log('📰 Enviando a webhook Estilo Noticia con datos adicionales:', {
        requestId: requestId,
        fecha: noticiaPayload.fecha,
        titulo: noticiaPayload.titulo
      });
      
      await sendToEstiloNoticiaWebhook(noticiaPayload);
    } else {
      console.log('🎥 Enviando a webhook estándar');
      await sendToWebhook(basePayload);
    }

    console.log('✅ Payload enviado exitosamente al webhook:', {
      requestId: requestId,
      timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
