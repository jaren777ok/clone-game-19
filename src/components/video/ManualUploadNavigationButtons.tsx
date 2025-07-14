import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type UploadStep = 'images' | 'videos' | 'convert-files' | 'api-version';

interface ManualUploadNavigationButtonsProps {
  currentStep: UploadStep;
  isNextDisabled: boolean;
  isProcessing: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
}

export const ManualUploadNavigationButtons: React.FC<ManualUploadNavigationButtonsProps> = ({
  currentStep,
  isNextDisabled,
  isProcessing,
  onBack,
  onNext,
  onCancel
}) => {
  // Don't show navigation buttons for api-version and convert-files steps
  if (currentStep === 'api-version' || currentStep === 'convert-files') {
    return null;
  }

  return (
    <div className="flex justify-between pt-4">
      <Button 
        variant="outline" 
        onClick={currentStep === 'images' ? onCancel : onBack}
        disabled={isProcessing}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        {currentStep === 'images' ? 'Cancelar' : 'Anterior'}
      </Button>
      
      <Button 
        onClick={onNext}
        disabled={isNextDisabled || isProcessing}
      >
        Siguiente
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};