
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

// Drive URLs response interface
interface DriveUrlsResponse {
  [key: string]: string; // imagen1, imagen2, ..., video1, video2, etc.
}

// Convert files to Drive URLs webhook
export const sendToConvertFilesWebhook = async (
  images: File[],
  videos: File[],
  onProgress?: (message: string) => void
): Promise<DriveUrlsResponse> => {
  console.log('🔄 Converting files to Drive URLs...');
  console.log('🖼️ Images:', images.length);
  console.log('🎥 Videos:', videos.length);

  const webhookUrl = 'https://primary-production-f0d1.up.railway.app/webhook/DRIVE';
  
  // Create FormData for the webhook
  const formData = new FormData();
  
  try {
    // Process images as base64
    onProgress?.('Convirtiendo imágenes...');
    for (let i = 0; i < images.length; i++) {
      onProgress?.(`Procesando imagen ${i + 1} de ${images.length}...`);
      const image = images[i];
      const base64Data = await fileToBase64(image);
      formData.append(`imagen${i + 1}`, base64Data);
    }
    
    // Process videos as binary files
    onProgress?.('Convirtiendo videos...');
    for (let i = 0; i < videos.length; i++) {
      onProgress?.(`Procesando video ${i + 1} de ${videos.length}...`);
      const video = videos[i];
      formData.append(`video${i + 1}`, video, video.name);
    }

    onProgress?.('Enviando archivos a Google Drive...');
    
    // 10 minute timeout (600,000ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Files converted to Drive URLs successfully');
      console.log('📊 Response:', data);
      
      // Expect response to be an array with a single object
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as DriveUrlsResponse;
      } else {
        return data as DriveUrlsResponse;
      }
    } else {
      console.error('❌ Convert files webhook failed:', response.status, response.statusText);
      throw new Error(`Conversion failed with status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Convert files webhook timeout after 10 minutes');
      throw new Error('Conversion timeout after 10 minutes');
    } else {
      console.error('❌ Error converting files:', error);
      throw error;
    }
  }
};

// New direct webhook function for manual files without localStorage
export const sendDirectToManualWebhook = async (
  payload: WebhookPayload,
  images: File[],
  videos: File[],
  onProgress?: (current: number, total: number, type: 'image') => void
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
  
  try {
    // Process images with progress reporting (convert to base64)
    for (let i = 0; i < images.length; i++) {
      onProgress?.(i + 1, images.length, 'image');
      const image = images[i];
      const base64Data = await fileToBase64(image);
      // Send as base64 data with clean naming: image_0_data to image_13_data
      formData.append(`image_${i}_data`, base64Data);
    }
    
    // Process videos as binary files (no base64 conversion)
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      // Send as binary files with clean naming: video1, video2, video3, video4, video5
      formData.append(`video${i + 1}`, video, video.name);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Reduced to 30 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ DIRECT MANUAL webhook sent successfully');
      console.log('📊 Sent:', `${images.length} images (base64) + ${videos.length} videos (binary)`);
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

// New function to send with Drive URLs instead of files
export const sendDirectToManualWebhookWithUrls = async (
  payload: WebhookPayload,
  driveUrls: DriveUrlsResponse
): Promise<string> => {
  console.log('🔄 Sending to MANUAL webhook with Drive URLs...');
  console.log('📦 Payload:', { ...payload, script: payload.script?.substring(0, 100) + '...' });
  console.log('🔗 Drive URLs:', Object.keys(driveUrls).length);

  const webhookUrl = 'https://primary-production-f0d1.up.railway.app/webhook-test/MANUAL';
  
  // Create FormData for the webhook
  const formData = new FormData();
  
  // Add all payload fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Add all Drive URLs to the payload
  Object.entries(driveUrls).forEach(([key, url]) => {
    formData.append(key, url);
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ MANUAL webhook with URLs sent successfully');
      console.log('📊 Sent URLs for:', Object.keys(driveUrls).join(', '));
      return payload.requestId; // Return requestId for tracking
    } else {
      console.error('❌ MANUAL webhook with URLs failed:', response.status, response.statusText);
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ MANUAL webhook with URLs timeout after 30 seconds');
      throw new Error('Webhook timeout after 30 seconds');
    } else {
      console.error('❌ Error sending MANUAL webhook with URLs:', error);
      throw error;
    }
  }
};
