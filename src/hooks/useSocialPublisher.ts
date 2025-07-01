
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PublishPayload {
  videoUrl: string;
  platform: 'Instagram' | 'TikTok';
  apiKey: string;
  accountId: string;
  caption: string;
}

export const useSocialPublisher = () => {
  const [publishingToInstagram, setPublishingToInstagram] = useState(false);
  const [publishingToTikTok, setPublishingToTikTok] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<{ platform: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const { toast } = useToast();

  const publishToSocialNetwork = async (payload: PublishPayload) => {
    const { platform } = payload;
    const isInstagram = platform === 'Instagram';
    
    try {
      if (isInstagram) {
        setPublishingToInstagram(true);
      } else {
        setPublishingToTikTok(true);
      }
      
      setPublishError(null);
      console.log(`📱 Publicando en ${platform}...`, payload);
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/REDES', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Respuesta de publicación en ${platform}:`, data);
      
      setPublishSuccess({ platform });
      toast({
        title: `¡Publicado en ${platform}!`,
        description: `Tu video ha sido publicado exitosamente en ${platform}.`,
      });
      
      return { success: true, data };
      
    } catch (err: any) {
      console.error(`❌ Error publicando en ${platform}:`, err);
      
      const errorMessage = err.message || `No se pudo publicar en ${platform}.`;
      setPublishError(errorMessage);
      
      toast({
        title: "Error de publicación",
        description: `Error al publicar en ${platform}: ${errorMessage}`,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    } finally {
      if (isInstagram) {
        setPublishingToInstagram(false);
      } else {
        setPublishingToTikTok(false);
      }
    }
  };

  const resetPublishState = () => {
    setPublishSuccess(null);
    setPublishError(null);
  };

  return {
    publishingToInstagram,
    publishingToTikTok,
    publishSuccess,
    publishError,
    publishToSocialNetwork,
    resetPublishState
  };
};
