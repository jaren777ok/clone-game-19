
import { useState } from 'react';
import { toast } from "sonner";
import { ApiVersionCustomization } from "@/types/videoFlow";
import { sendToConvertFilesWebhook } from "@/lib/webhookUtils";

type UploadStep = 'images' | 'videos' | 'convert-files' | 'api-version';

interface UseManualUploadFlowProps {
  onConfirm: (
    images: File[], 
    videos: File[], 
    apiVersionCustomization: ApiVersionCustomization,
    onProgress?: (current: number, total: number, type: 'image') => void
  ) => Promise<void>;
  onConfirmWithUrls?: (
    driveUrls: any,
    apiVersionCustomization: ApiVersionCustomization
  ) => Promise<void>;
  onClose: () => void;
  // 🔍 DEBUG: Agregar flowState para preservar subtítulos
  flowState?: any;
}

export const useManualUploadFlow = ({ onConfirm, onConfirmWithUrls, onClose, flowState }: UseManualUploadFlowProps) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('images');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, type: '' });
  const [apiVersionCustomization, setApiVersionCustomization] = useState<ApiVersionCustomization | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState('');
  const [convertedUrls, setConvertedUrls] = useState<any>(null);

  // 🔍 DEBUG: Verificar que flowState contiene subtítulos al inicializar
  console.log('🔍 DEBUG - useManualUploadFlow initialized:', {
    hasFlowState: !!flowState,
    hasSubtitleCustomization: !!flowState?.subtitleCustomization,
    subtitleCustomizationData: flowState?.subtitleCustomization
  });

  const handleNext = () => {
    // 🔍 DEBUG: Verificar que subtítulos se mantienen en cada paso
    console.log('🔍 DEBUG - handleNext called:', {
      currentStep,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization
    });

    if (currentStep === 'images' && images.length === 14) {
      setCurrentStep('videos');
    } else if (currentStep === 'videos' && videos.length === 5) {
      setCurrentStep('convert-files');
    } else if (currentStep === 'convert-files' && convertedUrls) {
      setCurrentStep('api-version');
    }
  };

  const handleBack = () => {
    // 🔍 DEBUG: Verificar que subtítulos se mantienen al retroceder
    console.log('🔍 DEBUG - handleBack called:', {
      currentStep,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization
    });

    if (currentStep === 'videos') {
      setCurrentStep('images');
    } else if (currentStep === 'convert-files') {
      setCurrentStep('videos');
    } else if (currentStep === 'api-version') {
      setCurrentStep('convert-files');
    }
  };

  const handleConvertFiles = async () => {
    if (images.length === 0 && videos.length === 0) {
      toast.error("No hay archivos para convertir.");
      return;
    }

    // 🔍 DEBUG: Verificar subtítulos antes de conversión
    console.log('🔍 DEBUG - handleConvertFiles:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      imagesCount: images.length,
      videosCount: videos.length
    });

    setIsConverting(true);
    setConversionProgress('Preparando archivos...');
    
    try {
      const urls = await sendToConvertFilesWebhook(
        images, 
        videos, 
        setConversionProgress
      );
      
      setConvertedUrls(urls);
      setConversionProgress('¡Conversión completada!');
      
      toast.success("Archivos convertidos exitosamente");

      // 🔍 DEBUG: Verificar que subtítulos siguen existiendo después de conversión
      console.log('🔍 DEBUG - Después de conversión:', {
        hasSubtitleCustomization: !!flowState?.subtitleCustomization,
        convertedUrls: urls
      });
      
      setTimeout(() => {
        setCurrentStep('api-version');
      }, 1000);
      
    } catch (error) {
      console.error('Error converting files:', error);
      
      let errorMessage = "Error convirtiendo archivos";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const handleApiVersionConfirm = (customization: ApiVersionCustomization) => {
    // 🔍 DEBUG: Verificar subtítulos al confirmar API version
    console.log('🔍 DEBUG - handleApiVersionConfirm:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      apiCustomization: customization
    });

    setApiVersionCustomization(customization);
    handleGenerateVideo(customization);
  };

  const handleGenerateVideo = async (customization?: ApiVersionCustomization) => {
    if (images.length === 0 && videos.length === 0) {
      toast.error("Por favor, sube al menos una imagen o video antes de continuar.");
      return;
    }

    if (!customization && !apiVersionCustomization) {
      toast.error("Por favor, selecciona la versión de API antes de continuar.");
      return;
    }

    // 🔍 DEBUG: Verificar subtítulos antes de generar video
    console.log('🔍 DEBUG - handleGenerateVideo:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      hasConvertedUrls: !!convertedUrls,
      customization: customization || apiVersionCustomization
    });

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: 0, type: '' });
    
    try {
      toast.info("Procesando archivos...");

      if (convertedUrls && onConfirmWithUrls) {
        // 🔍 DEBUG: Usar URLs convertidas
        console.log('🔍 DEBUG - Usando URLs convertidas con subtítulos:', {
          hasSubtitleCustomization: !!flowState?.subtitleCustomization
        });
        await onConfirmWithUrls(convertedUrls, customization || apiVersionCustomization!);
      } else {
        // 🔍 DEBUG: Usar archivos directos
        console.log('🔍 DEBUG - Usando archivos directos con subtítulos:', {
          hasSubtitleCustomization: !!flowState?.subtitleCustomization
        });
        await onConfirm(images, videos, customization || apiVersionCustomization!, (current, total, type) => {
          setProcessingProgress({ current, total, type });
        });
      }
      
      toast.success("¡Video enviado a generación!");
      resetAndClose();
      
    } catch (error) {
      console.error('Error generating video:', error);
      
      let errorMessage = "Error enviando los archivos";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setIsProcessing(false);
      setProcessingProgress({ current: 0, total: 0, type: '' });
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 'images') return images.length !== 14;
    if (currentStep === 'videos') return videos.length !== 5;
    if (currentStep === 'convert-files') return !convertedUrls;
    return false;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'images': return 'Subir Imágenes';
      case 'videos': return 'Subir Videos';
      case 'convert-files': return 'Convertir Archivos';
      case 'api-version': return 'Configurar API';
      default: return 'Upload';
    }
  };

  const resetAndClose = () => {
    if (isProcessing) return;

    // 🔍 DEBUG: Verificar subtítulos al cerrar
    console.log('🔍 DEBUG - resetAndClose:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization
    });

    setCurrentStep('images');
    setImages([]);
    setVideos([]);
    setApiVersionCustomization(null);
    setIsProcessing(false);
    setProcessingProgress({ current: 0, total: 0, type: '' });
    setIsConverting(false);
    setConversionProgress('');
    setConvertedUrls(null);
    onClose();
  };

  return {
    // State
    currentStep,
    images,
    videos,
    isProcessing,
    processingProgress,
    isConverting,
    conversionProgress,
    convertedUrls,
    
    // Actions
    setImages,
    setVideos,
    handleNext,
    handleBack,
    handleConvertFiles,
    handleApiVersionConfirm,
    resetAndClose,
    
    // Computed
    isNextDisabled,
    getStepTitle
  };
};
