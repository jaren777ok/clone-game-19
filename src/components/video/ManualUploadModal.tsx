import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { FlowState, ApiVersionCustomization } from "@/types/videoFlow";
import { ImageUploadStep } from "./ImageUploadStep";
import { VideoUploadStep } from "./VideoUploadStep";
import { ConvertFilesStep } from "./ConvertFilesStep";
import { ManualUploadStepIndicator } from "./ManualUploadStepIndicator";
import { ManualUploadProgressBar } from "./ManualUploadProgressBar";
import { ManualUploadNavigationButtons } from "./ManualUploadNavigationButtons";
import { useManualUploadFlow } from "@/hooks/useManualUploadFlow";
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

export const ManualUploadModal: React.FC<ManualUploadModalProps> = ({
  open,
  onClose,
  script,
  flowState,
  onConfirm,
  onConfirmWithUrls
}) => {
  const {
    currentStep,
    images,
    videos,
    isProcessing,
    processingProgress,
    isConverting,
    conversionProgress,
    setImages,
    setVideos,
    handleNext,
    handleBack,
    handleConvertFiles,
    handleApiVersionConfirm,
    resetAndClose,
    isNextDisabled,
    getStepTitle
  } = useManualUploadFlow({ onConfirm, onConfirmWithUrls, onClose });

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
          <ManualUploadProgressBar 
            isProcessing={isProcessing}
            processingProgress={processingProgress}
          />

          <ManualUploadStepIndicator currentStep={currentStep} />

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
              onClose={() => {}}
              onConfirm={handleApiVersionConfirm}
            />
          )}

          <ManualUploadNavigationButtons
            currentStep={currentStep}
            isNextDisabled={isNextDisabled()}
            isProcessing={isProcessing}
            onBack={handleBack}
            onNext={handleNext}
            onCancel={resetAndClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};