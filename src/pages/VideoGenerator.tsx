
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2, Bookmark, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoLoadingState from '@/components/video/VideoLoadingState';
import VideoResult from '@/components/video/VideoResult';

interface VideoGenerationResponse {
  videoUrl?: string;
  message?: string;
  error?: string;
}

interface GenerationState {
  script: string;
  requestId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

// Función para extraer la URL del video de diferentes formatos de respuesta
const extractVideoUrl = (data: any): string | null => {
  console.log('Respuesta completa de la webhook:', data);
  
  // Si la respuesta es un array, tomar el primer elemento
  if (Array.isArray(data) && data.length > 0) {
    console.log('Respuesta es un array, procesando primer elemento:', data[0]);
    return extractVideoUrl(data[0]);
  }
  
  // Si es un objeto, buscar la URL en diferentes campos posibles
  if (data && typeof data === 'object') {
    const possibleFields = ['videoUrl', 'url', 'link', 'video'];
    
    for (const field of possibleFields) {
      if (data[field] && typeof data[field] === 'string') {
        console.log(`URL encontrada en campo '${field}':`, data[field]);
        return data[field];
      }
    }
    
    // Si no encontramos en campos directos, buscar en el mensaje
    if (data.message && typeof data.message === 'string') {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = data.message.match(urlRegex);
      if (matches && matches.length > 0) {
        console.log('URL encontrada en mensaje:', matches[0]);
        return matches[0];
      }
    }
  }
  
  console.log('No se pudo extraer URL de la respuesta');
  return null;
};

// Funciones para manejar el estado persistente
const saveGenerationState = (state: GenerationState) => {
  localStorage.setItem('video_generation_state', JSON.stringify(state));
};

const getGenerationState = (): GenerationState | null => {
  const saved = localStorage.getItem('video_generation_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing saved state:', error);
      localStorage.removeItem('video_generation_state');
    }
  }
  return null;
};

const clearGenerationState = () => {
  localStorage.removeItem('video_generation_state');
};

