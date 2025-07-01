
import { useCallback } from 'react';

export const useCaptionGeneration = () => {
  const generateCaption = useCallback(async (script: string) => {
    if (!script) {
      throw new Error('Script is required');
    }

    console.log('Generating caption for script:', script);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('Caption response:', data);
    
    if (Array.isArray(data) && data[0]?.caption) {
      return data[0].caption;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  }, []);

  return {
    generateCaption
  };
};
