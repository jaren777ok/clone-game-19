
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { COUNTDOWN_TIME } from '@/lib/countdownUtils';
import { clearGenerationState } from '@/lib/videoGeneration';
import { sendVideoVerificationWebhook } from '@/lib/webhookUtils';
import { supabase } from '@/integrations/supabase/client';

export const useVideoMonitoring = () => {
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      userId: user.id
    });
    
    setGenerationStartTime(startTime);
    setDebugInfo('🚀 Sistema manual activo - solo verificación con botón');
    
    // Solo countdown timer visual - SIN verificaciones automáticas
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      
      updateTimeRemaining(remaining);
      
      // ELIMINAR: No más verificación automática cuando remaining <= 0
      if (remaining <= 0) {
        console.log('⏰ [MONITORING] Tiempo agotado - SISTEMA MANUAL: sin verificaciones automáticas');
        setDebugInfo('⏰ Tiempo agotado - usa el botón para verificar manualmente');
        // NO llamar checkFinalResult - mantener sistema manual
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);
  }, [user, updateTimeRemaining]);

  // Verificación COMPLETAMENTE manual con webhook correcta
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

    console.log('🔍 [MONITORING] VERIFICACIÓN MANUAL INICIADA');
    setDebugInfo('🔍 Enviando verificación manual a webhook...');

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

      // Enviar a webhook de verificación manual
      const success = await sendVideoVerificationWebhook(
        trackingData.request_id,
        trackingData.user_id,
        trackingData.script
      );

      if (success) {
        console.log('✅ [MONITORING] Verificación manual enviada exitosamente');
        setDebugInfo('✅ Verificación enviada - webhook procesará la respuesta');
        
        toast({
          title: "Verificación enviada",
          description: "Se ha enviado la verificación a la webhook externa. El sistema te notificará cuando el video esté listo.",
          variant: "default"
        });
        
        return true;
      } else {
        console.error('❌ [MONITORING] Error enviando verificación manual');
        setDebugInfo('❌ Error enviando verificación a webhook');
        
        toast({
          title: "Error de verificación",
          description: "Hubo un problema enviando la verificación. Intenta de nuevo.",
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
    }
  }, [user, toast]);

  const cleanup = useCallback(() => {
    console.log('🧹 [MONITORING] Limpieza completa del monitoreo manual');
    setDebugInfo('🧹 Sistema manual limpiado');
    clearAllIntervals();
  }, [clearAllIntervals]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    timeRemaining,
    generationStartTime,
    debugInfo,
    startCountdown,
    startPeriodicChecking: () => {}, // Legacy compatibility - no hace nada
    checkFinalResult: () => {}, // Legacy compatibility - no hace nada
    checkVideoManually,
    cleanup
  };
};
