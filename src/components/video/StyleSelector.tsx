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
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/EDUCATIVO%202%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VEVUNBVElWTyAyIE1PREVMTy5tcDQiLCJpYXQiOjE3NTA5MjE0NDMsImV4cCI6MTc4MjQ1NzQ0M30.KM76FvzzPnRficUwxk4tf1oKaV65RmlRPa-9BkG_2JY'
    },
    {
      id: 'style-5',
      name: 'Estilo Manual',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/ESTILO%205.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VTVElMTyA1Lm1wNCIsImlhdCI6MTc1MjU0MjMzMiwiZXhwIjoxNzg0MDc4MzMyfQ.l-ciTjUPjYMwPEn1qyplkMgmaHzB1rcf45_AB1xgsms'
    },
    {
      id: 'style-6',
      name: 'Estilo Manual 2',
      video_url: 'https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/ESTILO%206.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL0VTVElMTyA2Lm1wNCIsImlhdCI6MTc1MjU1NTQ4MywiZXhwIjoxNzg0MDkxNDgzfQ.-wuuV1jVNbFCYi4-4c9wNZ_oJtZrRhbUwIWJFQKuhE4'
    },
    {
      id: 'style-7',
      name: 'Estilo Multi-Avatar',
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
    setSelectedStyleId(style.id);
    setPlayingVideo(null);

    // For "Carga Manual" styles (style-5 and style-6), go directly to neurocopy without modals
    if (style.id === 'style-5' || style.id === 'style-6') {
      onSelectStyle(style);
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
      // No customization needed
      onSelectStyle(style);
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
