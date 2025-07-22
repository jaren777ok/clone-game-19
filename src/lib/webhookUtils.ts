
import { User } from '@supabase/supabase-js';

export const checkVideoViaWebhook = async (
  user: User,
  requestId: string,
  script: string
): Promise<any> => {
  console.log('🔗 [WEBHOOK] Llamando a webhook veroia:', {
    requestId,
    userId: user.id,
    scriptLength: script.length
  });

  try {
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/veroia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        request_id: requestId,
        script: script
      })
    });

    if (!response.ok) {
      console.error('❌ [WEBHOOK] Error en respuesta:', response.status, response.statusText);
      throw new Error(`Webhook error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [WEBHOOK] Respuesta del webhook:', data);

    return data;
  } catch (error) {
    console.error('💥 [WEBHOOK] Error llamando webhook:', error);
    throw error;
  }
};
