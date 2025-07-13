import React, { useState } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { ManualCustomization, ApiVersionCustomization, Base64File } from "@/types/videoFlow";
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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleApiVersionConfirm = async (apiVersionCustomization: ApiVersionCustomization) => {
    setIsProcessing(true);
    
    console.log('📁 Convirtiendo archivos a base64...', {
      images: images.length,
      videos: videos.length
    });

    try {
      toast.info("Procesando archivos, esto puede tomar unos segundos...");

      // Convert images to base64
      const base64Images: Base64File[] = await Promise.all(
        images.map(async (file, index) => ({
          name: `imagen${index + 1}.${file.name.split('.').pop()}`,
          data: await fileToBase64(file),
          type: file.type,
          size: file.size
        }))
      );

      // Convert videos to base64
      const base64Videos: Base64File[] = await Promise.all(
        videos.map(async (file, index) => ({
          name: `video${index + 1}.${file.name.split('.').pop()}`,
          data: await fileToBase64(file),
          type: file.type,
          size: file.size
        }))
      );

      const manualCustomization: ManualCustomization = {
        images: base64Images,
        videos: base64Videos,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      console.log('✅ Archivos convertidos a base64:', {
        images: base64Images.length,
        videos: base64Videos.length,
        sessionId: manualCustomization.sessionId,
        totalSizeMB: ((base64Images.reduce((acc, img) => acc + img.size, 0) + base64Videos.reduce((acc, vid) => acc + vid.size, 0)) / 1024 / 1024).toFixed(2)
      });
      
      toast.info("Guardando configuración en la base de datos...");
      
      // Call onConfirm and wait for it to complete
      await onConfirm(manualCustomization, apiVersionCustomization);
      
      toast.success("¡Archivos guardados exitosamente!");
      
      // Reset state and close modal only after successful save
      setCurrentStep('images');
      setImages([]);
      setVideos([]);
      setIsProcessing(false);
      onClose();
    } catch (error) {
      console.error('❌ Error procesando archivos:', error);
      toast.error("Error guardando los archivos. Por favor, inténtalo de nuevo.");
      setIsProcessing(false);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 'images') return images.length !== 14;
    if (currentStep === 'videos') return videos.length !== 5;
    return false;
  };

  const resetAndClose = () => {
    if (isProcessing) return; // Prevent closing while processing
    setCurrentStep('images');
    setImages([]);
    setVideos([]);
    setIsProcessing(false);
    onClose();
  };

  if (currentStep === 'api-version') {
    return (
      <ApiVersionModal 
        isOpen={open}
        onClose={isProcessing ? () => {} : resetAndClose}
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
              disabled={isProcessing}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 'images' ? 'Cancelar' : 'Anterior'}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isNextDisabled() || isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Siguiente'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};