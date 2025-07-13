import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { ManualCustomization, ApiVersionCustomization } from "@/types/videoFlow";
import { ImageUploadStep } from "./ImageUploadStep";
import { VideoUploadStep } from "./VideoUploadStep";
import ApiVersionModal from "./ApiVersionModal";

interface ManualUploadModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (manualCustomization: ManualCustomization, apiVersionCustomization: ApiVersionCustomization) => void;
}

type UploadStep = 'images' | 'videos' | 'api-version';

export const ManualUploadModal: React.FC<ManualUploadModalProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('images');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

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

  const handleApiVersionConfirm = (apiVersionCustomization: ApiVersionCustomization) => {
    const manualCustomization: ManualCustomization = {
      images,
      videos
    };
    onConfirm(manualCustomization, apiVersionCustomization);
  };

  const isNextDisabled = () => {
    if (currentStep === 'images') return images.length !== 14;
    if (currentStep === 'videos') return videos.length !== 5;
    return false;
  };

  const resetAndClose = () => {
    setCurrentStep('images');
    setImages([]);
    setVideos([]);
    onClose();
  };

  if (currentStep === 'api-version') {
    return (
      <ApiVersionModal 
        isOpen={open}
        onClose={resetAndClose}
        onConfirm={handleApiVersionConfirm}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Estilo Manual - {currentStep === 'images' ? 'Subir Imágenes' : 'Subir Videos'}
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
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                3
              </div>
              <span>Configuración API</span>
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

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={currentStep === 'images' ? resetAndClose : handleBack}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 'images' ? 'Cancelar' : 'Anterior'}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isNextDisabled()}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};