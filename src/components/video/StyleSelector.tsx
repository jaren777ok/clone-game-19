
import React, { useState, useRef, useEffect } from 'react';
import { VideoStyle, CardCustomization, PresenterCustomization } from '@/types/videoFlow';
import CustomizeCardsModal from './CustomizeCardsModal';
import PresenterNameModal from './PresenterNameModal';
import StyleSelectorHeader from './StyleSelectorHeader';
import PreviousStyleSelectionBanner from './PreviousStyleSelectionBanner';
import StyleGrid from './StyleGrid';

interface Props {
  onSelectStyle: (style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization) => void;
  onBack: () => void;
}

const StyleSelector: React.FC<Props> = ({ onSelectStyle, onBack }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [previouslySelectedStyle, setPreviouslySelectedStyle] = useState<VideoStyle | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [pendingStyle, setPendingStyle] = useState<VideoStyle | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const videoStyles: VideoStyle[] = [
    {
      id: 'style-1',
      name: 'Estilo Noticia',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/Estilo%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VzdGlsbyAxLm1wNCIsImlhdCI6MTc1MDcxOTI1NiwiZXhwIjoxNzgyMjU1MjU2fQ.9-Ji-AgsIbAv9Jl0FZW6dNikiNevfGVu_M1LVN6PA4A'
    },
    {
      id: 'style-2',
      name: 'Estilo Noticiero',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/ESTILO%202.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VTVElMTyAyLm1wNCIsImlhdCI6MTc1MDU3NDI2NiwiZXhwIjoxNzgyMTEwMjY2fQ.DnoUX_dchVZkgiprnWvBeElxmn_k183nU8H5W1E0IiE'
    },
    {
      id: 'style-3',
      name: 'Estilo Educativo 1',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/EDUCATIVO%201%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VEVUNBVElWTyAxIE1PREVMTy5tcDQiLCJpYXQiOjE3NTA5MTEwMDUsImV4cCI6MTc4MjQ0NzAwNX0.MaSLRN9cAZKjSiJLS2wJfJLVANAZ9c_1JPIEBe-O42A'
    },
    {
      id: 'style-4',
      name: 'Estilo Educativo 2',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/EDUCATIVO%201%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VEVUNBVElWTyAxIE1PREVMTy5tcDQiLCJpYXQiOjE3NTA5MTEwMDUsImV4cCI6MTc4MjQ0NzAwNX0.MaSLRN9cAZKjSiJLS2wJfJLVANAZ9c_1JPIEBe-O42A'
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
      // Estilo Noticia requiere personalización de tarjetas
      setPendingStyle(style);
      setShowCustomizeModal(true);
    } else if (style.id === 'style-2') {
      // Estilo Noticiero requiere nombre del presentador
      setPendingStyle(style);
      setShowPresenterModal(true);
    } else if (style.id === 'style-3' || style.id === 'style-4') {
      // Estilo Educativo 1 y 2 - selección directa sin modals
      setSelectedStyleId(style.id);
      onSelectStyle(style);
    } else {
      // Fallback para otros estilos
      setSelectedStyleId(style.id);
      onSelectStyle(style);
    }
  };

  const handleCustomizeConfirm = (customization: CardCustomization) => {
    if (pendingStyle) {
      setSelectedStyleId(pendingStyle.id);
      onSelectStyle(pendingStyle, customization, undefined);
    }
    setShowCustomizeModal(false);
    setPendingStyle(null);
  };

  const handlePresenterConfirm = (customization: PresenterCustomization) => {
    if (pendingStyle) {
      setSelectedStyleId(pendingStyle.id);
      onSelectStyle(pendingStyle, undefined, customization);
    }
    setShowPresenterModal(false);
    setPendingStyle(null);
  };

  const handleCustomizeCancel = () => {
    setShowCustomizeModal(false);
    setPendingStyle(null);
  };

  const handlePresenterCancel = () => {
    setShowPresenterModal(false);
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

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default StyleSelector;
