import { useState } from 'react';
import { toast } from "sonner";
import { ApiVersionCustomization, HeyGenApiKey } from "@/types/videoFlow";
import { sendToConvertFilesWebhook } from "@/lib/webhookUtils";
import { supabase } from '@/integrations/supabase/client';

type UploadStep = 'images' | 'videos' | 'convert-files';

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
  flowState?: any;
  selectedApiKey?: HeyGenApiKey | null;
}

export const useManualUploadFlow = ({ onConfirm, onConfirmWithUrls, onClose, flowState, selectedApiKey }: UseManualUploadFlowProps) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('images');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, type: '' });
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState('');
  const [convertedUrls, setConvertedUrls] = useState<any>(null);
  const [isDetectingPlan, setIsDetectingPlan] = useState(false);

  console.log('🔍 DEBUG - useManualUploadFlow initialized:', {
    hasFlowState: !!flowState,
    hasSubtitleCustomization: !!flowState?.subtitleCustomization,
    hasSelectedApiKey: !!selectedApiKey
  });

  const handleNext = () => {
    console.log('🔍 DEBUG - handleNext called:', {
      currentStep,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization
    });

    if (currentStep === 'images' && images.length === 14) {
      setCurrentStep('videos');
    } else if (currentStep === 'videos' && videos.length === 5) {
      setCurrentStep('convert-files');
    }
  };

  const handleBack = () => {
    console.log('🔍 DEBUG - handleBack called:', {
      currentStep,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization
    });

    if (currentStep === 'videos') {
      setCurrentStep('images');
    } else if (currentStep === 'convert-files') {
      setCurrentStep('videos');
    }
  };

  const handleConvertFiles = async () => {
    if (images.length === 0 && videos.length === 0) {
      toast.error("No hay archivos para convertir.");
      return;
    }

    console.log('🔍 DEBUG - handleConvertFiles:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
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
      
      toast.success("Archivos convertidos exitosamente. Detectando tu plan...");

      // Auto-detect plan after conversion
      setTimeout(() => {
        autoDetectPlanAndGenerate(urls);
      }, 500);
      
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

  const autoDetectPlanAndGenerate = async (urls?: any) => {
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

      console.log('✅ Plan detectado automáticamente para manual upload:', {
        isPaidVersion,
        resolution: isPaidVersion ? '1920x1080' : '1280x720',
        remainingQuota: response.data.remainingQuota
      });

      // Generate video with detected plan
      await handleGenerateVideoWithCustomization(apiVersionCustomization, urls || convertedUrls);

    } catch (error) {
      console.error('Error detectando plan:', error);
      toast.error("Error verificando tu plan de HeyGen. Por favor intenta de nuevo.");
    } finally {
      setIsDetectingPlan(false);
    }
  };

  const handleGenerateVideoWithCustomization = async (customization: ApiVersionCustomization, urls?: any) => {
    if (images.length === 0 && videos.length === 0) {
      toast.error("Por favor, sube al menos una imagen o video antes de continuar.");
      return;
    }

    console.log('🔍 DEBUG - handleGenerateVideoWithCustomization:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      hasConvertedUrls: !!urls,
      customization
    });

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: 0, type: '' });
    
    try {
      toast.info("Procesando archivos...");

      if (urls && onConfirmWithUrls) {
        console.log('🔍 DEBUG - Usando URLs convertidas con subtítulos:', {
          hasSubtitleCustomization: !!flowState?.subtitleCustomization
        });
        await onConfirmWithUrls(urls, customization);
      } else {
        console.log('🔍 DEBUG - Usando archivos directos con subtítulos:', {
          hasSubtitleCustomization: !!flowState?.subtitleCustomization
        });
        await onConfirm(images, videos, customization, (current, total, type) => {
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

  // Keep legacy handler for backward compatibility
  const handleApiVersionConfirm = (customization: ApiVersionCustomization) => {
    console.log('🔍 DEBUG - handleApiVersionConfirm (legacy):', {
      customization
    });
    handleGenerateVideoWithCustomization(customization);
  };

  const isNextDisabled = () => {
    if (currentStep === 'images') return images.length !== 14;
    if (currentStep === 'videos') return videos.length !== 5;
    return false;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'images': return 'Subir Imágenes';
      case 'videos': return 'Subir Videos';
      case 'convert-files': return 'Convertir Archivos';
      default: return 'Upload';
    }
  };

  const resetAndClose = () => {
    if (isProcessing) return;

    console.log('🔍 DEBUG - resetAndClose:', {
      hasSubtitleCustomization: !!flowState?.subtitleCustomization
    });

    setCurrentStep('images');
    setImages([]);
    setVideos([]);
    setIsProcessing(false);
    setProcessingProgress({ current: 0, total: 0, type: '' });
    setIsConverting(false);
    setConversionProgress('');
    setConvertedUrls(null);
    setIsDetectingPlan(false);
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
    isDetectingPlan,
    
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
