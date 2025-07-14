import React from 'react';

interface ManualUploadProgressBarProps {
  isProcessing: boolean;
  processingProgress: {
    current: number;
    total: number;
    type: string;
  };
}

export const ManualUploadProgressBar: React.FC<ManualUploadProgressBarProps> = ({
  isProcessing,
  processingProgress
}) => {
  if (!isProcessing) return null;

  return (
    <div className="text-center space-y-2">
      <div className="text-sm text-muted-foreground">
        {processingProgress.type === 'image' ? (
          <>Procesando imágenes... ({processingProgress.current}/{processingProgress.total})</>
        ) : (
          'Enviando archivos...'
        )}
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ 
            width: processingProgress.total > 0 
              ? `${(processingProgress.current / processingProgress.total) * 100}%` 
              : '10%' 
          }}
        />
      </div>
    </div>
  );
};