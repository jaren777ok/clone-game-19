
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const StepIndicator = ({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            {/* Círculo del paso */}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
              ${isCompleted 
                ? 'bg-primary border-primary text-primary-foreground' 
                : isCurrent 
                ? 'border-primary text-primary cyber-glow' 
                : 'border-muted-foreground text-muted-foreground'
              }
            `}>
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            
            {/* Label del paso */}
            <div className="ml-2 hidden sm:block">
              <span className={`text-sm font-medium ${
                isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {stepLabels[index]}
              </span>
            </div>
            
            {/* Línea conectora */}
            {index < totalSteps - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
