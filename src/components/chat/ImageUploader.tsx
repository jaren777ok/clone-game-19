
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { X, Image, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange, disabled = false }) => {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validar que no se excedan las 5 imágenes
    if (images.length + files.length > 5) {
      toast({
        title: "Límite excedido",
        description: "Solo puedes subir un máximo de 5 imágenes por mensaje.",
        variant: "destructive"
      });
      return;
    }

    // Validar formatos permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos JPG, PNG, GIF y WebP.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño máximo (10MB por imagen)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "Archivo muy grande",
        description: "Cada imagen debe ser menor a 10MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convertir archivos a base64
      const base64Images = await Promise.all(
        files.map(file => convertToBase64(file))
      );

      const newImages = [...images, ...base64Images];
      setImages(newImages);
      onImagesChange(newImages);

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Imágenes cargadas",
        description: `${files.length} imagen${files.length > 1 ? 'es' : ''} cargada${files.length > 1 ? 's' : ''} correctamente.`,
      });
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar las imágenes. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const clearAllImages = () => {
    setImages([]);
    onImagesChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {images.length} imagen{images.length > 1 ? 'es' : ''} seleccionada{images.length > 1 ? 's' : ''}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllImages}
              disabled={disabled}
              className="text-muted-foreground hover:text-destructive"
            >
              Limpiar todo
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border cyber-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para seleccionar imágenes */}
      {images.length < 5 && (
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="cyber-border hover:cyber-glow-intense transition-all duration-300"
          >
            <Image className="w-4 h-4 mr-2" />
            {images.length === 0 ? 'Subir imágenes' : 'Agregar más'}
          </Button>
          <span className="text-xs text-muted-foreground">
            Máximo {5 - images.length} imagen{5 - images.length !== 1 ? 'es' : ''} más
          </span>
        </div>
      )}
    </div>
  );
};
