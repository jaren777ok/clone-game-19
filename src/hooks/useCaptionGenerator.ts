
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeCaption } from '@/lib/textUtils';

interface CaptionResponse {
  caption: string;
}

export const useCaptionGenerator = () => {
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [editedCaption, setEditedCaption] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateCaption = async (script: string) => {
    try {
      setIsGenerating(true);
      setError(null);
      console.log('🤖 Generando caption con IA para script:', script);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutos timeout

      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script: script.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data: CaptionResponse[] = await response.json();
      console.log('✅ Respuesta del webhook de caption:', data);
      
      if (data && data.length > 0 && data[0].caption) {
        const caption = data[0].caption;
        setGeneratedCaption(caption);
        // Aplicar sanitización automática al caption generado
        setEditedCaption(sanitizeCaption(caption));
        
        toast({
          title: "¡Caption generado!",
          description: "El caption ha sido generado con IA. Puedes editarlo antes de continuar.",
        });
        
        return { success: true, caption };
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Error generando caption:', err);
      
      let errorMessage = 'No se pudo generar el caption.';
      if (err.name === 'AbortError') {
        errorMessage = 'La generación del caption tardó demasiado tiempo. Intenta de nuevo.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  };

  const updateCaption = (newCaption: string) => {
    // Aplicar sanitización automática cuando el usuario edita el caption
    const sanitizedCaption = sanitizeCaption(newCaption);
    console.log('🔧 Caption sanitizado:', { original: newCaption, sanitized: sanitizedCaption });
    setEditedCaption(sanitizedCaption);
  };

  const resetCaption = () => {
    setGeneratedCaption('');
    setEditedCaption('');
    setError(null);
  };

  return {
    generatedCaption,
    editedCaption,
    isGenerating,
    error,
    generateCaption,
    updateCaption,
    resetCaption
  };
};
