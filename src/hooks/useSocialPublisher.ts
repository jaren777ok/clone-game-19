
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeCaption } from '@/lib/textUtils';

interface PublishPayload {
  videoUrl: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook';
  apiKey: string;
  accountId: string;
  caption: string;
}

export const useSocialPublisher = () => {
  const [publishingToInstagram, setPublishingToInstagram] = useState(false);
  const [publishingToTikTok, setPublishingToTikTok] = useState(false);
  const [publishingToYouTube, setPublishingToYouTube] = useState(false);
  const [publishingToFacebook, setPublishingToFacebook] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<{ platform: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const { toast } = useToast();

  const publishToSocialNetwork = async (payload: PublishPayload) => {
    const { platform } = payload;
    
    try {
      // Set loading state based on platform
      switch (platform) {
        case 'Instagram':
          setPublishingToInstagram(true);
          break;
        case 'TikTok':
          setPublishingToTikTok(true);
          break;
        case 'YouTube':
          setPublishingToYouTube(true);
          break;
        case 'Facebook':
          setPublishingToFacebook(true);
          break;
      }
      
      setPublishError(null);
      
      // Aplicar sanitización final al caption antes del envío
      const sanitizedPayload = {
        ...payload,
        caption: sanitizeCaption(payload.caption)
      };
      
      console.log(`📱 Publicando en ${platform}...`, sanitizedPayload);
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/REDES', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedPayload)
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
      // Reset loading state based on platform
      switch (platform) {
        case 'Instagram':
          setPublishingToInstagram(false);
          break;
        case 'TikTok':
          setPublishingToTikTok(false);
          break;
        case 'YouTube':
          setPublishingToYouTube(false);
          break;
        case 'Facebook':
          setPublishingToFacebook(false);
          break;
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
    publishingToYouTube,
    publishingToFacebook,
    publishSuccess,
    publishError,
    publishToSocialNetwork,
    resetPublishState
  };
};
