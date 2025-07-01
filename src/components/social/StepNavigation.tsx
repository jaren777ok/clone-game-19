
import React from 'react';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onClose: () => void;
  showNavigation: boolean;
}

const StepNavigation = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onClose, 
  showNavigation 
}: StepNavigationProps) => {
  if (!showNavigation) return null;

  return (
    <div className="flex justify-between pt-4">
      <Button
        variant="outline"
        onClick={currentStep === 1 ? onClose : onPrevious}
        className="cyber-border hover:cyber-glow"
      >
        {currentStep === 1 ? 'Cancelar' : 'Anterior'}
      </Button>
      
      <div className="text-sm text-muted-foreground flex items-center">
        Paso {currentStep} de {totalSteps}
      </div>
    </div>
  );
};

export default StepNavigation;
