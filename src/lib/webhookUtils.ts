
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
  nombrePresentador?: string;
  width?: number;
  height?: number;
}

interface EstiloNoticiaPayload extends WebhookPayload {
  fecha?: string;
  titulo?: string;
  subtitulo?: string;
}

export const sendToWebhook = async (payload: WebhookPayload): Promise<boolean> => {
  try {
    console.log('Enviando datos a webhook con respuesta inmediata...');
    console.log('Payload completo:', payload);
    
    // Set a 30-second timeout for webhook confirmation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/veroia', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Webhook respondió con error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ Webhook confirmó recepción:', data);
    
    // Webhook confirmed receipt successfully
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('⏰ Timeout esperando confirmación del webhook (30s)');
    } else {
      console.error('❌ Error enviando a webhook:', err);
    }
    return false;
  }
};

export const sendToEstiloNoticiaWebhook = async (payload: EstiloNoticiaPayload): Promise<boolean> => {
  try {
    console.log('Enviando datos a webhook Estilo Noticia...');
    console.log('Payload completo Estilo Noticia:', payload);
    
    // Set a 30-second timeout for webhook confirmation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/Estilo1', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Webhook Estilo Noticia respondió con error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ Webhook Estilo Noticia confirmó recepción:', data);
    
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('⏰ Timeout esperando confirmación del webhook Estilo Noticia (30s)');
    } else {
      console.error('❌ Error enviando a webhook Estilo Noticia:', err);
    }
    return false;
  }
};

export const sendToEstiloEducativoWebhook = async (payload: WebhookPayload): Promise<boolean> => {
  try {
    console.log('Enviando datos a webhook Estilo Educativo 1...');
    console.log('Payload completo Estilo Educativo 1:', payload);
    
    // Set a 30-second timeout for webhook confirmation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/ESTILO_EDUCATIVO1', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Webhook Estilo Educativo 1 respondió con error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ Webhook Estilo Educativo 1 confirmó recepción:', data);
    
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('⏰ Timeout esperando confirmación del webhook Estilo Educativo 1 (30s)');
    } else {
      console.error('❌ Error enviando a webhook Estilo Educativo 1:', err);
    }
    return false;
  }
};

export const sendToEducativo2Webhook = async (payload: WebhookPayload): Promise<boolean> => {
  try {
    console.log('Enviando datos a webhook Estilo Educativo 2...');
    console.log('Payload completo Estilo Educativo 2:', payload);
    
    // Set a 30-second timeout for webhook confirmation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/EDUCATIVO_2', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Webhook Estilo Educativo 2 respondió con error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ Webhook Estilo Educativo 2 confirmó recepción:', data);
    
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('⏰ Timeout esperando confirmación del webhook Estilo Educativo 2 (30s)');
    } else {
      console.error('❌ Error enviando a webhook Estilo Educativo 2:', err);
    }
    return false;
  }
};

export const sendToManualWebhook = async (
  payload: WebhookPayload, 
  images: File[], 
  videos: File[]
): Promise<boolean> => {
  try {
    console.log('Enviando datos a webhook Estilo Manual...');
    console.log('Payload completo Estilo Manual:', payload);
    console.log(`Enviando ${images.length} imágenes y ${videos.length} videos`);
    
    // Create FormData for binary file upload
    const formData = new FormData();
    
    // Add regular payload data
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Add images with specific naming (imagen1, imagen2, etc.)
    images.forEach((image, index) => {
      formData.append(`imagen${index + 1}`, image);
    });
    
    // Add videos with specific naming (video1, video2, etc.)
    videos.forEach((video, index) => {
      formData.append(`video${index + 1}`, video);
    });
    
    // Set a 30-second timeout for webhook confirmation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/MANUAL', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Webhook Estilo Manual respondió con error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ Webhook Estilo Manual confirmó recepción:', data);
    
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('⏰ Timeout esperando confirmación del webhook Estilo Manual (30s)');
    } else {
      console.error('❌ Error enviando a webhook Estilo Manual:', err);
    }
    return false;
  }
};
