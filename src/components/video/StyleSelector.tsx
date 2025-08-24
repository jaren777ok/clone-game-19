import React, { useState, useRef, useEffect } from 'react';
import { VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization } from '@/types/videoFlow';
import CustomizeCardsModal from './CustomizeCardsModal';
import PresenterNameModal from './PresenterNameModal';
import ApiVersionModal from './ApiVersionModal';

import StyleSelectorHeader from './StyleSelectorHeader';
import PreviousStyleSelectionBanner from './PreviousStyleSelectionBanner';
import StyleGrid from './StyleGrid';

interface Props {
  onSelectStyle: (style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization, apiVersionCustomization?: ApiVersionCustomization, manualCustomization?: ManualCustomization) => void;
  onBack: () => void;
}

const StyleSelector: React.FC<Props> = ({ onSelectStyle, onBack }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [previouslySelectedStyle, setPreviouslySelectedStyle] = useState<VideoStyle | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [showApiVersionModal, setShowApiVersionModal] = useState(false);
  
  const [pendingStyle, setPendingStyle] = useState<VideoStyle | null>(null);
  const [pendingCardCustomization, setPendingCardCustomization] = useState<CardCustomization | null>(null);
  const [pendingPresenterCustomization, setPendingPresenterCustomization] = useState<PresenterCustomization | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const videoStyles: VideoStyle[] = [
    {
      id: 'style-1',
      name: 'Estilo Noticia',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/Estilo%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9Fc3RpbG8gMS5tcDQiLCJpYXQiOjE3NTYwMDAyNDEsImV4cCI6MTkxMzY4MDI0MX0.wf5jhgI_7u8xbO9iTDc41_z_UD3ZezVplBxTzdmr_8U'
    },
    {
      id: 'style-2',
      name: 'Estilo Noticiero',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/ESTILO%202.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FU1RJTE8gMi5tcDQiLCJpYXQiOjE3NTYwMDA0MzksImV4cCI6MTkxMzY4MDQzOX0.36mopUOs_sN7xCOjZYyAtl1aZvPeG2-ZqHMZosKnJqg'
    },
    {
      id: 'style-3',
      name: 'Estilo Educativo 1',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/EDUCATIVO%201%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FRFVDQVRJVk8gMSBNT0RFTE8ubXA0IiwiaWF0IjoxNzU2MDAwNjE5LCJleHAiOjE5MTM2ODA2MTl9.OdWDM7cVu2dxJGfXHdM9SFHQDuLtk0hQ79GQzJ66o6w'
    },
    {
      id: 'style-4',
      name: 'Estilo Educativo 2',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/EDUCATIVO%202%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FRFVDQVRJVk8gMiBNT0RFTE8ubXA0IiwiaWF0IjoxNzU2MDAwNzIzLCJleHAiOjE5MTM2ODA3MjN9.cUZAyWSOKKRLUO7s3aCk9IclZZo6BxJeLGq5Of99OpU'
    },
    {
      id: 'style-5',
      name: 'Estilo Manual',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/Estilo%205.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9Fc3RpbG8gNS5tcDQiLCJpYXQiOjE3NTYwMDA4MTUsImV4cCI6MTkxMzY4MDgxNX0.IdOcweWE5MV-FEEAidTQyIoMPYsGBRZ9JEYyz96flb8'
    },
    {
      id: 'style-6',
      name: 'Estilo Manual 2',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/ESTILO%206.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FU1RJTE8gNi5tcDQiLCJpYXQiOjE3NTYwMDA4NjEsImV4cCI6MTkxMzY4MDg2MX0.r9vGsfAg2MTfBqyvtTALI-91DNDtgBRL1URrZbEyswk'
    },
    {
      id: 'style-7',
      name: 'Estilo Multi-Avatar',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/Multi-Avatar%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9NdWx0aS1BdmF0YXIgMS5tcDQiLCJpYXQiOjE3NTYwMDA5MDgsImV4cCI6MTkxMzY4MDkwOH0.O5fP9E924kBta0bjyjWFJWCunzbOaUi9MLgG0Des_0I'
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
    setSelectedStyleId(style.id);
    setPlayingVideo(null);

    // For "Carga Manual" styles (style-5 and style-6), go directly to neurocopy without modals
    if (style.id === 'style-5' || style.id === 'style-6') {
      onSelectStyle(style);
      return;
    }
    
    // For Multi-Avatar style (style-7), show API version modal first
    if (style.id === 'style-7') {
      setShowApiVersionModal(true);
      setPendingStyle(style);
      return;
    }
    
    // For other styles, check if they need customization
    const needsCardCustomization = ['style-1'].includes(style.id);
    const needsPresenterCustomization = ['style-2'].includes(style.id);

    if (needsCardCustomization) {
      setShowCustomizeModal(true);
      setPendingStyle(style);
    } else if (needsPresenterCustomization) {
      setShowPresenterModal(true);
      setPendingStyle(style);
    } else {
      // No customization needed, but still need API version for remaining styles
      setShowApiVersionModal(true);
      setPendingStyle(style);
    }
  };

  const handleCustomizeConfirm = (customization: CardCustomization) => {
    setPendingCardCustomization(customization);
    setShowCustomizeModal(false);
    // Ahora mostrar el modal de versión de API
    setShowApiVersionModal(true);
  };

  const handlePresenterConfirm = (customization: PresenterCustomization) => {
    setPendingPresenterCustomization(customization);
    setShowPresenterModal(false);
    // Ahora mostrar el modal de versión de API
    setShowApiVersionModal(true);
  };

  const handleApiVersionConfirm = (apiVersionCustomization: ApiVersionCustomization) => {
    if (pendingStyle) {
      setSelectedStyleId(pendingStyle.id);
      onSelectStyle(
        pendingStyle, 
        pendingCardCustomization || undefined, 
        pendingPresenterCustomization || undefined,
        apiVersionCustomization
      );
    }
    setShowApiVersionModal(false);
    setPendingStyle(null);
    setPendingCardCustomization(null);
    setPendingPresenterCustomization(null);
  };

  const handleCustomizeCancel = () => {
    setShowCustomizeModal(false);
    setPendingStyle(null);
    setPendingCardCustomization(null);
    setPendingPresenterCustomization(null);
  };

  const handlePresenterCancel = () => {
    setShowPresenterModal(false);
    setPendingStyle(null);
    setPendingCardCustomization(null);
    setPendingPresenterCustomization(null);
  };

  const handleApiVersionCancel = () => {
    setShowApiVersionModal(false);
    setPendingStyle(null);
    setPendingCardCustomization(null);
    setPendingPresenterCustomization(null);
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
        <StyleSelectorHeader onBack={onBack} />

        {/* Mostrar selección previa si existe */}
        {previouslySelectedStyle && (
          <PreviousStyleSelectionBanner
            previouslySelectedStyle={previouslySelectedStyle}
            onContinueWithPrevious={handleSelectStyle}
          />
        )}

        <div className="max-w-6xl mx-auto">
          <StyleGrid
            videoStyles={videoStyles}
            selectedStyleId={selectedStyleId}
            playingVideo={playingVideo}
            onSelectStyle={handleSelectStyle}
            onToggleVideoPlayback={toggleVideoPlayback}
            onVideoEnded={handleVideoEnded}
            onVideoRef={handleVideoRef}
          />
        </div>
      </div>

      {/* Modal de personalización de tarjetas */}
      <CustomizeCardsModal
        isOpen={showCustomizeModal}
        onClose={handleCustomizeCancel}
        onConfirm={handleCustomizeConfirm}
      />

      {/* Modal de nombre del presentador */}
      <PresenterNameModal
        isOpen={showPresenterModal}
        onClose={handlePresenterCancel}
        onConfirm={handlePresenterConfirm}
      />

      {/* Modal de versión de API */}
      <ApiVersionModal
        isOpen={showApiVersionModal}
        onClose={handleApiVersionCancel}
        onConfirm={handleApiVersionConfirm}
      />


      {/* Background effects */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default StyleSelector;
