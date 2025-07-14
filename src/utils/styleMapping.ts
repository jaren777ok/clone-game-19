
import { VideoStyle } from '@/types/videoFlow';

// Mapeo interno de estilos a sus IDs
export const STYLE_ID_MAPPING: Record<string, string> = {
  'style-1': '4a3e5937-129b-4201-ae8d-6d7ab019dd61', // Estilo Noticia
  'style-2': 'bde14447-d0cf-45cf-8143-c8ebaaab4163', // Estilo Noticiero
  'style-3': 'c8f2b947-a5e8-4d92-b1c4-9f3e8d7a6b2c', // Estilo Educativo 1
  'style-4': 'd9a3c058-b6f9-4e03-c2d5-af4f9e8b7c3d', // Estilo Educativo 2
  'style-5': 'manual-style', // Estilo Manual
  'style-6': 'manual-style-2', // Estilo Manual 2
};

// Función para obtener el ID interno del estilo
export const getStyleInternalId = (style: VideoStyle): string => {
  // Si el estilo tiene un ID que coincide con nuestro mapeo, lo usamos
  if (STYLE_ID_MAPPING[style.id]) {
    return STYLE_ID_MAPPING[style.id];
  }
  
  // Fallback: usar el primer estilo como predeterminado
  return '4a3e5937-129b-4201-ae8d-6d7ab019dd61';
};

// Función para obtener todos los IDs de estilos disponibles
export const getAvailableStyleIds = (): string[] => {
  return Object.values(STYLE_ID_MAPPING);
};
