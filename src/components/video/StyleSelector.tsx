
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { VideoStyle } from '@/hooks/useVideoCreationFlow';

interface Props {
  onSelectStyle: (style: VideoStyle) => void;
  onBack: () => void;
}

const StyleSelector: React.FC<Props> = ({ onSelectStyle, onBack }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const videoStyles: VideoStyle[] = [
    {
      id: 'style-1',
      name: 'Estilo Dinámico',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/esquina%20(1).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2VzcXVpbmEgKDEpLm1wNCIsImlhdCI6MTc1MDAyNjU0NCwiZXhwIjoxNzUyNjE4NTQ0fQ.E1GFP10IPk9IPHaxHLIZlpaWXsNQvmKFzYeR0yxc0ZE'
    },
    {
      id: 'style-2',
      name: 'Estilo Elegante',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/esquina.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2VzcXVpbmEubXA0IiwiaWF0IjoxNzUwMDI2NTU3LCJleHAiOjE3NTI2MTg1NTd9.srmYsafAWHFucPiqcqXyGI2c_mlRr-xNSaMyM2luVzw'
    }
  ];

  const handleSelectStyle = (style: VideoStyle) => {
    setSelectedStyleId(style.id);
    onSelectStyle(style);
  };

  const toggleVideoPlayback = (styleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const video = videoRefs.current[styleId];
    
    if (!video) return;

    if (playingVideo === styleId) {
      video.pause();
      setPlayingVideo(null);
    } else {
      // Pausar cualquier otro video que esté reproduciéndose
      Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
        if (videoEl && id !== styleId) {
          videoEl.pause();
        }
      });
      
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
      setPlayingVideo(styleId);
    }
  };

  const handleVideoRef = (styleId: string) => (ref: HTMLVideoElement | null) => {
    videoRefs.current[styleId] = ref;
  };

  const handleVideoEnded = (styleId: string) => {
    setPlayingVideo(null);
    const video = videoRefs.current[styleId];
    if (video) {
      video.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar avatar
          </Button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              Elige el Estilo de Edición
            </h1>
            <p className="text-muted-foreground text-base md:text-lg px-4">
              Selecciona el estilo de edición que quieres que tenga tu video
            </p>
          </div>

          {/* Grid de estilos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {videoStyles.map((style) => (
              <Card 
                key={style.id}
                className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-[1.02] ${
                  selectedStyleId === style.id ? 'cyber-glow-intense' : ''
                }`}
              >
                <CardContent className="p-6">
                  {/* Video preview */}
                  <div className="aspect-[9/16] mb-6 rounded-xl overflow-hidden bg-black relative group">
                    <video
                      ref={handleVideoRef(style.id)}
                      src={style.video_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onEnded={() => handleVideoEnded(style.id)}
                      preload="metadata"
                    />
                    
                    {/* Play/Pause overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleVideoPlayback(style.id, e)}
                        className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        {playingVideo === style.id ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Style info */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
                      {style.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {style.id === 'style-1' 
                        ? "Estilo moderno y energético, perfecto para contenido corporativo y profesional"
                        : "Estilo sofisticado y minimalista, ideal para presentaciones elegantes"
                      }
                    </p>
                  </div>

                  <Button
                    onClick={() => handleSelectStyle(style)}
                    className="w-full cyber-glow h-12 text-base font-medium"
                    variant={selectedStyleId === style.id ? "default" : "outline"}
                  >
                    {selectedStyleId === style.id ? "Continuar al Generador" : "Elegir Estilo"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default StyleSelector;
