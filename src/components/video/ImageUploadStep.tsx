import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadStepProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

export const ImageUploadStep: React.FC<ImageUploadStepProps> = ({
  images,
  onImagesChange
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = [...images, ...acceptedFiles].slice(0, 14);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: images.length >= 14
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sube 14 imágenes propias</h3>
        <p className="text-muted-foreground">
          Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm font-medium">{images.length}/14 imágenes</span>
        <div className="w-32 bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(images.length / 14) * 100}%` }}
          />
        </div>
      </div>

      {/* Upload area */}
      {images.length < 14 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Suelta las imágenes aquí..."
              : "Arrastra imágenes aquí o haz clic para seleccionar"}
          </p>
        </div>
      )}

      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status alert */}
      {images.length === 14 && (
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertDescription>
            ¡Perfecto! Has subido las 14 imágenes requeridas. Puedes continuar al siguiente paso.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};