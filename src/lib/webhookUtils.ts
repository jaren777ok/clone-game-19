
export const sendToWebhook = async (script: string, requestId: string, userId?: string) => {
  try {
    console.log('Enviando datos a webhook con respuesta inmediata...');
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/veroia', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        script: script.trim(), 
        userId: userId || 'anonymous', 
        requestId, 
        timestamp: new Date().toISOString(),
        appMode: 'immediate_response'
      }),
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
