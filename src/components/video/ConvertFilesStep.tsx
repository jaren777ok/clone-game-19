import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, Upload } from "lucide-react";

interface ConvertFilesStepProps {
  onConvert: () => Promise<void>;
  isConverting: boolean;
  conversionProgress: string;
}

export const ConvertFilesStep: React.FC<ConvertFilesStepProps> = ({
  onConvert,
  isConverting,
  conversionProgress
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Convertir Archivos</h3>
          <p className="text-muted-foreground">
            Procesando archivos para optimizar la generación del video...
          </p>
        </div>

        {isConverting && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {conversionProgress || 'Preparando archivos...'}
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500 animate-pulse w-2/3" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onConvert}
          disabled={isConverting}
          size="lg"
          className="min-w-[120px]"
        >
          {isConverting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};