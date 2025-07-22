
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useVideoVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Multi-strategy video verification
  const checkRecentCompletedVideos = useCallback(async () => {
    if (!user) return null;

    console.log('🔍 VERIFICACIÓN MULTI-ESTRATEGIA - Buscando videos recientes completados:', {
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    try {
      // Strategy 1: Check recent videos from generated_videos table (last 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      console.log('📊 Estrategia 1: Buscando videos recientes en generated_videos...');
      const { data: recentVideos, error: videosError } = await supabase
        .from('generated_videos')
        .select('video_url, request_id, title, created_at')
        .eq('user_id', user.id)
        .gte('created_at', fifteenMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!videosError && recentVideos && recentVideos.length > 0) {
        console.log('✅ ENCONTRADOS VIDEOS RECIENTES:', recentVideos);
        return {
          video_url: recentVideos[0].video_url,
          title: recentVideos[0].title || 'Video generado',
          request_id: recentVideos[0].request_id,
          created_at: recentVideos[0].created_at
        };
      }

      // Strategy 2: Check tracking table for completed status
      console.log('📊 Estrategia 2: Buscando tracking completado...');
      const { data: completedTracking, error: trackingError } = await supabase
        .from('video_generation_tracking')
        .select('request_id, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', fifteenMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!trackingError && completedTracking && completedTracking.length > 0) {
        for (const tracking of completedTracking) {
          console.log('🔍 Verificando tracking completado:', tracking.request_id);
          
          const { data: videoData, error: videoError } = await supabase
            .from('generated_videos')
            .select('video_url, request_id, title, created_at')
            .eq('user_id', user.id)
            .eq('request_id', tracking.request_id)
            .limit(1);

          if (!videoError && videoData && videoData.length > 0) {
            console.log('✅ ENCONTRADO VIDEO CON TRACKING COMPLETADO:', videoData[0]);
            return {
              video_url: videoData[0].video_url,
              title: videoData[0].title || 'Video generado',
              request_id: videoData[0].request_id,
              created_at: videoData[0].created_at
            };
          }
        }
      }

      // Strategy 3: Check processing tracking that might have videos
      console.log('📊 Estrategia 3: Verificando tracking en proceso con videos...');
      const { data: processingTracking, error: processingError } = await supabase
        .from('video_generation_tracking')
        .select('request_id, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'processing')
        .gte('created_at', fifteenMinutesAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!processingError && processingTracking && processingTracking.length > 0) {
        for (const tracking of processingTracking) {
          console.log('🔍 Verificando si tracking "processing" tiene video:', tracking.request_id);
          
          const { data: videoData, error: videoError } = await supabase
            .from('generated_videos')
            .select('video_url, request_id, title, created_at')
            .eq('user_id', user.id)
            .eq('request_id', tracking.request_id)
            .limit(1);

          if (!videoError && videoData && videoData.length > 0) {
            console.log('🎉 ENCONTRADO VIDEO CON TRACKING "PROCESSING" - Auto-corrigiendo a completed');
            
            // Auto-correct tracking status
            await supabase
              .from('video_generation_tracking')
              .update({ status: 'completed', last_check_time: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('request_id', tracking.request_id);
            
            return {
              video_url: videoData[0].video_url,
              title: videoData[0].title || 'Video generado',
              request_id: videoData[0].request_id,
              created_at: videoData[0].created_at
            };
          }
        }
      }

      console.log('❌ NO SE ENCONTRARON VIDEOS CON NINGUNA ESTRATEGIA');
      return null;

    } catch (error) {
      console.error('💥 Error en verificación multi-estrategia:', error);
      return null;
    }
  }, [user]);

  const forceVideoCheck = useCallback(async (
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    console.log('🚀 VERIFICACIÓN FORZADA - Ejecutando checkRecentCompletedVideos');
    
    const videoData = await checkRecentCompletedVideos();
    
    if (videoData) {
      console.log('🎉 VIDEO ENCONTRADO EN VERIFICACIÓN FORZADA:', {
        videoUrl: videoData.video_url,
        title: videoData.title,
        requestId: videoData.request_id
      });
      
      // Immediate UI update
      setVideoResult(videoData.video_url);
      setIsGenerating(false);
      
      toast({
        title: "¡Video completado!",
        description: videoData.title || "Tu video ha sido generado exitosamente.",
      });
      
      return true;
    }
    
    console.log('❌ No se encontró video en verificación forzada');
    toast({
      title: "Video en proceso",
      description: "Tu video aún no está disponible. La verificación automática continuará.",
      variant: "default"
    });
    
    return false;
  }, [checkRecentCompletedVideos, toast]);

  return {
    checkRecentCompletedVideos,
    forceVideoCheck
  };
};
