
import { VideoStyle } from '@/types/videoFlow';

// Mapeo interno de estilos a sus IDs
export const STYLE_ID_MAPPING: Record<string, string> = {
  'style-1': '333333', // Estilo Dinámico
  'style-2': 'bde14447-d0cf-45cf-8143-c8ebaaab4163', // Estilo Noticiero
};

// Función para obtener el ID interno del estilo
export const getStyleInternalId = (style: VideoStyle): string => {
  // Si el estilo tiene un ID que coincide con nuestro mapeo, lo usamos
  if (STYLE_ID_MAPPING[style.id]) {
    return STYLE_ID_MAPPING[style.id];
  }
  
  // Fallback: usar el primer estilo como predeterminado
  return '333333';
};

// Función para obtener todos los IDs de estilos disponibles
export const getAvailableStyleIds = (): string[] => {
  return Object.values(STYLE_ID_MAPPING);
};
