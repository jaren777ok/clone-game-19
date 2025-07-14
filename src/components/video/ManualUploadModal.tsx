import React, { useState } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { FlowState, ApiVersionCustomization } from "@/types/videoFlow";
import { ImageUploadStep } from "./ImageUploadStep";
import { VideoUploadStep } from "./VideoUploadStep";
import ApiVersionModal from "./ApiVersionModal";

interface ManualUploadModalProps {
  open: boolean;
  onClose: () => void;
  script: string;
  flowState?: FlowState;
  onConfirm: (images: File[], videos: File[], apiVersionCustomization: ApiVersionCustomization) => Promise<void>;
}

type UploadStep = 'images' | 'videos' | 'api-version';

export const ManualUploadModal: React.FC<ManualUploadModalProps> = ({
  open,
  onClose,
  script,
  flowState,
  onConfirm
}) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('images');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiVersionCustomization, setApiVersionCustomization] = useState<ApiVersionCustomization | null>(null);

  const handleNext = () => {
    if (currentStep === 'images' && images.length === 14) {
      setCurrentStep('videos');
    } else if (currentStep === 'videos' && videos.length === 5) {
      setCurrentStep('api-version');
    }
  };

  const handleBack = () => {
    if (currentStep === 'videos') {
      setCurrentStep('images');
    } else if (currentStep === 'api-version') {
      setCurrentStep('videos');
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
    
    try {
      toast.info("Enviando archivos y generando video...");

      // Call the confirm callback with files and API version customization
      await onConfirm(images, videos, customization || apiVersionCustomization!);
      
      toast.success("¡Video enviado a generación!");

      // Reset state and close modal
      setCurrentStep('images');
      setImages([]);
      setVideos([]);
      setApiVersionCustomization(null);
      setIsProcessing(false);
      onClose();
      
    } catch (error) {
      console.error('Error generating video:', error);
      
      let errorMessage = "Error enviando los archivos";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setIsProcessing(false);
    }
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
          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className={`flex items-center space-x-2 ${currentStep === 'images' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'images' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span>14 Imágenes</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className={`flex items-center space-x-2 ${currentStep === 'videos' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'videos' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span>5 Videos</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className={`flex items-center space-x-2 ${currentStep === 'api-version' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'api-version' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span>API Version</span>
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

          {currentStep === 'api-version' && (
            <ApiVersionModal 
              isOpen={true}
              onClose={() => {}} // Don't allow closing from inside
              onConfirm={handleApiVersionConfirm}
            />
          )}

          {/* Navigation buttons */}
          {currentStep !== 'api-version' && (
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