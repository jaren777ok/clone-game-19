import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DriveUploadStepProps {
  images: File[];
  videos: File[];
  onComplete: (imageUrls: string[], videoUrls: string[]) => void;
  onBack: () => void;
}

export const DriveUploadStep = ({ images, videos, onComplete, onBack }: DriveUploadStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const totalFiles = images.length + videos.length;

  const getGoogleAccessToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const clientId = '898665075367-jveciam3kqsnc46lnrf47bnbn7iq709n.apps.googleusercontent.com';
      const redirectUri = `${window.location.origin}/google-auth-callback.html`;
      const scope = 'https://www.googleapis.com/auth/drive.file';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=token&` +
        `state=drive_upload`;

      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
      
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          resolve(event.data.token);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          reject(new Error(event.data.error));
        }
      });
    });
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      // Get Google OAuth token
      setCurrentFile('Autenticando con Google Drive...');
      const accessToken = await getGoogleAccessToken();
      
      // Prepare FormData
      const formData = new FormData();
      formData.append('accessToken', accessToken);
      
      // Add images
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      
      // Add videos
      videos.forEach((video, index) => {
        formData.append(`video${index + 1}`, video);
      });

      setCurrentFile('Subiendo archivos a Google Drive...');
      
      // Upload to Google Drive via Edge Function using Supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Failed to upload files');
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to upload files');
      }

      setUploadProgress(100);
      setCurrentFile('¡Todos los archivos subidos correctamente!');
      setIsComplete(true);
      
      toast({
        title: "Archivos subidos exitosamente",
        description: `${data.imageUrls.length} imágenes y ${data.videoUrls.length} videos subidos a Google Drive`,
      });

      // Wait a moment before calling onComplete
      setTimeout(() => {
        onComplete(data.imageUrls, data.videoUrls);
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setIsUploading(false);
      toast({
        title: "Error al subir archivos",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {isComplete ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : error ? (
            <AlertCircle className="h-16 w-16 text-red-500" />
          ) : (
            <Upload className="h-16 w-16 text-primary" />
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Convertir Archivos para Procesar
          </h3>
          <p className="text-muted-foreground mt-2">
            Subiendo archivos a Google Drive para optimizar el procesamiento
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Archivos a procesar:</span>
            <span className="font-medium">{totalFiles} archivos</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Imágenes:</span>
            <span>{images.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Videos:</span>
            <span>{videos.length}</span>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-4">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {currentFile}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isUploading}
          className="flex-1"
        >
          Atrás
        </Button>
        
        {!isComplete && (
          <Button
            onClick={handleUpload}
            disabled={isUploading || totalFiles === 0}
            className="flex-1"
          >
            {isUploading ? 'Subiendo...' : 'Subir y Continuar'}
          </Button>
        )}
      </div>
    </div>
  );
};