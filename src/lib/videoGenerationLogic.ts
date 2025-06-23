
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  GenerationState, 
  saveGenerationState, 
  clearGenerationState 
} from '@/lib/videoGeneration';
import { sendToWebhook, sendToEstiloNoticiaWebhook } from '@/lib/webhookUtils';
import { getStyleInternalId } from '@/utils/styleMapping';
import { FlowState, CardCustomization } from '@/types/videoFlow';

export const createVideoGenerationPayload = (
  script: string,
  userId: string,
  requestId: string,
  flowState: FlowState,
  cardCustomization?: CardCustomization
) => {
  const basePayload = {
    script: script.trim(),
    userId,
    requestId,
    timestamp: new Date().toISOString(),
    appMode: 'immediate_response',
    ClaveAPI: atob(flowState.selectedApiKey!.api_key_encrypted),
    AvatarID: flowState.selectedAvatar!.avatar_id,
    VoiceID: flowState.selectedVoice!.voice_id,
    Estilo: getStyleInternalId(flowState.selectedStyle!)
  };

  // Si es Estilo Noticia y hay personalización, agregar campos adicionales
  if (flowState.selectedStyle?.id === 'style-1' && cardCustomization) {
    return {
      ...basePayload,
      fecha: cardCustomization.fecha,
      titulo: cardCustomization.titulo,
      subtitulo: cardCustomization.subtitulo
    };
  }

  return basePayload;
};

export const validateFlowState = (flowState?: FlowState): boolean => {
  return !!(
    flowState?.selectedApiKey && 
    flowState?.selectedAvatar && 
    flowState?.selectedVoice && 
    flowState?.selectedStyle
  );
};

export const initiateVideoGeneration = async (
  script: string,
  user: any,
  flowState: FlowState,
  toast: ReturnType<typeof useToast>['toast']
) => {
  const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
  
  const generationState: GenerationState = { 
    script: script.trim(), 
    requestId, 
    timestamp: Date.now(), 
    status: 'pending' 
  };
  saveGenerationState(generationState);

  console.log('Iniciando nuevo proceso de generación de video');
  
  const webhookPayload = createVideoGenerationPayload(
    script,
    user?.id || 'anonymous',
    requestId,
    flowState,
    flowState.cardCustomization
  );

  console.log('Enviando payload completo:', webhookPayload);

  // Determinar qué webhook usar según el estilo
  if (flowState.selectedStyle?.id === 'style-1') {
    // Estilo Noticia -> webhook Estilo1
    await sendToEstiloNoticiaWebhook(webhookPayload);
    toast({
      title: "Solicitud enviada",
      description: "Tu video estilo noticia se está procesando con la personalización seleccionada. Te notificaremos cuando esté listo.",
    });
  } else {
    // Estilo Noticiero -> webhook veroia (original)
    await sendToWebhook(webhookPayload);
    toast({
      title: "Solicitud enviada",
      description: "Tu video se está procesando con la configuración seleccionada. Te notificaremos cuando esté listo.",
    });
  }

  return requestId;
};
