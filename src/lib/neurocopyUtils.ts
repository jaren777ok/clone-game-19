
import { useAuth } from '@/hooks/useAuth';
import { getCurrentSessionId } from './sessionUtils';

interface NeurocopyResponse {
  guion_IA: string;
}

export const generateScript = async (instructions: string, userId?: string): Promise<string> => {
  try {
    console.log('Enviando instrucciones a NeuroCopy GPT:', instructions);
    
    const requestBody: any = { 
      instructions: instructions.trim()
    };
    
    // Agregar userId si está disponible
    if (userId) {
      requestBody.Userid = userId;
    }
    
    // Agregar sessionid si está disponible
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      requestBody.sessionid = sessionId;
      console.log('SessionID agregado al payload:', sessionId);
    }
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/guion_base', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data: NeurocopyResponse[] = await response.json();
    console.log('Respuesta de NeuroCopy GPT:', data);
    
    // La webhook retorna un array con un objeto que tiene la propiedad "guion_IA"
    if (data && data.length > 0 && data[0].guion_IA) {
      return data[0].guion_IA;
    } else {
      throw new Error('Respuesta inesperada del servidor');
    }
    
  } catch (err) {
    console.error('Error generando guión:', err);
    throw err;
  }
};
