
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

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
}

export const sendToManualWebhook = async (
  payload: WebhookPayload,
  sessionId?: string
): Promise<boolean> => {
  console.log('🔄 Sending to MANUAL webhook...');
  console.log('📦 Payload:', { ...payload, script: payload.script?.substring(0, 100) + '...' });
  console.log('🗂️ SessionId:', sessionId);

  // Dynamic import to avoid circular dependency
  const { loadFilesFromLocal, clearLocalFiles } = await import('./fileStorage');

  // Load files from localStorage
  const localFiles = loadFilesFromLocal(sessionId);
  if (!localFiles) {
    console.error('❌ No files found in localStorage for sessionId:', sessionId);
    return false;
  }

  const { images: imageFiles, videos: videoFiles } = localFiles;
  console.log('🖼️ Images loaded:', imageFiles.length);
  console.log('🎥 Videos loaded:', videoFiles.length);

  const webhookUrl = 'https://hook.eu2.make.com/n5aqhq8iwrz6ej7oec59y7u91kw9bz81';
  
  // Create FormData for the webhook
  const formData = new FormData();
  
  // Add all payload fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Convert files to base64 and add to FormData
  try {
    // Process images
    for (let i = 0; i < imageFiles.length; i++) {
      const image = imageFiles[i];
      const base64Data = await fileToBase64(image);
      formData.append(`image_${i}_name`, image.name);
      formData.append(`image_${i}_data`, base64Data);
      formData.append(`image_${i}_type`, image.type);
      formData.append(`image_${i}_size`, String(image.size));
    }
    
    // Process videos
    for (let i = 0; i < videoFiles.length; i++) {
      const video = videoFiles[i];
      const base64Data = await fileToBase64(video);
      formData.append(`video_${i}_name`, video.name);
      formData.append(`video_${i}_data`, base64Data);
      formData.append(`video_${i}_type`, video.type);
      formData.append(`video_${i}_size`, String(video.size));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ MANUAL webhook sent successfully');
      // Clear files from localStorage after successful send
      clearLocalFiles();
      console.log('🗑️ Files cleared from localStorage after successful webhook');
      return true;
    } else {
      console.error('❌ MANUAL webhook failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ MANUAL webhook timeout after 30 seconds');
    } else {
      console.error('❌ Error sending MANUAL webhook:', error);
    }
    return false;
  }
};

// New direct webhook function for manual files without localStorage
export const sendDirectToManualWebhook = async (
  payload: WebhookPayload,
  images: File[],
  videos: File[]
): Promise<string> => {
  console.log('🔄 Sending DIRECT to MANUAL webhook...');
  console.log('📦 Payload:', { ...payload, script: payload.script?.substring(0, 100) + '...' });
  console.log('🖼️ Images:', images.length);
  console.log('🎥 Videos:', videos.length);

  const webhookUrl = 'https://primary-production-f0d1.up.railway.app/webhook-test/MANUAL';
  
  // Create FormData for the webhook
  const formData = new FormData();
  
  // Add all payload fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Convert files to base64 and add to FormData
  try {
    // Process images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const base64Data = await fileToBase64(image);
      formData.append(`image_${i}_name`, image.name);
      formData.append(`image_${i}_data`, base64Data);
      formData.append(`image_${i}_type`, image.type);
      formData.append(`image_${i}_size`, String(image.size));
    }
    
    // Process videos
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const base64Data = await fileToBase64(video);
      formData.append(`video_${i}_name`, video.name);
      formData.append(`video_${i}_data`, base64Data);
      formData.append(`video_${i}_type`, video.type);
      formData.append(`video_${i}_size`, String(video.size));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ DIRECT MANUAL webhook sent successfully');
      return payload.requestId; // Return requestId for tracking
    } else {
      console.error('❌ DIRECT MANUAL webhook failed:', response.status, response.statusText);
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ DIRECT MANUAL webhook timeout after 30 seconds');
      throw new Error('Webhook timeout after 30 seconds');
    } else {
      console.error('❌ Error sending DIRECT MANUAL webhook:', error);
      throw error;
    }
  }
};
