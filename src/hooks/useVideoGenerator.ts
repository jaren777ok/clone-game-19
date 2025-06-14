
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
      const maxWaitTime = 60 * 60 * 1000; // 1 hora

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
              title: "¡Video recuperado!",
              description: "Tu video fue encontrado y está listo.",
            });
          }
        }
      } catch (e) {
        console.error('Error durante polling:', e);
      }
    }, 10000); // Verificar cada 10 segundos
  };

  const handleGenerateVideo = async () => {
    if (!script.trim()) {
      toast({ title: "Guion requerido", description: "Por favor, ingresa un guion para generar el video.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoResult(null);
    setGenerationStartTime(Date.now());
    setShowRecoveryOption(false);

    const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
    const generationState: GenerationState = { script: script.trim(), requestId, timestamp: Date.now(), status: 'pending' };
    saveGenerationState(generationState);

    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 120 * 60 * 1000); // 2 horas

    try {
      console.log('Enviando guion a webhook:', script);
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/veroia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: script.trim(), userId: user?.id || 'anonymous', requestId, timestamp: new Date().toISOString() }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Respuesta del webhook recibida:', data);
      const videoUrl = extractVideoUrl(data);

      if (videoUrl) {
        setVideoResult(videoUrl);
        await saveVideoToDatabase(script, videoUrl, user);
        clearGenerationState();
        toast({ title: "¡Video generado!", description: "Tu video ha sido creado exitosamente." });
      } else {
        console.error('No se encontró URL de video en la respuesta:', data);
        toast({ title: "Procesando video", description: "El video se está generando. Verificando estado automáticamente..." });
        startPolling(requestId, script);
        return;
      }

    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error generando video:', err);
      
      if (err instanceof Error && err.name === 'AbortError') {
        toast({ title: "Procesamiento en curso", description: "La generación está tomando más tiempo. Verificando estado automáticamente..." });
        startPolling(requestId, script);
        return;
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        clearGenerationState();
        toast({ title: "Error al generar video", description: "Hubo un problema al generar tu video. Por favor, intenta de nuevo.", variant: "destructive" });
      }
    } finally {
      if (!pollingIntervalRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleRecoverGeneration = () => {
    const savedState = getGenerationState();
    if (savedState) {
      setIsRecovering(true);
      setIsGenerating(true);
      setShowRecoveryOption(false);
      toast({ title: "Recuperando generación", description: "Verificando si tu video ya está listo..." });
      
      startPolling(savedState.requestId, savedState.script);
      
      if (user) {
        supabase.from('generated_videos').select('video_url').eq('user_id', user.id).eq('script', savedState.script).order('created_at', { ascending: false }).limit(1)
          .then(({ data, error: dbError }) => {
            if (data && data.length > 0 && !dbError) {
              setVideoResult(data[0].video_url);
              setIsGenerating(false);
              setIsRecovering(false);
              clearGenerationState();
              if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              toast({ title: "¡Video recuperado!", description: "Tu video estaba listo y ha sido recuperado." });
            } else {
              setIsRecovering(false);
            }
          });
      }
    }
  };

  const handleCancelRecovery = () => {
    clearGenerationState();
    setShowRecoveryOption(false);
    toast({ title: "Generación cancelada", description: "El estado de generación anterior ha sido eliminado." });
  };

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
    setGenerationStartTime(null);
    setShowRecoveryOption(false);
    clearGenerationState();
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
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
