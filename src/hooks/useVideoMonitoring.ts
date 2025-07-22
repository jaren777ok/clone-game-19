
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
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateTimeRemaining = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  const clearAllIntervals = useCallback(() => {
    console.log('🧹 [MONITORING] Limpiando intervalos');
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (autoCheckIntervalRef.current) {
      clearInterval(autoCheckIntervalRef.current);
      autoCheckIntervalRef.current = null;
    }
  }, []);

  // Verificación COMPLETAMENTE manual con webhook mejorada
  const checkVideoManually = useCallback(async (
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void,
    isAutoCheck: boolean = false
  ) => {
    if (!user) {
      console.log('❌ [MONITORING] No hay usuario para verificación manual');
      return false;
    }

    if (isChecking) {
      console.log('⏳ [MONITORING] Ya hay una verificación en proceso');
      return false;
    }

    const checkType = isAutoCheck ? 'AUTOMÁTICA' : 'MANUAL';
    console.log(`🔍 [MONITORING] VERIFICACIÓN ${checkType} INICIADA`);
    setDebugInfo(`🔍 Verificando estado del video (${checkType.toLowerCase()})...`);
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
        if (!isAutoCheck) {
          toast({
            title: "Error de verificación",
            description: "No se encontró un video en proceso para verificar.",
            variant: "destructive"
          });
        }
        return false;
      }

      console.log(`📦 [MONITORING] Datos de tracking obtenidos (${checkType}):`, {
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
          console.log(`🎥 [MONITORING] Video completado (${checkType}):`, result.videoUrl);
          setDebugInfo('🎥 Video completado exitosamente');
          
          // Limpiar intervalos automáticos cuando el video esté listo
          clearAllIntervals();
          
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
          console.log(`⏳ [MONITORING] Video aún no está listo (${checkType})`);
          setDebugInfo(`⏳ Video en proceso - ${isAutoCheck ? 'verificación automática' : 'intenta de nuevo más tarde'}`);
          
          // Solo mostrar toast para verificaciones manuales
          if (!isAutoCheck) {
            toast({
              title: "Video en proceso",
              description: "El video aún no está listo. Intenta de nuevo más tarde.",
              variant: "default"
            });
          }
          
          return false;
        }
      } else {
        // Solo casos críticos llegan aquí (no debería pasar con la nueva lógica)
        console.error(`❌ [MONITORING] Error crítico en verificación ${checkType.toLowerCase()}`);
        setDebugInfo('❌ Error crítico en verificación');
        
        // Solo mostrar toast para verificaciones manuales
        if (!isAutoCheck) {
          toast({
            title: "Error de verificación",
            description: "Hubo un problema crítico con la verificación. Intenta de nuevo.",
            variant: "destructive"
          });
        }
        
        return false;
      }
    } catch (error) {
      console.error(`💥 [MONITORING] Error en verificación ${checkType.toLowerCase()}:`, error);
      setDebugInfo(`💥 Error: ${error}`);
      
      // Solo mostrar toast para verificaciones manuales
      if (!isAutoCheck) {
        toast({
          title: "Error de verificación",
          description: "Hubo un problema con la verificación manual.",
          variant: "destructive"
        });
      }
      
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, toast, isChecking, clearAllIntervals]);

  // Sistema completamente manual - solo countdown visual + verificación automática
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
    
    console.log('🚀 [MONITORING] INICIANDO SISTEMA CON VERIFICACIÓN AUTOMÁTICA:', {
      requestId,
      startTime: new Date(startTime).toISOString(),
      userId: user.id
    });
    
    setGenerationStartTime(startTime);
    setDebugInfo('🚀 Sistema activo - verificación automática cada minuto');
    
    // Solo countdown timer visual - SIN verificaciones automáticas iniciales
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      
      updateTimeRemaining(remaining);
      
      if (remaining <= 0) {
        console.log('⏰ [MONITORING] Tiempo agotado - manteniendo verificación automática');
        setDebugInfo('⏰ Tiempo agotado - verificación automática activa');
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    // Iniciar verificación automática después de 1 minuto
    console.log('⏱️ [MONITORING] Programando verificación automática cada 60 segundos');
    setTimeout(() => {
      // Verificación inmediata después del primer minuto
      checkVideoManually(requestId, scriptToCheck, setVideoResult, setIsGenerating, true);
      
      // Luego cada minuto
      autoCheckIntervalRef.current = setInterval(() => {
        checkVideoManually(requestId, scriptToCheck, setVideoResult, setIsGenerating, true);
      }, 60000); // 60 segundos
    }, 60000); // Iniciar después de 1 minuto
  }, [user, updateTimeRemaining, checkVideoManually]);

  // Wrapper para verificación manual desde el botón
  const checkVideoManuallyFromButton = useCallback((
    requestId: string,
    scriptToCheck: string,
    setVideoResult: (result: string) => void,
    setIsGenerating: (generating: boolean) => void
  ) => {
    return checkVideoManually(requestId, scriptToCheck, setVideoResult, setIsGenerating, false);
  }, [checkVideoManually]);

  const cleanup = useCallback(() => {
    console.log('🧹 [MONITORING] Limpieza completa del monitoreo automático');
    setDebugInfo('🧹 Sistema limpiado');
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
    startCountdown,
    startPeriodicChecking: () => {}, // Legacy compatibility - no hace nada
    checkFinalResult: () => {}, // Legacy compatibility - no hace nada
    checkVideoManually: checkVideoManuallyFromButton,
    cleanup
  };
};
