import React, { useState, useEffect } from 'react';
import { VideoStyle, CardCustomization, PresenterCustomization, ApiVersionCustomization, ManualCustomization, HeyGenApiKey } from '@/types/videoFlow';
import CustomizeCardsModal from './CustomizeCardsModal';
import PresenterNameModal from './PresenterNameModal';
import StyleLeftPanel from './StyleLeftPanel';
import StyleCarousel from './StyleCarousel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  onSelectStyle: (style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization, apiVersionCustomization?: ApiVersionCustomization, manualCustomization?: ManualCustomization) => void;
  onBack: () => void;
  generatedScript: string;
  aiApiKeys: { openai_api_key: string; gemini_api_key: string };
  selectedApiKey: HeyGenApiKey | null;
}

const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk1NDg2MzEsImV4cCI6MTkyNzIyODYzMX0.EwRytP9Dr__3-p5f-560Aaq7ZTbFC9AkGmBgvN-lAOs';

const StyleSelector: React.FC<Props> = ({ onSelectStyle, onBack, generatedScript, aiApiKeys, selectedApiKey }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [isDetectingPlan, setIsDetectingPlan] = useState(false);
  
  const [pendingStyle, setPendingStyle] = useState<VideoStyle | null>(null);
  const [pendingCardCustomization, setPendingCardCustomization] = useState<CardCustomization | null>(null);
  const [pendingPresenterCustomization, setPendingPresenterCustomization] = useState<PresenterCustomization | null>(null);

  const videoStyles: VideoStyle[] = [
    {
      id: 'style-1',
      name: 'Estilo Noticia',
      description: 'Estilo de noticias profesional con presentador y titulares dinámicos',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/Estilo%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9Fc3RpbG8gMS5tcDQiLCJpYXQiOjE3NTYwMDAyNDEsImV4cCI6MTkxMzY4MDI0MX0.wf5jhgI_7u8xbO9iTDc41_z_UD3ZezVplBxTzdmr_8U',
      requirements: {
        items: ['Se requiere Fondo Verde', 'Se requiere Avatar Horizontal'],
        downloadUrl: 'https://drive.google.com/uc?id=1Fq2RtxL9J4hYkhYBsmLOGQbb1dd2N3TD&export=download',
        downloadLabel: 'Descargar Fondo Verde'
      }
    },
    {
      id: 'style-2',
      name: 'Estilo Noticiero',
      description: 'Formato de noticiero moderno con gráficos de televisión',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/ESTILO%202.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FU1RJTE8gMi5tcDQiLCJpYXQiOjE3NTYwMDA0MzksImV4cCI6MTkxMzY4MDQzOX0.36mopUOs_sN7xCOjZYyAtl1aZvPeG2-ZqHMZosKnJqg',
      requirements: {
        items: ['Se requiere Fondo Verde', 'Se requiere Avatar Horizontal'],
        downloadUrl: 'https://drive.google.com/uc?id=1Fq2RtxL9J4hYkhYBsmLOGQbb1dd2N3TD&export=download',
        downloadLabel: 'Descargar Fondo Verde'
      }
    },
    {
      id: 'style-3',
      name: 'Estilo Educativo 1',
      description: 'Ideal para contenido educativo y explicativo',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/EDUCATIVO%201%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FRFVDQVRJVk8gMSBNT0RFTE8ubXA0IiwiaWF0IjoxNzU2MDAwNjE5LCJleHAiOjE5MTM2ODA2MTl9.OdWDM7cVu2dxJGfXHdM9SFHQDuLtk0hQ79GQzJ66o6w',
      requirements: {
        items: ['Avatar Horizontal recomendado'],
      }
    },
    {
      id: 'style-4',
      name: 'Estilo Educativo 2',
      description: 'Variante educativa con diseño moderno',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/EDUCATIVO%202%20MODELO.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FRFVDQVRJVk8gMiBNT0RFTE8ubXA0IiwiaWF0IjoxNzU2MDAwNzIzLCJleHAiOjE5MTM2ODA3MjN9.cUZAyWSOKKRLUO7s3aCk9IclZZo6BxJeLGq5Of99OpU',
      requirements: {
        items: ['Avatar Horizontal recomendado'],
      }
    },
    {
      id: 'style-5',
      name: 'Estilo Manual',
      description: 'Carga manual de imágenes y videos propios',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/Estilo%205.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9Fc3RpbG8gNS5tcDQiLCJpYXQiOjE3NTYwMDA4MTUsImV4cCI6MTkxMzY4MDgxNX0.IdOcweWE5MV-FEEAidTQyIoMPYsGBRZ9JEYyz96flb8',
      requirements: {
        items: ['Sube tus propias imágenes', 'Sube tus propios videos'],
      }
    },
    {
      id: 'style-6',
      name: 'Estilo Manual 2',
      description: 'Variante de carga manual con efectos adicionales',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/ESTILO%206.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9FU1RJTE8gNi5tcDQiLCJpYXQiOjE3NTYwMDA4NjEsImV4cCI6MTkxMzY4MDg2MX0.r9vGsfAg2MTfBqyvtTALI-91DNDtgBRL1URrZbEyswk',
      requirements: {
        items: ['Sube tus propias imágenes', 'Sube tus propios videos'],
      }
    },
    {
      id: 'style-7',
      name: 'Estilo Multi-Avatar',
      description: 'Múltiples avatares interactuando en el video',
      video_url: 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/Multi-Avatar%201.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9NdWx0aS1BdmF0YXIgMS5tcDQiLCJpYXQiOjE3NTYwMDA5MDgsImV4cCI6MTkxMzY4MDkwOH0.O5fP9E924kBta0bjyjWFJWCunzbOaUi9MLgG0Des_0I',
      requirements: {
        items: ['Se seleccionarán 2 avatares', 'Ideal para entrevistas o diálogos'],
      }
    }
  ];

  // Load previous selection from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedStyle) {
          const foundIndex = videoStyles.findIndex(s => s.id === parsedState.selectedStyle.id);
          if (foundIndex !== -1) {
            setActiveIndex(foundIndex);
          }
        }
      } catch (error) {
        console.error('Error parsing saved flow state:', error);
      }
    }
  }, []);

  // Auto-detect plan and proceed with style selection
  const detectPlanAndProceed = async (style: VideoStyle, cardCustomization?: CardCustomization, presenterCustomization?: PresenterCustomization) => {
    if (!selectedApiKey) {
      toast.error("No hay clave API seleccionada");
      return;
    }

    setIsDetectingPlan(true);
    
    try {
      // Decode the API key
      const apiKey = atob(selectedApiKey.api_key_encrypted);
      
      // Verify plan with heygen-quota edge function
      const response = await supabase.functions.invoke('heygen-quota', {
        body: { apiKey }
      });

      if (response.error || !response.data?.isValid) {
        throw new Error("Error verificando plan de API");
      }

      const isPaidVersion = response.data.isPaidPlan;
      
      // Create apiVersionCustomization automatically based on plan
      const apiVersionCustomization: ApiVersionCustomization = {
        isPaidVersion,
        width: isPaidVersion ? 1920 : 1280,
        height: isPaidVersion ? 1080 : 720
      };

      console.log('✅ Plan detectado automáticamente:', {
        isPaidVersion,
        resolution: isPaidVersion ? '1920x1080' : '1280x720',
        remainingQuota: response.data.remainingQuota
      });

      // Proceed with the selected style
      onSelectStyle(
        style, 
        cardCustomization || undefined, 
        presenterCustomization || undefined,
        apiVersionCustomization
      );

    } catch (error) {
      console.error('Error detectando plan:', error);
      toast.error("Error verificando tu plan de HeyGen. Por favor intenta de nuevo.");
    } finally {
      setIsDetectingPlan(false);
      setPendingStyle(null);
      setPendingCardCustomization(null);
      setPendingPresenterCustomization(null);
    }
  };

  const handleSelectStyle = (style: VideoStyle) => {
    setPlayingVideo(null);

    // For "Carga Manual" styles (style-5 and style-6), go directly without plan detection
    if (style.id === 'style-5' || style.id === 'style-6') {
      onSelectStyle(style);
      return;
    }
    
    // For styles that need customization first
    const needsCardCustomization = ['style-1'].includes(style.id);
    const needsPresenterCustomization = ['style-2'].includes(style.id);

    if (needsCardCustomization) {
      setShowCustomizeModal(true);
      setPendingStyle(style);
    } else if (needsPresenterCustomization) {
      setShowPresenterModal(true);
      setPendingStyle(style);
    } else {
      // No customization needed, auto-detect plan and proceed
      detectPlanAndProceed(style);
    }
  };

  const handleCustomizeConfirm = (customization: CardCustomization) => {
    setShowCustomizeModal(false);
    // Auto-detect plan after customization
    if (pendingStyle) {
      detectPlanAndProceed(pendingStyle, customization);
    }
  };

  const handlePresenterConfirm = (customization: PresenterCustomization) => {
    setShowPresenterModal(false);
    // Auto-detect plan after customization
    if (pendingStyle) {
      detectPlanAndProceed(pendingStyle, undefined, customization);
    }
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

  const handleTogglePlay = (styleId: string) => {
    setPlayingVideo(prev => prev === styleId ? null : styleId);
  };

  const activeStyle = videoStyles[activeIndex];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Video Background */}
      <video
        src={BACKGROUND_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      />
      
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-background/50" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel (30%) */}
        <StyleLeftPanel 
          activeStyle={activeStyle}
          onSelectStyle={handleSelectStyle}
          onBack={onBack}
        />
        
        {/* Right Panel - Carousel (70%) */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12">
          <StyleCarousel
            styles={videoStyles}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            playingVideo={playingVideo}
            onTogglePlay={handleTogglePlay}
          />
        </div>
      </div>

      {/* Loading overlay while detecting plan */}
      {isDetectingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card/90 shadow-[0_0_40px_rgba(255,20,147,0.2)] border border-primary/20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-lg font-medium text-foreground">
              Detectando tu plan de HeyGen...
            </p>
            <p className="text-sm text-muted-foreground">
              Esto solo toma un momento
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CustomizeCardsModal
        isOpen={showCustomizeModal}
        onClose={handleCustomizeCancel}
        onConfirm={handleCustomizeConfirm}
        generatedScript={generatedScript}
        aiApiKeys={aiApiKeys}
      />

      <PresenterNameModal
        isOpen={showPresenterModal}
        onClose={handlePresenterCancel}
        onConfirm={handlePresenterConfirm}
      />

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default StyleSelector;
