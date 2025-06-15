
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const checkVideoInDatabase = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('generated_videos')
      .select('video_url, request_id')
      .eq('user_id', user.id)
      .or(`request_id.eq.${requestId},script.eq.${script.trim()}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking video in database:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error during database check:', error);
    return null;
  }
};

export const checkFinalVideoResult = async (user: User | null, script: string) => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('generated_videos')
      .select('video_url')
      .eq('user_id', user.id)
      .eq('script', script.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error in final check:', error);
      return null;
    }

    return data && data.length > 0 ? data[0].video_url : null;
  } catch (error) {
    console.error('Error in final verification:', error);
    return null;
  }
};

export const checkPendingGenerationOnStart = async (user: User | null, requestId: string) => {
  if (!user || !requestId) return null;

  try {
    console.log('Verificando sincronización inteligente para requestId:', requestId);
    
    const { data, error } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, script')
      .eq('user_id', user.id)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error en verificación inteligente:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log('¡Video encontrado en BD para requestId pendiente!:', data[0]);
      return data[0];
    }

    console.log('No se encontró video generado para requestId:', requestId);
    return null;
  } catch (error) {
    console.error('Error en sincronización inteligente:', error);
    return null;
  }
};

export const syncGenerationState = async (user: User | null, requestId: string, script: string) => {
  console.log('Iniciando sincronización de estado para:', { requestId, script: script.substring(0, 50) + '...' });
  
  // Primero buscar por request_id exacto (más preciso)
  const exactMatch = await checkPendingGenerationOnStart(user, requestId);
  if (exactMatch) {
    console.log('Sincronización: Video encontrado por request_id exacto');
    return exactMatch;
  }

  // Si no encuentra por request_id, buscar por script (fallback)
  const scriptMatch = await checkVideoInDatabase(user, requestId, script);
  if (scriptMatch) {
    console.log('Sincronización: Video encontrado por script (fallback)');
    return scriptMatch;
  }

  console.log('Sincronización: No se encontró video generado');
  return null;
};
