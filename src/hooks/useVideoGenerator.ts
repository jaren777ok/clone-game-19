
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  GenerationState,
  getGenerationState,
  saveGenerationState,
  clearGenerationState,
  saveVideoToDatabase,
} from '@/lib/videoGeneration';

const COUNTDOWN_TIME = 57 * 60; // 57 minutes in seconds

export const useVideoGenerator = () => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(COUNTDOWN_TIME);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedState = getGenerationState();
    if (savedState && savedState.status === 'pending') {
      const timeElapsed = Date.now() - savedState.timestamp;
      const maxWaitTime = COUNTDOWN_TIME * 1000;

      if (timeElapsed < maxWaitTime) {
        setScript(savedState.script);
        setCurrentRequestId(savedState.requestId);
        setShowRecoveryOption(true);
        toast({
          title: "Procesamiento pendiente",
          description: "Detectamos un video en procesamiento. ¿Quieres continuar verificando?",
        });
      } else {
        clearGenerationState();
      }
    }
  }, [toast]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const startCountdown = (requestId: string, scriptToCheck: string, customStartTime?: number) => {
    const startTime = customStartTime || Date.now();
    console.log('Iniciando contador para requestId:', requestId, 'desde:', new Date(startTime));
    
    setGenerationStartTime(startTime);
    
    // Calcular el tiempo restante basado en el tiempo real transcurrido
    const updateTimeRemaining = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        checkFinalResult(scriptToCheck);
      }
    };

    // Actualizar inmediatamente
    updateTimeRemaining();

    // Continuar actualizando cada segundo
    countdownIntervalRef.current = setInterval(updateTimeRemaining, 1000);
  };

  const startPeriodicChecking = (requestId: string, scriptToCheck: string) => {
    console.log('Iniciando verificación periódica cada 30 segundos');
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        if (user) {
          const { data, error: dbError } = await supabase
            .from('generated_videos')
            .select('video_url, request_id')
            .eq('user_id', user.id)
            .or(`request_id.eq.${requestId},script.eq.${scriptToCheck.trim()}`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (data && data.length > 0 && !dbError) {
            const videoUrl = data[0].video_url;
            console.log('¡Video encontrado durante verificación!:', videoUrl);
            
            // Detener todos los intervalos
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            
            setVideoResult(videoUrl);
            setIsGenerating(false);
            clearGenerationState();
            
            toast({
              title: "¡Video completado!",
              description: "Tu video ha sido generado exitosamente.",
            });
          }
        }
      } catch (e) {
        console.error('Error durante verificación periódica:', e);
      }
    }, 30000); // Verificar cada 30 segundos
  };

  const checkFinalResult = async (scriptToCheck: string) => {
    console.log('Verificación final después del countdown');
    
    try {
      if (user) {
        const { data, error: dbError } = await supabase
          .from('generated_videos')
          .select('video_url')
          .eq('user_id', user.id)
          .eq('script', scriptToCheck.trim())
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0 && !dbError) {
          setVideoResult(data[0].video_url);
          toast({
            title: "¡Video completado!",
            description: "Tu video ha sido generado exitosamente.",
          });
        } else {
          setError('El procesamiento tomó más tiempo del esperado. Contacta con soporte.');
          toast({
            title: "Tiempo agotado",
            description: "El video está tomando más tiempo del esperado. Por favor contacta con soporte.",
            variant: "destructive"
          });
        }
      }
    } catch (e) {
      console.error('Error en verificación final:', e);
      setError('Error al verificar el resultado final');
    }
    
    setIsGenerating(false);
    clearGenerationState();
  };

  const sendToWebhook = async (script: string, requestId: string) => {
    try {
      console.log('Enviando datos a webhook con respuesta inmediata...');
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/veroia', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          script: script.trim(), 
          userId: user?.id || 'anonymous', 
          requestId, 
          timestamp: new Date().toISOString(),
          appMode: 'immediate_response'
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta inmediata recibida:', data);
      
      return true;
    } catch (err) {
      console.error('Error enviando a webhook:', err);
      throw err;
    }
  };

  const handleGenerateVideo = async () => {
    if (!script.trim()) {
      toast({ 
        title: "Guion requerido", 
        description: "Por favor, ingresa un guion para generar el video.", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoResult(null);
    setShowRecoveryOption(false);

    const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
    setCurrentRequestId(requestId);
    
    const generationState: GenerationState = { 
      script: script.trim(), 
      requestId, 
      timestamp: Date.now(), 
      status: 'pending' 
    };
    saveGenerationState(generationState);

    console.log('Iniciando nuevo proceso de generación de video');
    
    try {
      // Enviar a webhook y recibir respuesta inmediata
      await sendToWebhook(script.trim(), requestId);
      
      // Iniciar contador de 57 minutos desde ahora
      startCountdown(requestId, script.trim());
      
      // Iniciar verificación periódica
      startPeriodicChecking(requestId, script.trim());
      
      toast({
        title: "Solicitud enviada",
        description: "Tu video se está procesando. Te notificaremos cuando esté listo.",
      });
      
    } catch (err) {
      console.error('Error en generación:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      clearGenerationState();
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo enviar la solicitud. Por favor, intenta de nuevo.", 
        variant: "destructive" 
      });
    }
  };

  const handleRecoverGeneration = () => {
    const savedState = getGenerationState();
    if (savedState) {
      setIsRecovering(true);
      setIsGenerating(true);
      setShowRecoveryOption(false);
      setCurrentRequestId(savedState.requestId);
      
      // Calcular el tiempo real transcurrido
      const timeElapsed = Date.now() - savedState.timestamp;
      const timeElapsedSeconds = Math.floor(timeElapsed / 1000);
      const remainingTime = Math.max(0, COUNTDOWN_TIME - timeElapsedSeconds);
      
      console.log('Recuperando generación:', {
        timestampOriginal: new Date(savedState.timestamp),
        tiempoTranscurrido: timeElapsedSeconds,
        tiempoRestante: remainingTime
      });
      
      toast({ 
        title: "Recuperando procesamiento", 
        description: "Verificando el estado de tu video..." 
      });
      
      // Verificar primero en la base de datos
      if (user) {
        supabase.from('generated_videos')
          .select('video_url')
          .eq('user_id', user.id)
          .or(`request_id.eq.${savedState.requestId},script.eq.${savedState.script}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .then(({ data, error: dbError }) => {
            if (data && data.length > 0 && !dbError) {
              setVideoResult(data[0].video_url);
              setIsGenerating(false);
              setIsRecovering(false);
              clearGenerationState();
              toast({ 
                title: "¡Video recuperado!", 
                description: "Tu video estaba listo y ha sido recuperado." 
              });
            } else {
              // Si no está en BD, continuar con verificación usando el tiempo real
              setIsRecovering(false);
              if (remainingTime > 0) {
                // Continuar desde el punto correcto usando el timestamp original
                startCountdown(savedState.requestId, savedState.script, savedState.timestamp);
                startPeriodicChecking(savedState.requestId, savedState.script);
              } else {
                // Si ya se agotó el tiempo, ir directo a verificación final
                checkFinalResult(savedState.script);
              }
            }
          });
      }
    }
  };

  const handleCancelRecovery = () => {
    clearGenerationState();
    setShowRecoveryOption(false);
    toast({ 
      title: "Procesamiento cancelado", 
      description: "El estado anterior ha sido eliminado." 
    });
  };

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
    setGenerationStartTime(null);
    setShowRecoveryOption(false);
    setIsRecovering(false);
    setTimeRemaining(COUNTDOWN_TIME);
    setCurrentRequestId(null);
    clearGenerationState();
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  return {
    state: {
      script,
      isGenerating,
      videoResult,
      error,
      showRecoveryOption,
      isRecovering,
      timeRemaining,
      totalTime: COUNTDOWN_TIME,
    },
    handlers: {
      setScript,
      handleGenerateVideo,
      handleRecoverGeneration,
      handleCancelRecovery,
      handleNewVideo,
    },
  };
};
