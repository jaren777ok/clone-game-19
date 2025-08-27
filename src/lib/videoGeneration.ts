
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  createVideoGenerationTracking,
  getCurrentProcessingVideo,
  markVideoGenerationCompleted,
  VideoGenerationTrackingData
} from './videoGenerationDatabase';

export interface GenerationState {
  script: string;
  requestId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

// Legacy localStorage functions (kept for UI preferences, not critical state)
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

// New database-based state management
export const saveVideoGenerationToDatabase = async (
  script: string,
  requestId: string,
  user: User | null
): Promise<VideoGenerationTrackingData | null> => {
  return await createVideoGenerationTracking(script, requestId, user);
};

export const getCurrentVideoGeneration = async (
  user: User | null
): Promise<VideoGenerationTrackingData | null> => {
  return await getCurrentProcessingVideo(user);
};

export const markVideoCompleted = async (
  requestId: string,
  user: User | null
): Promise<boolean> => {
  return await markVideoGenerationCompleted(requestId, user);
};

// 🔥 IMPORTANTE: Esta función NO debe usarse en verificación manual
// N8N ya guarda automáticamente los videos con títulos correctos
// Solo usar para flujos directos que no pasen por N8N
export const saveVideoToDatabase = async (script: string, videoUrl: string, user: User | null, requestId?: string) => {
  if (!user) return;

  console.warn('⚠️ [SAVE_VIDEO] Esta función no debe usarse en verificación manual - N8N ya guarda automáticamente');

  try {
    const { error } = await supabase
      .from('generated_videos')
      .insert({
        user_id: user.id,
        title: script.substring(0, 50) + '...',
        script: script,
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
