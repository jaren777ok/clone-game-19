import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { X, Upload, Video } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoUploadStepProps {
  videos: File[];
  onVideosChange: (videos: File[]) => void;
}

export const VideoUploadStep: React.FC<VideoUploadStepProps> = ({
  videos,
  onVideosChange
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newVideos = [...videos, ...acceptedFiles].slice(0, 5);
    onVideosChange(newVideos);
  }, [videos, onVideosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: videos.length >= 5
  });

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Sube 5 videos propios</h3>
        <p className="text-muted-foreground">
          Formatos permitidos: MP4, MOV, AVI. Tamaño máximo: 50MB por video.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm font-medium">{videos.length}/5 videos</span>
        <div className="w-32 bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(videos.length / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Upload area */}
      {videos.length < 5 && (
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
              ? "Suelta los videos aquí..."
              : "Arrastra videos aquí o haz clic para seleccionar"}
          </p>
        </div>
      )}

      {/* Videos list */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    Video {index + 1}: {video.name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(video.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status alert */}
      {videos.length === 5 && (
        <Alert>
          <Video className="h-4 w-4" />
          <AlertDescription>
            ¡Excelente! Has subido los 5 videos requeridos. Puedes continuar a la configuración de API.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};