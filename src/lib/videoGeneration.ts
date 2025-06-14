
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface GenerationState {
  script: string;
  requestId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

// Función para extraer la URL del video de diferentes formatos de respuesta
export const extractVideoUrl = (data: any): string | null => {
  console.log('Respuesta completa de la webhook:', data);
  
  // Si la respuesta es un array, tomar el primer elemento
  if (Array.isArray(data) && data.length > 0) {
    console.log('Respuesta es un array, procesando primer elemento:', data[0]);
    return extractVideoUrl(data[0]);
  }
  
  // Si es un objeto, buscar la URL en diferentes campos posibles
  if (data && typeof data === 'object') {
    const possibleFields = ['videoUrl', 'url', 'link', 'video'];
    
    for (const field of possibleFields) {
      if (data[field] && typeof data[field] === 'string') {
        console.log(`URL encontrada en campo '${field}':`, data[field]);
        return data[field];
      }
    }
    
    // Si no encontramos en campos directos, buscar en el mensaje
    if (data.message && typeof data.message === 'string') {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = data.message.match(urlRegex);
      if (matches && matches.length > 0) {
        console.log('URL encontrada en mensaje:', matches[0]);
        return matches[0];
      }
    }
  }
  
  console.log('No se pudo extraer URL de la respuesta');
  return null;
};

// Funciones para manejar el estado persistente
export const saveGenerationState = (state: GenerationState) => {
  localStorage.setItem('video_generation_state', JSON.stringify(state));
};

export const getGenerationState = (): GenerationState | null => {
  const saved = localStorage.getItem('video_generation_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing saved state:', error);
      localStorage.removeItem('video_generation_state');
    }
  }
  return null;
};

export const clearGenerationState = () => {
  localStorage.removeItem('video_generation_state');
};

// Función para guardar el video en Supabase
export const saveVideoToDatabase = async (script: string, videoUrl: string, user: User | null) => {
  if (!user) return;

  try {
    const { error } = await supabase
      .from('generated_videos')
      .insert({
        user_id: user.id,
        script: script.trim(),
        video_url: videoUrl
      });

    if (error) {
      console.error('Error guardando video en BD:', error);
    } else {
      console.log('Video guardado exitosamente en BD');
    }
  } catch (error) {
    console.error('Error inesperado guardando video:', error);
  }
};
