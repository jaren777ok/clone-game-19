
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME, canShowCheckButton, getTimeUntilButtonAppears } from '@/lib/countdownUtils';
import { clearGenerationState } from '@/lib/videoGeneration';
import { sendVideoVerificationWebhook } from '@/lib/webhookUtils';
import { supabase } from '@/integrations/supabase/client';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate if the check button should be visible
  const canCheckVideo = useMemo(() => {
    if (!generationStartTime) {
      console.log('🔍 [BUTTON] No generationStartTime, botón no visible');
      return false;
    }
    
    const timeElapsed = (Date.now() - generationStartTime) / 1000;
    const shouldShow = timeElapsed >= 30 * 60; // 30 minutos
    
    console.log('🔍 [BUTTON] Calculando visibilidad del botón:', {
      generationStartTime: new Date(generationStartTime).toISOString(),
      timeElapsed: timeElapsed,
      timeElapsedMinutes: timeElapsed / 60,
      shouldShow: shouldShow,
      minimumWaitTime: 30 * 60
    });
    
    return shouldShow;
  }, [generationStartTime, timeRemaining]);

  // Calculate time until button appears
  const timeUntilButton = useMemo(() => {
    if (!generationStartTime || canCheckVideo) return 0;
    return getTimeUntilButtonAppears(generationStartTime);
  }, [generationStartTime, canCheckVideo, timeRemaining]);

  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const clearAllIntervals = useCallback(() => {
    console.log('🧹 [MONITORING] Limpiando intervalos');
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Sistema completamente manual - solo countdown visual
  const startCountdown = useCallback((
    requestId: string, 
    scriptToCheck: string, 
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    customStartTime?: number
  ) => {
    if (!user) {
      console.log('❌ [MONITORING] No hay usuario - abortando');
      return;
    }

    const startTime = customStartTime || Date.now();
    
    console.log('🚀 [MONITORING] INICIANDO SISTEMA COMPLETAMENTE MANUAL:', {
      requestId,
      startTime: new Date(startTime).toISOString(),
      userId: user.id,
      isCustomTime: !!customStartTime
    });
    
    // CRÍTICO: Establecer el generationStartTime
    setGenerationStartTime(startTime);
    setDebugInfo('🚀 Sistema manual activo - el botón aparecerá en 30 minutos');
    
    // Solo countdown timer visual - SIN verificaciones automáticas
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      
      updateTimeRemaining(remaining);
      
      if (remaining <= 0) {
        console.log('⏰ [MONITORING] Tiempo agotado - SISTEMA MANUAL: sin verificaciones automáticas');
        setDebugInfo('⏰ Tiempo agotado - usa el botón para verificar');
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);
  }, [user, updateTimeRemaining]);

  // Verificación COMPLETAMENTE manual con webhook mejorada
  const checkVideoManually = useCallback(async (
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    if (!user) {
      console.log('❌ [MONITORING] No hay usuario para verificación manual');
      return false;
    }

    if (isChecking) {
      console.log('⏳ [MONITORING] Ya hay una verificación en proceso');
      return false;
    }

    console.log('🔍 [MONITORING] VERIFICACIÓN MANUAL INICIADA');
    setDebugInfo('🔍 Verificando estado del video...');
    setIsChecking(true);

    try {
      // Obtener datos frescos de tracking
      const { data: trackingData, error } = await supabase
        .from('video_generation_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'processing')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !trackingData) {
        console.error('❌ [MONITORING] Error obteniendo datos de tracking:', error);
        setDebugInfo('❌ Error: No se encontró tracking activo');
        toast({
          title: "Error de verificación",
          description: "No se encontró un video en proceso para verificar.",
          variant: "destructive"
        });
        return false;
      }

      console.log('📦 [MONITORING] Datos de tracking obtenidos:', {
        requestId: trackingData.request_id,
        userId: trackingData.user_id,
        scriptLength: trackingData.script.length
      });

      // Enviar a webhook de verificación manual y procesar respuesta
      const result = await sendVideoVerificationWebhook(
        trackingData.request_id,
        trackingData.user_id,
        trackingData.script
      );

      if (result.success) {
        if (result.videoUrl) {
          console.log('🎥 [MONITORING] Video completado:', result.videoUrl);
          setDebugInfo('🎥 Video completado exitosamente');
          
          // Guardar video en la base de datos
          const { error: insertError } = await supabase
            .from('generated_videos')
            .insert({
              user_id: user.id,
              request_id: trackingData.request_id,
              script: trackingData.script,
              video_url: result.videoUrl,
              title: `Video - ${new Date().toLocaleDateString()}`
            });

          if (insertError) {
            console.error('❌ Error guardando video:', insertError);
          }

          // Limpiar estado de generación
          clearGenerationState();
          
          // Actualizar estado de la UI
          setVideoResult(result.videoUrl);
          setIsGenerating(false);
          
          toast({
            title: "¡Video completado!",
            description: "Tu video ya está listo. Redirigiendo...",
            variant: "default"
          });
          
          return true;
        } else {
          console.log('⏳ [MONITORING] Video aún no está listo');
          setDebugInfo('⏳ Video en proceso - intenta de nuevo más tarde');
          
          // Usar toast informativo en lugar de destructivo
          toast({
            title: "Video en proceso",
            description: "El video aún no está listo. Intenta de nuevo más tarde.",
            variant: "default"
          });
          
          return false;
        }
      } else {
        // Solo casos críticos llegan aquí (no debería pasar con la nueva lógica)
        console.error('❌ [MONITORING] Error crítico en verificación manual');
        setDebugInfo('❌ Error crítico en verificación');
        
        toast({
          title: "Error de verificación",
          description: "Hubo un problema crítico con la verificación. Intenta de nuevo.",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error('💥 [MONITORING] Error en verificación manual:', error);
      setDebugInfo(`💥 Error: ${error}`);
      
      toast({
        title: "Error de verificación",
        description: "Hubo un problema con la verificación manual.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, toast, isChecking]);

  const cleanup = useCallback(() => {
    console.log('🧹 [MONITORING] Limpieza completa del monitoreo manual');
    setDebugInfo('🧹 Sistema manual limpiado');
    setGenerationStartTime(null);
    clearAllIntervals();
  }, [clearAllIntervals]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    timeRemaining,
    generationStartTime,
    debugInfo,
    isChecking,
    canCheckVideo,
    timeUntilButton,
    startCountdown,
    startPeriodicChecking: () => {}, // Legacy compatibility - no hace nada
    checkFinalResult: () => {}, // Legacy compatibility - no hace nada
    checkVideoManually,
    cleanup,
    setGenerationStartTime // Export this so it can be set externally if needed
  };
};
