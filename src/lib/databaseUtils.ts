
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const checkVideoInDatabase = async (user: User | null, requestId: string, script: string) => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('generated_videos')
      .select('video_url, request_id, title')
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
      .select('video_url, title')
      .eq('user_id', user.id)
      .eq('script', script.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error in final check:', error);
      return null;
    }

    return data && data.length > 0 ? { video_url: data[0].video_url, title: data[0].title } : null;
  } catch (error) {
    console.error('Error in final verification:', error);
    return null;
  }
};
