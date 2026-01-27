/**
 * Typing Sound Controller
 * Uses HTMLAudioElement to play a typing sound from Supabase Storage
 * with loop support and instant stop capability.
 */

// URL del audio en Supabase Storage (expira en 2030)
const TYPING_AUDIO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/efecto%20de%20escribir.MP3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9lZmVjdG8gZGUgZXNjcmliaXIuTVAzIiwiaWF0IjoxNzY5NTUyNjI5LCJleHAiOjE5MjcyMzI2Mjl9.o8o_0_U2VOannh5p9AQRa_ZTRL7fQGuf4ESam-Z1vTc';

// Estado global del audio
let typingAudio: HTMLAudioElement | null = null;
let isAudioPlaying = false;

/**
 * Obtiene o crea la instancia del audio (lazy load)
 */
const getAudio = (): HTMLAudioElement => {
  if (!typingAudio) {
    typingAudio = new Audio(TYPING_AUDIO_URL);
    typingAudio.loop = true;  // Bucle automático
    typingAudio.volume = 0.5; // Volumen moderado
    typingAudio.preload = 'auto'; // Precargar para reproducción inmediata
  }
  return typingAudio;
};

/**
 * Inicia la reproducción del audio en bucle
 * Solo inicia si no está ya reproduciéndose
 */
export const startTypingAudio = (): void => {
  const audio = getAudio();
  if (!isAudioPlaying) {
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Audio play blocked:', e));
    isAudioPlaying = true;
  }
};

/**
 * Detiene el audio inmediatamente y resetea la posición
 */
export const stopTypingAudio = (): void => {
  if (typingAudio && isAudioPlaying) {
    typingAudio.pause();
    typingAudio.currentTime = 0;
    isAudioPlaying = false;
  }
};

/**
 * Limpieza completa del audio (para cuando se desmonta el componente)
 */
export const cleanupTypingSound = (): void => {
  stopTypingAudio();
  typingAudio = null;
};
