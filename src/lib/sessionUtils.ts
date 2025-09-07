
/**
 * Utilidad para generar y gestionar sessionId único por usuario y sesión
 * Formato: app_session_{userId}_{timestamp}
 * Se almacena en sessionStorage (se borra al cerrar app)
 */

const SESSION_KEY = 'neurocopy_session_id';

export const generateSessionId = (userId: string): string => {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  
  return `app_session_${userId}_${timestamp}`;
};

export const getOrCreateSessionId = (userId: string): string => {
  // Siempre generar un nuevo sessionId en cada carga de página
  const newSessionId = generateSessionId(userId);
  sessionStorage.setItem(SESSION_KEY, newSessionId);
  
  console.log('Nuevo SessionID generado:', newSessionId);
  return newSessionId;
};

export const getCurrentSessionId = (): string | null => {
  return sessionStorage.getItem(SESSION_KEY);
};

export const clearSessionId = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
  console.log('SessionID limpiado');
};
