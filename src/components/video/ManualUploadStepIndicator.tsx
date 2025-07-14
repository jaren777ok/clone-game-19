import React from 'react';
import { ChevronRight } from "lucide-react";

type UploadStep = 'images' | 'videos' | 'convert-files' | 'api-version';

interface ManualUploadStepIndicatorProps {
  currentStep: UploadStep;
}

export const ManualUploadStepIndicator: React.FC<ManualUploadStepIndicatorProps> = ({
  currentStep
}) => {
  const steps = [
    { key: 'images', number: 1, label: '14 Imágenes' },
    { key: 'videos', number: 2, label: '5 Videos' },
    { key: 'convert-files', number: 3, label: 'Convertir' },
    { key: 'api-version', number: 4, label: 'API Version' }
  ];

  return (
    <div className="flex items-center justify-center space-x-2 text-sm overflow-x-auto">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div className={`flex items-center space-x-2 ${
            currentStep === step.key ? 'text-primary' : 'text-muted-foreground'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step.key 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              {step.number}
            </div>
            <span className="whitespace-nowrap">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};