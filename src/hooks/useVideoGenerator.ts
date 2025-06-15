
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  GenerationState,
  getGenerationState,
  saveGenerationState,
  clearGenerationState,
  extractVideoUrl,
  saveVideoToDatabase,
} from '@/lib/videoGeneration';

export const useVideoGenerator = () => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    const savedState = getGenerationState();
    if (savedState && savedState.status === 'pending') {
      const timeElapsed = Date.now() - savedState.timestamp;
      const maxWaitTime = 2 * 60 * 60 * 1000; // 2 horas

      if (timeElapsed < maxWaitTime) {
        setScript(savedState.script);
        setShowRecoveryOption(true);
        toast({
          title: "Generación pendiente",
          description: "Detectamos una generación de video en progreso. ¿Quieres recuperarla?",
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startPolling = (requestId: string, scriptToPoll: string) => {
    console.log('Iniciando polling para requestId:', requestId);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        if (user) {
          const { data, error: dbError } = await supabase
            .from('generated_videos')
            .select('video_url')
            .eq('user_id', user.id)
            .eq('script', scriptToPoll.trim())
            .order('created_at', { ascending: false })
            .limit(1);

          if (data && data.length > 0 && !dbError) {
            const videoUrl = data[0].video_url;
            console.log('Video encontrado en BD durante polling:', videoUrl);
            
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            
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
        console.error('Error durante polling:', e);
      }
    }, 15000); // Verificar cada 15 segundos para ser más eficiente
  };

  const attemptWebhookConnection = async (script: string, requestId: string, retryCount = 0) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Timeout dinámico: aumenta con cada reintento
    const timeoutDuration = Math.min(30000 + (retryCount * 10000), 60000); // 30s base, max 60s
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      console.log(`Intento ${retryCount + 1} de conexión con webhook`);
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/veroia', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({ 
          script: script.trim(), 
          userId: user?.id || 'anonymous', 
          requestId, 
          timestamp: new Date().toISOString() 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del webhook recibida:', data);
      
      const videoUrl = extractVideoUrl(data);
      
      if (videoUrl) {
        setVideoResult(videoUrl);
        await saveVideoToDatabase(script, videoUrl, user);
        clearGenerationState();
        toast({ 
          title: "¡Video generado!", 
          description: "Tu video ha sido creado exitosamente." 
        });
        return true;
      } else {
        console.log('No se encontró URL inmediata, activando polling...');
        startPolling(requestId, script);
        toast({ 
          title: "Procesando video", 
          description: "Tu video se está generando en segundo plano. Te notificaremos cuando esté listo." 
        });
        return true;
      }

    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`Error en intento ${retryCount + 1}:`, err);

      // Si es un error de red/timeout y tenemos reintentos disponibles
      if (retryCount < maxReconnectAttempts && 
          (err instanceof Error && (err.name === 'AbortError' || err.message.includes('fetch')))) {
        
        reconnectAttemptsRef.current = retryCount + 1;
        console.log(`Reintentando conexión en ${(retryCount + 1) * 2} segundos...`);
        
        toast({
          title: "Reintentando conexión",
          description: `Intento ${retryCount + 1}/${maxReconnectAttempts}. Reconectando...`,
        });

        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        
        return attemptWebhookConnection(script, requestId, retryCount + 1);
      } else {
        // Todos los reintentos fallaron, activar polling como respaldo
        console.log('Todos los reintentos fallaron, activando sistema de respaldo');
        startPolling(requestId, script);
        
        toast({
          title: "Activando modo de respaldo",
          description: "La conexión directa falló, pero tu video se está procesando. Te notificaremos cuando esté listo.",
        });
        
        return true; // No es realmente un error, solo cambio de estrategia
      }
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
    setGenerationStartTime(Date.now());
    setShowRecoveryOption(false);
    reconnectAttemptsRef.current = 0;

    const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
    const generationState: GenerationState = { 
      script: script.trim(), 
      requestId, 
      timestamp: Date.now(), 
      status: 'pending' 
    };
    saveGenerationState(generationState);

    console.log('Iniciando generación de video con conexión mejorada');
    
    try {
      const success = await attemptWebhookConnection(script.trim(), requestId);
      
      if (!success) {
        throw new Error('No se pudo establecer conexión con el servicio');
      }

    } catch (err) {
      console.error('Error final en generación:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      clearGenerationState();
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servicio. Por favor, intenta de nuevo.", 
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
      setGenerationStartTime(savedState.timestamp);
      
      toast({ 
        title: "Recuperando generación", 
        description: "Verificando si tu video ya está listo..." 
      });
      
      // Verificar primero en la base de datos
      if (user) {
        supabase.from('generated_videos')
          .select('video_url')
          .eq('user_id', user.id)
          .eq('script', savedState.script)
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
              // Si no está en BD, activar polling
              setIsRecovering(false);
              startPolling(savedState.requestId, savedState.script);
            }
          });
      }
    }
  };

  const handleCancelRecovery = () => {
    clearGenerationState();
    setShowRecoveryOption(false);
    toast({ 
      title: "Generación cancelada", 
      description: "El estado de generación anterior ha sido eliminado." 
    });
  };

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
    setGenerationStartTime(null);
    setShowRecoveryOption(false);
    setIsRecovering(false);
    reconnectAttemptsRef.current = 0;
    clearGenerationState();
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const getElapsedTime = () => {
    if (!generationStartTime) return '';
    const elapsed = Math.floor((Date.now() - generationStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    state: {
      script,
      isGenerating,
      videoResult,
      error,
      showRecoveryOption,
      isRecovering,
      elapsedTime: getElapsedTime(),
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
