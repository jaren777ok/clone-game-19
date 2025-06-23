import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, CheckCircle2 } from 'lucide-react';
import { VideoStyle, CardCustomization } from '@/types/videoFlow';
import CustomizeCardsModal from './CustomizeCardsModal';

interface Props {
  onSelectStyle: (style: VideoStyle, customization?: CardCustomization) => void;
  onBack: () => void;
}

const StyleSelector: React.FC<Props> = ({ onSelectStyle, onBack }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [previouslySelectedStyle, setPreviouslySelectedStyle] = useState<VideoStyle | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [pendingStyle, setPendingStyle] = useState<VideoStyle | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const videoStyles: VideoStyle[] = [
    {
      id: 'style-1',
      name: 'Estilo Noticia',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/esquina%20(1).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2VzcXVpbmEgKDEpLm1wNCIsImlhdCI6MTc1MDAyNjU0NCwiZXhwIjoxNzUyNjE4NTQ0fQ.E1GFP10IPk9IPHaxHLIZlpaWXsNQvmKFzYeR0yxc0ZE'
    },
    {
      id: 'style-2',
      name: 'Estilo Noticiero',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/ESTILO%202.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VTVElMTyAyLm1wNCIsImlhdCI6MTc1MDU3NDI2NiwiZXhwIjoxNzgyMTEwMjY2fQ.DnoUX_dchVZkgiprnWvBeElxmn_k183nU8H5W1E0IiE'
    }
  ];

  useEffect(() => {
    // Cargar selección previa del localStorage
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedStyle) {
          setPreviouslySelectedStyle(parsedState.selectedStyle);
          setSelectedStyleId(parsedState.selectedStyle.id);
        }
      } catch (error) {
        console.error('Error parsing saved flow state:', error);
      }
    }
  }, []);

  const handleSelectStyle = (style: VideoStyle) => {
    if (style.id === 'style-1') {
      // Estilo Noticia requiere personalización
      setPendingStyle(style);
      setShowCustomizeModal(true);
    } else {
      // Estilo Noticiero continúa directamente
      setSelectedStyleId(style.id);
      onSelectStyle(style);
    }
  };

  const handleCustomizeConfirm = (customization: CardCustomization) => {
    if (pendingStyle) {
      setSelectedStyleId(pendingStyle.id);
      onSelectStyle(pendingStyle, customization);
    }
    setShowCustomizeModal(false);
    setPendingStyle(null);
  };

  const handleCustomizeCancel = () => {
    setShowCustomizeModal(false);
    setPendingStyle(null);
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
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar avatar
          </Button>
        </div>

        {/* Mostrar selección previa si existe */}
        {previouslySelectedStyle && (
          <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">Selección anterior</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tienes <strong>{previouslySelectedStyle.name}</strong> seleccionado previamente. 
                Puedes continuar con esta selección o elegir un estilo diferente.
              </p>
              <Button
                onClick={() => handleSelectStyle(previouslySelectedStyle)}
                className="cyber-glow text-sm"
                size="sm"
              >
                Continuar con {previouslySelectedStyle.name}
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-safe leading-normal py-3 px-4">
              Elige el Estilo de Edición
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4 leading-relaxed">
              Selecciona el estilo de edición que quieres que tenga tu video
            </p>
          </div>

          {/* Grid de estilos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto px-2">
            {videoStyles.map((style) => (
              <Card 
                key={style.id}
                className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-[1.02] ${
                  selectedStyleId === style.id ? 'cyber-glow-intense' : ''
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  {/* Video preview */}
                  <div className="aspect-[9/16] mb-4 sm:mb-6 rounded-xl overflow-hidden bg-black relative group">
                    {selectedStyleId === style.id && (
                      <div className="absolute top-2 right-2 z-10">
                        <CheckCircle2 className="w-5 h-5 text-primary bg-black/50 rounded-full" />
                      </div>
                    )}
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
                        className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        {playingVideo === style.id ? (
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
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
                      {style.id === 'style-1' ? (
                        <p>Estilo personalizable con tarjetas dinámicas para noticias y contenido editorial</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium text-yellow-400">Requisitos:</p>
                          <p>1. Se requiere Avatar en Fondo Total Negro</p>
                          <p>2. Se requiere Avatar Horizontal</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectStyle(style)}
                    className="w-full cyber-glow h-10 sm:h-12 text-sm sm:text-base font-medium"
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

      {/* Modal de personalización */}
      <CustomizeCardsModal
        isOpen={showCustomizeModal}
        onClose={handleCustomizeCancel}
        onConfirm={handleCustomizeConfirm}
      />

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default StyleSelector;
