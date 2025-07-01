
/**
 * Transforma las comillas para evitar problemas con JSON
 * Convierte comillas dobles y simples a comillas curvas para mantener el estilo
 * pero evitar conflictos en estructuras JSON
 */
export const transformQuotes = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    // Reemplazar comillas dobles con comillas curvas
    .replace(/"/g, '\u201C')  // " (comilla doble izquierda)
    .replace(/"/g, '\u201D')  // " (comilla doble derecha)
    // Reemplazar comillas simples con comillas curvas
    .replace(/'/g, '\u2018')  // ' (comilla simple izquierda)
    .replace(/'/g, '\u2019'); // ' (comilla simple derecha)
};

/**
 * Sanitiza el texto de un caption para evitar problemas en JSON
 * Aplica transformación de comillas y mantiene el formato legible
 */
export const sanitizeCaption = (caption: string): string => {
  if (!caption || typeof caption !== 'string') return caption;
  
  return transformQuotes(caption.trim());
};
