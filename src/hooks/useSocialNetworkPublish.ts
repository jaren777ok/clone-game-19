
import { useCallback } from 'react';
import { SocialNetwork } from '@/hooks/useSocialPublishState';
import { BlotatomApiKey } from '@/hooks/useBlotatomApiKeys';

export const useSocialNetworkPublish = () => {
  const publishToNetwork = useCallback(async (
    selectedApiKey: BlotatomApiKey,
    selectedNetwork: SocialNetwork,
    editedCaption: string,
    videoUrl: string
  ) => {
    if (!selectedApiKey || !selectedNetwork || !editedCaption) {
      throw new Error('Faltan datos requeridos para la publicación');
    }

    const decryptedApiKey = atob(selectedApiKey.api_key_encrypted);
    
    const payload = {
      caption: editedCaption,
      network: selectedNetwork,
      videoUrl: videoUrl,
      apiKey: decryptedApiKey
    };
    
    console.log('Publishing to network:', payload);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/REDES', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('Publish response:', data);
    
    if (Array.isArray(data) && data[0]?.Estado) {
      if (data[0].Estado === 'Exito') {
        return { success: true };
      } else {
        throw new Error('Error en la publicación. Intenta nuevamente en 5 minutos.');
      }
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  }, []);

  return {
    publishToNetwork
  };
};
