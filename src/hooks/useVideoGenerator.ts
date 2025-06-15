
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
    console.log('Activando sistema de monitoreo para requestId:', requestId);
    
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
            console.log('Video completado y encontrado:', videoUrl);
            
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
        console.error('Error durante monitoreo:', e);
      }
    }, 20000); // Verificar cada 20 segundos para ser eficiente
  };

  const connectToWebhook = async (script: string, requestId: string) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Timeout de 2 horas para permitir conexión estable
    const webhookTimeout = 2 * 60 * 60 * 1000; // 2 horas = 7,200,000 ms
    const timeoutId = setTimeout(() => {
      console.log('Timeout de webhook alcanzado, activando sistema de monitoreo');
      controller.abort();
    }, webhookTimeout);

    try {
      console.log('Conectando con el servicio de generación de video...');
      
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
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del servicio recibida:', data);
      
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
        console.log('Video en procesamiento, activando monitoreo automático...');
        startPolling(requestId, script);
        toast({ 
          title: "Video en procesamiento", 
          description: "Tu video se está generando. Te notificaremos cuando esté listo." 
        });
        return true;
      }

    } catch (err) {
      clearTimeout(timeoutId);
      console.log('Conexión finalizada, activando sistema de monitoreo:', err);

      // Si es por timeout o abort (normal), activar polling sin mostrar error
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('timeout'))) {
        console.log('Activando monitoreo automático del progreso...');
        startPolling(requestId, script);
        
        toast({
          title: "Procesamiento en curso",
          description: "Tu video se está generando en segundo plano. Te notificaremos cuando esté listo.",
        });
        
        return true;
      } else {
        // Solo mostrar error si es un error real (no timeout)
        throw err;
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

    const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
    const generationState: GenerationState = { 
      script: script.trim(), 
      requestId, 
      timestamp: Date.now(), 
      status: 'pending' 
    };
    saveGenerationState(generationState);

    console.log('Iniciando generación de video con conexión estable');
    
    try {
      await connectToWebhook(script.trim(), requestId);
    } catch (err) {
      console.error('Error en generación:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      clearGenerationState();
      setIsGenerating(false);
      
      toast({ 
        title: "Error de conexión", 
        description: "No se pudo conectar con el servicio. Por favor, verifica tu conexión e intenta de nuevo.", 
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
              // Si no está en BD, activar monitoreo
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