const VideoGenerator = () => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar si hay una generación pendiente al cargar la página
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
        // La generación es muy antigua, limpiar el estado
        clearGenerationState();
      }
    }
  }, [toast]);

  // Limpiar intervalos al desmontar el componente
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

  // Función para guardar el video en Supabase
  const saveVideoToDatabase = async (script: string, videoUrl: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('generated_videos')
        .insert({
          user_id: user.id,
          script: script.trim(),
          video_url: videoUrl
        });

      if (error) {
        console.error('Error guardando video en BD:', error);
      } else {
        console.log('Video guardado exitosamente en BD');
      }
    } catch (error) {
      console.error('Error inesperado guardando video:', error);
    }
  };

  // Función para hacer polling del estado del video
  const startPolling = (requestId: string, script: string) => {
    console.log('Iniciando polling para requestId:', requestId);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Aquí podrías implementar un endpoint de estado si el webhook lo soporta
        // Por ahora, verificaremos en la base de datos si el video fue guardado
        if (user) {
          const { data, error } = await supabase
            .from('generated_videos')
            .select('video_url')
            .eq('user_id', user.id)
            .eq('script', script.trim())
            .order('created_at', { ascending: false })
            .limit(1);

          if (data && data.length > 0 && !error) {
            const videoUrl = data[0].video_url;
            console.log('Video encontrado en BD durante polling:', videoUrl);
            
            // Detener polling y mostrar resultado
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            
            setVideoResult(videoUrl);
            setIsGenerating(false);
            clearGenerationState();
            
            toast({
              title: "¡Video recuperado!",
              description: "Tu video fue encontrado y está listo.",
            });
          }
        }
      } catch (error) {
        console.error('Error durante polling:', error);
      }
    }, 10000); // Verificar cada 10 segundos
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

    // Crear un identificador único para esta generación
    const requestId = `${user?.id || 'anonymous'}-${Date.now()}`;
    
    // Guardar estado de generación
    const generationState: GenerationState = {
      script: script.trim(),
      requestId,
      timestamp: Date.now(),
      status: 'pending'
    };
    saveGenerationState(generationState);

    // Crear AbortController para timeout de 2 horas
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, 120 * 60 * 1000); // 2 horas

    try {
      console.log('Enviando guion a webhook:', script);
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/veroia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script.trim(),
          userId: user?.id || 'anonymous',
          requestId: requestId,
          timestamp: new Date().toISOString()
        }),
        signal: abortControllerRef.current.signal
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
        await saveVideoToDatabase(script, videoUrl);
        clearGenerationState();
        
        toast({
          title: "¡Video generado!",
          description: "Tu video ha sido creado exitosamente.",
        });
      } else {
        console.error('No se encontró URL de video en la respuesta:', data);
        
        // En lugar de fallar, iniciar polling como respaldo
        toast({
          title: "Procesando video",
          description: "El video se está generando. Verificando estado automáticamente...",
        });
        
        startPolling(requestId, script);
        return; // No detener isGenerating aquí
      }

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error generando video:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        // Timeout - iniciar polling como respaldo
        toast({
          title: "Procesamiento en curso",
          description: "La generación está tomando más tiempo. Verificando estado automáticamente...",
        });
        
        startPolling(requestId, script);
        return; // No detener isGenerating
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        clearGenerationState();
        
        toast({
          title: "Error al generar video",
          description: "Hubo un problema al generar tu video. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
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
      
      toast({
        title: "Recuperando generación",
        description: "Verificando si tu video ya está listo...",
      });
      
      // Iniciar polling para recuperar el video
      startPolling(savedState.requestId, savedState.script);
      
      // También verificar inmediatamente en la base de datos
      if (user) {
        supabase
          .from('generated_videos')
          .select('video_url')
          .eq('user_id', user.id)
          .eq('script', savedState.script)
          .order('created_at', { ascending: false })
          .limit(1)
          .then(({ data, error }) => {
            if (data && data.length > 0 && !error) {
              const videoUrl = data[0].video_url;
              setVideoResult(videoUrl);
              setIsGenerating(false);
              setIsRecovering(false);
              clearGenerationState();
              
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
              }
              
              toast({
                title: "¡Video recuperado!",
                description: "Tu video estaba listo y ha sido recuperado.",
              });
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
    toast({
      title: "Generación cancelada",
      description: "El estado de generación anterior ha sido eliminado.",
    });
  };

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
    setGenerationStartTime(null);
    setShowRecoveryOption(false);
    clearGenerationState();
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Calcular tiempo transcurrido
  const getElapsedTime = () => {
    if (!generationStartTime) return '';
    const elapsed = Math.floor((Date.now() - generationStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Si estamos generando el video, mostrar estado de carga
  if (isGenerating) {
    return (
      <VideoLoadingState 
        elapsedTime={getElapsedTime()}
        isRecovering={isRecovering}
      />
    );
  }

  // Si ya tenemos resultado, mostrar el resultado
  if (videoResult) {
    return (
      <VideoResult 
        videoUrl={videoResult} 
        onNewVideo={handleNewVideo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/videos-guardados')}
            className="cyber-border hover:cyber-glow"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Videos Guardados
          </Button>
        </div>

        {/* Recovery notification */}
        {showRecoveryOption && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Generación en progreso detectada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Encontramos una generación de video en curso. Tu video podría estar listo.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleRecoverGeneration}
                      className="cyber-border hover:cyber-glow"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verificar Estado
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelRecovery}
                      className="cyber-border hover:cyber-glow"
                    >
                      Cancelar y Empezar Nuevo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              Generador de Videos IA
            </h1>
            <p className="text-muted-foreground text-lg">
              Convierte tu guion en un video profesional con inteligencia artificial
            </p>
          </div>

          {/* Script input card */}
          <div className="bg-card cyber-border rounded-2xl p-8 hover:cyber-glow transition-all duration-500 mb-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="script" className="block text-lg font-semibold text-foreground mb-3">
                  Ingresa tu enlace de Noticia y Opcional alguna indicación
                </label>
                <Textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Pega aquí el enlace de la noticia y opcionalmente agrega indicaciones sobre cómo quieres el guion..."
                  className="min-h-[200px] text-base cyber-border focus:cyber-glow resize-none"
                  maxLength={1400}
                />
                <div className="flex justify-end items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {script.length}/1400
                  </span>
                </div>
              </div>

              {/* Processing time warning */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">
                      Tiempo de procesamiento extendido
                    </p>
                    <p className="text-muted-foreground text-sm">
                      La generación puede tomar hasta 50 minutos. El sistema verificará automáticamente 
                      el progreso y te notificará cuando esté listo.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerateVideo}
                disabled={!script.trim() || isGenerating}
                size="lg"
                className="w-full cyber-border hover:cyber-glow-intense transition-all duration-300"
              >
                <Send className="w-5 h-5 mr-2" />
                Generar Video
              </Button>
            </div>
          </div>

          {/* Tips section */}
          <div className="bg-card/50 cyber-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Consejos para mejores resultados:
            </h3>
            <div className="text-muted-foreground space-y-3 text-sm">
              <p>
                Solo pega tu enlace de noticia y si deseas puedes dar algunas indicaciones de cómo quieres el guion.
              </p>
              <blockquote className="border-l-2 border-primary/50 pl-4 italic bg-background/20 p-2 rounded-r-lg">
                <p className="font-semibold text-foreground/80 not-italic">Ejemplo:</p>
                <p>
                  https://www.bluradio.com/economia/gobierno-se-opone-a-jornada-laboral-de-4x3-esto-se-ha-aprobado-hasta-ahora-so35?utm_source=BluRadio&utm_medium=WhatsApp hazme un guion de esta noticia y que al Final la gente comente la Palabra "DÓLAR" para recibir más información.
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Background geometric shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default VideoGenerator;
