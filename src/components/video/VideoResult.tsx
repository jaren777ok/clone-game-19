
import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy, ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { cleanupManualCustomizationFiles } from '@/lib/videoCleanup';

interface VideoResultProps {
  videoUrl: string;
  onNewVideo: () => void;
}

const VideoResult = ({ videoUrl, onNewVideo }: VideoResultProps) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Clean up base64 files when video is successfully completed
  useEffect(() => {
    const cleanupFiles = async () => {
      try {
        await cleanupManualCustomizationFiles(user);
        console.log('🧹 Archivos base64 limpiados después de completar video');
      } catch (error) {
        console.error('❌ Error limpiando archivos base64:', error);
      }
    };

    cleanupFiles();
  }, [user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace del video ha sido copiado al portapapeles.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Intenta seleccionarlo manualmente.",
        variant: "destructive"
      });
    }
  };

  const handleOpenVideo = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Success animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-primary rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-6 animate-cyber-pulse">
            <CheckCircle className="w-16 h-16 text-background" />
          </div>
          
          {/* Success sparkles */}
          <div className="absolute -top-4 -right-4 animate-bounce">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
          </div>
          <div className="absolute -bottom-4 -left-4 animate-bounce delay-300">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
        </div>

        {/* Success message */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-primary to-accent bg-clip-text text-transparent animate-glow-text">
          ¡Video Generado!
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          Tu video ha sido creado exitosamente con inteligencia artificial
        </p>

        {/* Video link display */}
        <div className="bg-card cyber-border rounded-2xl p-8 mb-8 hover:cyber-glow transition-all duration-500">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Enlace de tu Video
          </h3>
          
          <div className="bg-muted/30 cyber-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-foreground font-mono text-sm break-all flex-1 min-w-0">
                {videoUrl}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="cyber-border hover:cyber-glow flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleOpenVideo}
              size="lg"
              className="cyber-border hover:cyber-glow-intense"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Ver Video
            </Button>
            
            <Button
              onClick={onNewVideo}
              variant="outline"
              size="lg"
              className="cyber-border hover:cyber-glow"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Generar Otro Video
            </Button>
          </div>
        </div>

        {/* Tips for sharing */}
        <div className="bg-card/50 cyber-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            💡 Consejos para compartir tu video:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-sm">
            <div className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Guarda el enlace en un lugar seguro
            </div>
            <div className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Compártelo en redes sociales
            </div>
            <div className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Descarga el video si es necesario
            </div>
            <div className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Úsalo en tus presentaciones
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="cyber-border hover:cyber-glow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Button>
      </div>

      {/* Background celebration effects */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-green-400/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-float delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-accent/10 rounded-full blur-lg animate-float delay-500"></div>
    </div>
  );
};

export default VideoResult;
