
interface NeurocopyResponse {
  output: string;
}

export const generateScript = async (instructions: string): Promise<string> => {
  try {
    console.log('Enviando instrucciones a NeuroCopy GPT:', instructions);
    
    const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook/guion_base', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        instructions: instructions.trim()
      }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data: NeurocopyResponse[] = await response.json();
    console.log('Respuesta de NeuroCopy GPT:', data);
    
    // La webhook retorna un array con un objeto que tiene la propiedad "output"
    if (data && data.length > 0 && data[0].output) {
      return data[0].output;
    } else {
      throw new Error('Respuesta inesperada del servidor');
    }
    
  } catch (err) {
    console.error('Error generando guión:', err);
    throw err;
  }
};
