import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { FlowState, ApiVersionCustomization, HeyGenApiKey } from "@/types/videoFlow";
import { ImageUploadStep } from "./ImageUploadStep";
import { VideoUploadStep } from "./VideoUploadStep";
import { ConvertFilesStep } from "./ConvertFilesStep";
import { ManualUploadStepIndicator } from "./ManualUploadStepIndicator";
import { ManualUploadProgressBar } from "./ManualUploadProgressBar";
import { ManualUploadNavigationButtons } from "./ManualUploadNavigationButtons";
import { useManualUploadFlow } from "@/hooks/useManualUploadFlow";

interface ManualUploadModalProps {
  open: boolean;
  onClose: () => void;
  script: string;
  flowState?: FlowState;
  selectedApiKey?: HeyGenApiKey | null;
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
  selectedApiKey,
  onConfirm,
  onConfirmWithUrls
}) => {
  console.log('🔍 DEBUG - ManualUploadModal recibió flowState:', {
    hasFlowState: !!flowState,
    hasSubtitleCustomization: !!flowState?.subtitleCustomization,
    subtitleCustomizationData: flowState?.subtitleCustomization,
    selectedStyle: flowState?.selectedStyle?.id,
    hasSelectedApiKey: !!selectedApiKey
  });

  const {
    currentStep,
    images,
    videos,
    isProcessing,
    processingProgress,
    isConverting,
    conversionProgress,
    isDetectingPlan,
    setImages,
    setVideos,
    handleNext,
    handleBack,
    handleConvertFiles,
    resetAndClose,
    isNextDisabled,
    getStepTitle
  } = useManualUploadFlow({ 
    onConfirm, 
    onConfirmWithUrls, 
    onClose,
    flowState,
    selectedApiKey
  });

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

          {/* Loading overlay while detecting plan */}
          {isDetectingPlan && (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-lg font-medium text-foreground">
                Detectando tu plan de HeyGen...
              </p>
              <p className="text-sm text-muted-foreground">
                Esto solo toma un momento
              </p>
            </div>
          )}

          {/* Content */}
          {!isDetectingPlan && currentStep === 'images' && (
            <ImageUploadStep 
              images={images}
              onImagesChange={setImages}
            />
          )}

          {!isDetectingPlan && currentStep === 'videos' && (
            <VideoUploadStep 
              videos={videos}
              onVideosChange={setVideos}
            />
          )}

          {!isDetectingPlan && currentStep === 'convert-files' && (
            <ConvertFilesStep 
              onConvert={handleConvertFiles}
              isConverting={isConverting}
              conversionProgress={conversionProgress}
            />
          )}

          {!isDetectingPlan && (
            <ManualUploadNavigationButtons
              currentStep={currentStep}
              isNextDisabled={isNextDisabled()}
              isProcessing={isProcessing}
              onBack={handleBack}
              onNext={handleNext}
              onCancel={resetAndClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
