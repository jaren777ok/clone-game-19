
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  GenerationState, 
  saveGenerationState, 
  clearGenerationState 
} from '@/lib/videoGeneration';
import { sendToWebhook } from '@/lib/webhookUtils';
import { getStyleInternalId } from '@/utils/styleMapping';
import { FlowState } from '@/types/videoFlow';

export const createVideoGenerationPayload = (
  script: string,
  userId: string,
  requestId: string,
  flowState: FlowState
) => {
  return {
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
    flowState
  );

  console.log('Enviando payload completo:', webhookPayload);
  
  await sendToWebhook(webhookPayload);
  
  toast({
    title: "Solicitud enviada",
    description: "Tu video se está procesando con la configuración seleccionada. Te notificaremos cuando esté listo.",
  });

  return requestId;
};
