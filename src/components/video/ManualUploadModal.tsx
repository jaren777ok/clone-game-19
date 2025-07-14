import React, { useState } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { FlowState, ApiVersionCustomization } from "@/types/videoFlow";
import { ImageUploadStep } from "./ImageUploadStep";
import { VideoUploadStep } from "./VideoUploadStep";
import { ConvertFilesStep } from "./ConvertFilesStep";
import ApiVersionModal from "./ApiVersionModal";

interface ManualUploadModalProps {
  open: boolean;
  onClose: () => void;
  script: string;
  flowState?: FlowState;
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
}

type UploadStep = 'images' | 'videos' | 'convert-files' | 'api-version';

export const ManualUploadModal: React.FC<ManualUploadModalProps> = ({
  open,
  onClose,
  script,
  flowState,
  onConfirm,
  onConfirmWithUrls
}) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('images');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0, type: '' });
  const [apiVersionCustomization, setApiVersionCustomization] = useState<ApiVersionCustomization | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState('');
  const [convertedUrls, setConvertedUrls] = useState<any>(null);

  const handleNext = () => {
    if (currentStep === 'images' && images.length === 14) {
      setCurrentStep('videos');
    } else if (currentStep === 'videos' && videos.length === 5) {
      setCurrentStep('convert-files');
    } else if (currentStep === 'convert-files' && convertedUrls) {
      setCurrentStep('api-version');
    }
  };

  const handleBack = () => {
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

    setIsConverting(true);
    setConversionProgress('Preparando archivos...');
    
    try {
      // Import the conversion function
      const { sendToConvertFilesWebhook } = await import('@/lib/webhookUtils');
      
      // Send files to conversion webhook
      const urls = await sendToConvertFilesWebhook(
        images, 
        videos, 
        setConversionProgress
      );
      
      setConvertedUrls(urls);
      setConversionProgress('¡Conversión completada!');
      
      toast.success("Archivos convertidos exitosamente");
      
      // Auto advance to next step after a brief delay
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
    setApiVersionCustomization(customization);
    // Proceed to generate video immediately after API version is selected
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

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: 0, type: '' });
    
    try {
      toast.info("Procesando archivos...");

      // Call the confirm callback with converted URLs instead of direct files
      if (convertedUrls && onConfirmWithUrls) {
        // Use the URL-based method
        await onConfirmWithUrls(convertedUrls, customization || apiVersionCustomization!);
      } else {
        // Fallback to original method
        await onConfirm(images, videos, customization || apiVersionCustomization!, (current, total, type) => {
          setProcessingProgress({ current, total, type });
        });
      }
      
      toast.success("¡Video enviado a generación!");

      // Reset state and close modal
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
    if (isProcessing) return; // Prevent closing while processing
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

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Estilo Manual - {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Processing indicator */}
          {isProcessing && (
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                {processingProgress.type === 'image' ? (
                  <>Procesando imágenes... ({processingProgress.current}/{processingProgress.total})</>
                ) : (
                  'Enviando archivos...'
                )}
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: processingProgress.total > 0 
                      ? `${(processingProgress.current / processingProgress.total) * 100}%` 
                      : '10%' 
                  }}
                />
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm overflow-x-auto">
            <div className={`flex items-center space-x-2 ${currentStep === 'images' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'images' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="whitespace-nowrap">14 Imágenes</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className={`flex items-center space-x-2 ${currentStep === 'videos' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'videos' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="whitespace-nowrap">5 Videos</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className={`flex items-center space-x-2 ${currentStep === 'convert-files' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'convert-files' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="whitespace-nowrap">Convertir</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className={`flex items-center space-x-2 ${currentStep === 'api-version' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'api-version' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                4
              </div>
              <span className="whitespace-nowrap">API Version</span>
            </div>
          </div>

          {/* Content */}
          {currentStep === 'images' && (
            <ImageUploadStep 
              images={images}
              onImagesChange={setImages}
            />
          )}

          {currentStep === 'videos' && (
            <VideoUploadStep 
              videos={videos}
              onVideosChange={setVideos}
            />
          )}

          {currentStep === 'convert-files' && (
            <ConvertFilesStep 
              onConvert={handleConvertFiles}
              isConverting={isConverting}
              conversionProgress={conversionProgress}
            />
          )}

          {currentStep === 'api-version' && (
            <ApiVersionModal 
              isOpen={true}
              onClose={() => {}} // Don't allow closing from inside
              onConfirm={handleApiVersionConfirm}
            />
          )}

          {/* Navigation buttons */}
          {currentStep !== 'api-version' && currentStep !== 'convert-files' && (
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={currentStep === 'images' ? resetAndClose : handleBack}
                disabled={isProcessing}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {currentStep === 'images' ? 'Cancelar' : 'Anterior'}
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={isNextDisabled() || isProcessing}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};