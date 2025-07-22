
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, CheckCircle2 } from 'lucide-react';
import { VideoStyle } from '@/types/videoFlow';

interface Props {
  style: VideoStyle;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (style: VideoStyle) => void;
  onTogglePlay: (styleId: string, event: React.MouseEvent) => void;
  onVideoEnded: (styleId: string) => void;
  onVideoRef: (styleId: string) => (ref: HTMLVideoElement | null) => void;
}

const VideoStyleCard: React.FC<Props> = ({
  style,
  isSelected,
  isPlaying,
  onSelect,
  onTogglePlay,
  onVideoEnded,
  onVideoRef
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Función para obtener la URL del video actualizada
  const getVideoUrl = (styleId: string, originalUrl: string) => {
    switch (styleId) {
      case 'style-5':
        // Nuevo video para Estilo Manual 1
        return 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%205.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyA1Lm1wNCIsImlhdCI6MTc1MzE2MDQ1MCwiZXhwIjoxNzg0Njk2NDUwfQ.n8K30BK5SdU6clddqOeg_ZnAnIh8J1FT9eBmz5Magog';
      case 'style-7':
        // Nuevo video para Estilo Multi-Avatar
        return 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Multi-Avatar%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL011bHRpLUF2YXRhciAxLm1wNCIsImlhdCI6MTc1MzE2MjM2OCwiZXhwIjoxNzg0Njk4MzY4fQ.MTyrQzOS5hgMnhH1ag_UP2vgoIJjrfMd_wV5wRT2HO8';
      default:
        return originalUrl;
    }
  };

  const getStyleRequirements = (styleId: string) => {
    switch (styleId) {
      case 'style-5':
      case 'style-6':
        // Estilo Manual y Estilo Manual 2 - requieren archivos propios
        return <div className="space-y-1">
            <p className="font-medium text-yellow-400">Requisitos:</p>
            <p className="text-muted-foreground">1. Subir 14 imágenes (horizontal o cuadrado)</p>
            <p className="text-muted-foreground">2.  Subir 5 videos (horizontal o cuadrado)</p>
            <p className="text-muted-foreground">3. Se requiere Avatar Horizontal</p>
          </div>;
      case 'style-7':
        return <div className="space-y-1">
            <p className="font-medium text-yellow-400">Requisitos:</p>
            <p className="text-muted-foreground">1. UN AVATAR normal</p>
            <p className="text-muted-foreground">2. El segundo AVATAR con FONDO VERDE</p>
            <p className="text-muted-foreground">
              <a href="https://drive.google.com/uc?id=1Fq2RtxL9J4hYkhYBsmLOGQbb1dd2N3TD&export=download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Descargar Fondo Verde
              </a>
            </p>
          </div>;
      case 'style-4':
        // Estilo Educativo 2 - solo avatar horizontal
        return <div className="space-y-1">
            <p className="font-medium text-yellow-400">Requisitos:</p>
            <p className="text-muted-foreground">Se requiere Avatar Horizontal</p>
          </div>;
      case 'style-1':
      case 'style-2':
      case 'style-3':
        // Primeros 3 estilos - fondo verde con enlace de descarga
        return <div className="space-y-1">
            <p className="font-medium text-yellow-400">Requisitos:</p>
            <p className="text-muted-foreground">1. Se requiere <strong>Fondo Verde</strong></p>
            <p className="text-muted-foreground">
              <a href="https://drive.google.com/uc?id=1CkXfUEhw23bDhVmqSWrCMzHhr3IK6oVE&export=download" target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 font-semibold hover:text-fuchsia-300 underline">
                Descargar Fondo
              </a>
            </p>
            <p className="text-muted-foreground">2. Se requiere Avatar Horizontal</p>
          </div>;
      default:
        // Otros estilos - requisitos originales
        return <div className="space-y-1">
            <p className="font-medium text-yellow-400">Requisitos:</p>
            <p className="text-muted-foreground">1. Se requiere Avatar en Fondo Total Negro</p>
            <p className="text-muted-foreground">2. Se requiere Avatar Horizontal</p>
          </div>;
    }
  };

  return (
    <Card className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-[1.02] ${isSelected ? 'cyber-glow-intense' : ''}`}>
      <CardContent className="p-4 sm:p-6">
        {/* Video preview */}
        <div className="aspect-[9/16] mb-4 sm:mb-6 rounded-xl overflow-hidden bg-black relative group">
          {isSelected && (
            <div className="absolute top-2 right-2 z-10">
              <CheckCircle2 className="w-5 h-5 text-primary bg-black/50 rounded-full" />
            </div>
          )}
          <video 
            ref={onVideoRef(style.id)} 
            src={getVideoUrl(style.id, style.video_url)} 
            className="w-full h-full object-cover" 
            muted 
            loop 
            playsInline 
            onEnded={() => onVideoEnded(style.id)} 
            preload="metadata" 
          />
          
          {/* Play/Pause overlay */}
          <div 
            className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${!isPlaying || isHovered ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button 
              onClick={e => onTogglePlay(style.id, e)}
              className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              ) : (
                <Play className="w-6 sm:w-8 h-6 sm:h-8 text-white ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Style info */}
        <div className="text-center mb-4 sm:mb-6 space-y-3 sm:space-y-4 py-2">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-normal py-1">
            {style.name}
          </h3>
          <div className="text-xs sm:text-sm leading-relaxed px-2">
            {getStyleRequirements(style.id)}
          </div>
        </div>

        <Button 
          onClick={() => onSelect(style)} 
          className="w-full cyber-glow h-10 sm:h-12 text-sm sm:text-base font-medium" 
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Continuar al Generador" : "Elegir Estilo"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoStyleCard;
