import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface VideoGenerationTrackingData {
  id: string;
  user_id: string;
  request_id: string;
  script: string;
  start_time: string;
  last_check_time: string;
  status: 'processing' | 'completed' | 'expired';
  created_at: string;
  updated_at: string;
}

// Create a new video generation tracking record
export const createVideoGenerationTracking = async (
  script: string,
  requestId: string,
  user: User | null
): Promise<VideoGenerationTrackingData | null> => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('video_generation_tracking')
      .insert({
        user_id: user.id,
        request_id: requestId,
        script: script.trim(),
        status: 'processing'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating video generation tracking:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating video generation tracking:', error);
    return null;
  }
};

// Get current processing video for user
export const getCurrentProcessingVideo = async (
  user: User | null
): Promise<VideoGenerationTrackingData | null> => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('video_generation_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting current processing video:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting current processing video:', error);
    return null;
  }
};

// Update last check time for a video generation
export const updateLastCheckTime = async (
  requestId: string,
  user: User | null
): Promise<boolean> => {
  if (!user) return false;

  try {
    const { error } = await supabase
      .from('video_generation_tracking')
      .update({ 
        last_check_time: new Date().toISOString() 
      })
      .eq('request_id', requestId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating last check time:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating last check time:', error);
    return false;
  }
};

// Mark video generation as completed
export const markVideoGenerationCompleted = async (
  requestId: string,
  user: User | null
): Promise<boolean> => {
  if (!user) return false;

  try {
    const { error } = await supabase
      .from('video_generation_tracking')
      .update({ 
        status: 'completed',
        last_check_time: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking video as completed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking video as completed:', error);
    return false;
  }
};

// Mark video generation as expired
export const markVideoGenerationExpired = async (
  requestId: string,
  user: User | null
): Promise<boolean> => {
  if (!user) return false;

  try {
    const { error } = await supabase
      .from('video_generation_tracking')
      .update({ 
        status: 'expired',
        last_check_time: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking video as expired:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking video as expired:', error);
    return false;
  }
};

// Calculate remaining time based on real timestamps
export const calculateRemainingTime = (startTime: string): number => {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = (now - start) / 1000; // seconds
  const totalTime = 39 * 60; // 39 minutes in seconds
  const remaining = Math.max(0, totalTime - elapsed);
  
  return Math.floor(remaining);
};

// Clean up expired generations (can be called periodically)
export const cleanupExpiredGenerations = async (user: User | null): Promise<void> => {
  if (!user) return;

  try {
    // Mark generations older than 39 minutes as expired
    const expiredTime = new Date(Date.now() - 39 * 60 * 1000).toISOString();
    
    await supabase
      .from('video_generation_tracking')
      .update({ status: 'expired' })
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .lt('start_time', expiredTime);
  } catch (error) {
    console.error('Error cleaning up expired generations:', error);
  }
};