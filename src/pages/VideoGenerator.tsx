
import React, { useState } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import VideoLoadingState from '@/components/video/VideoLoadingState';
import VideoResult from '@/components/video/VideoResult';

interface VideoGenerationResponse {
  videoUrl?: string;
  message?: string;
  error?: string;
}

const VideoGenerator = () => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VideoGenerationResponse = await response.json();
      console.log('Respuesta del webhook:', data);

      if (data.videoUrl) {
        setVideoResult(data.videoUrl);
        toast({
          title: "¡Video generado!",
          description: "Tu video ha sido creado exitosamente.",
        });
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No se recibió un enlace de video válido');
      }

    } catch (error) {
      console.error('Error generando video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error al generar video",
        description: "Hubo un problema al generar tu video. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewVideo = () => {
    setScript('');
    setVideoResult(null);
    setError(null);
  };

  // Si estamos generando el video, mostrar estado de carga
  if (isGenerating) {
    return <VideoLoadingState />;
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
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mr-4 cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>

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
                  Ingresa tu Guion
                </label>
                <Textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Escribe aquí el guion para tu video. Sé específico y detallado para obtener mejores resultados..."
                  className="min-h-[200px] text-base cyber-border focus:cyber-glow resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    Describe la escena, el tono, los personajes y cualquier detalle importante
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {script.length}/2000
                  </span>
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
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Sé específico con las descripciones visuales y el ambiente
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Incluye detalles sobre personajes, colores y movimientos
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Especifica el tono y estilo que deseas (dramático, comercial, etc.)
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Mantén el guion claro y bien estructurado
              </li>
            </ul>
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
