
interface WebhookPayload {
  script: string;
  userId: string;
  requestId: string;
  timestamp: string;
  appMode: string;
  ClaveAPI?: string;
  AvatarID?: string;
  VoiceID?: string;
  Estilo?: string;
}

export const sendToWebhook = async (payload: WebhookPayload) => {
  try {
    console.log('Enviando datos a webhook con respuesta inmediata...');
    console.log('Payload completo:', payload);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/veroia', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta inmediata recibida:', data);
    
    return true;
  } catch (err) {
    console.error('Error enviando a webhook:', err);
    throw err;
  }
};
