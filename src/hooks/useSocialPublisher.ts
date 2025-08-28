
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeCaption } from '@/lib/textUtils';
import { triggerConfetti } from '@/components/ui/confetti';

interface PublishPayload {
  videoUrl: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook';
  apiKey: string;
  accountId: string;
  caption: string;
  titulo?: string; // Título opcional para YouTube
  pageId?: string; // ID de página opcional para Facebook
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

      // Para YouTube, incluir título sanitizado si está presente
      if (platform === 'YouTube' && payload.titulo) {
        sanitizedPayload.titulo = sanitizeCaption(payload.titulo);
      }

      // Para Facebook, incluir pageId si está presente
      if (platform === 'Facebook' && payload.pageId) {
        sanitizedPayload.pageId = payload.pageId;
      }
      
      console.log(`📱 Publicando en ${platform}...`, sanitizedPayload);
      
      // Crear AbortController para timeout de 5 minutos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5 * 60 * 1000); // 5 minutos

      const response = await fetch('https://cris.cloude.es/webhook/REDES', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Respuesta de publicación en ${platform}:`, data);
      
      // Parsear la respuesta del webhook que viene como array
      let isSuccess = false;
      if (Array.isArray(data) && data.length > 0 && data[0].Estado) {
        isSuccess = data[0].Estado === 'Exito';
      }

      if (isSuccess) {
        setPublishSuccess({ platform });
        
        // Trigger confetti effect on success
        setTimeout(() => {
          triggerConfetti();
        }, 500);
        
        toast({
          title: `¡Publicado en ${platform}!`,
          description: `Tu video ha sido publicado exitosamente en ${platform}.`,
        });
        
        return { success: true, data };
      } else {
        // El webhook respondió pero con error
        throw new Error('La publicación no se completó correctamente');
      }
      
    } catch (err: any) {
      console.error(`❌ Error publicando en ${platform}:`, err);
      
      let errorMessage = `No se pudo publicar en ${platform}.`;
      
      if (err.name === 'AbortError') {
        errorMessage = `La publicación en ${platform} tardó demasiado. Por favor, intenta nuevamente en 2 minutos.`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setPublishError(errorMessage);
      
      toast({
        title: "Error de publicación",
        description: `${errorMessage} ${err.name !== 'AbortError' ? 'Intenta nuevamente en 2 minutos.' : ''}`,
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
