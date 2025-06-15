
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface GenerationState {
  script: string;
  requestId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

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

// Función para guardar el video en Supabase (actualizada para incluir request_id)
export const saveVideoToDatabase = async (script: string, videoUrl: string, user: User | null, requestId?: string) => {
  if (!user) return;

  try {
    const { error } = await supabase
      .from('generated_videos')
      .insert({
        user_id: user.id,
        script: script.trim(),
        video_url: videoUrl,
        request_id: requestId || null
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
