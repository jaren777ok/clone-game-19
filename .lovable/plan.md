

## Plan: Reemplazar Sonido Procedural con Audio de Supabase

### Objetivo
Usar el archivo de audio MP3 de Supabase en lugar del sonido procedural generado. El audio debe:
1. Iniciar cuando empieza el efecto typewriter
2. Reproducirse en **bucle** si el texto sigue generándose
3. **Cortarse inmediatamente** cuando termine la generación del texto

---

### Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUDIO                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. typeMessage() inicia                                            │
│         │                                                           │
│         ▼                                                           │
│  2. startTypingAudio()                                              │
│         │                                                           │
│         ├──► Carga el audio desde Supabase (una sola vez, cacheado) │
│         │                                                           │
│         ├──► Configura audio.loop = true                            │
│         │                                                           │
│         └──► audio.play()                                           │
│                                                                     │
│  3. Mientras index < fullContent.length                             │
│         │                                                           │
│         └──► El audio sigue en loop automáticamente                 │
│                                                                     │
│  4. Cuando index > fullContent.length (texto terminado)             │
│         │                                                           │
│         ▼                                                           │
│  5. stopTypingAudio()                                               │
│         │                                                           │
│         ├──► audio.pause()                                          │
│         │                                                           │
│         └──► audio.currentTime = 0 (reset para próximo uso)         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Cambios Detallados

#### Archivo: `src/lib/typingSound.ts` (REESCRIBIR COMPLETO)

Reemplazar todo el contenido con un sistema basado en HTMLAudioElement:

```typescript
// URL del audio en Supabase Storage
const TYPING_AUDIO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/efecto%20de%20escribir.MP3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9lZmVjdG8gZGUgZXNjcmliaXIuTVAzIiwiaWF0IjoxNzY5NTUyNjI5LCJleHAiOjE5MjcyMzI2Mjl9.o8o_0_U2VOannh5p9AQRa_ZTRL7fQGuf4ESam-Z1vTc';

// Variables globales
let typingAudio: HTMLAudioElement | null = null;
let isAudioPlaying = false;

// Inicializar audio (lazy load)
const getAudio = (): HTMLAudioElement => {
  if (!typingAudio) {
    typingAudio = new Audio(TYPING_AUDIO_URL);
    typingAudio.loop = true;  // Bucle automático
    typingAudio.volume = 0.5; // Volumen moderado
  }
  return typingAudio;
};

// Iniciar reproducción en bucle
export const startTypingAudio = (): void => {
  const audio = getAudio();
  if (!isAudioPlaying) {
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Audio play blocked:', e));
    isAudioPlaying = true;
  }
};

// Detener audio inmediatamente
export const stopTypingAudio = (): void => {
  if (typingAudio && isAudioPlaying) {
    typingAudio.pause();
    typingAudio.currentTime = 0;
    isAudioPlaying = false;
  }
};

// Cleanup
export const cleanupTypingSound = (): void => {
  stopTypingAudio();
  typingAudio = null;
};
```

**Características clave:**
- `audio.loop = true` - El navegador maneja el bucle automáticamente
- Lazy loading - El audio solo se carga una vez cuando se necesita
- Control simple con `play()` / `pause()`
- Reset con `currentTime = 0` para próximo uso

---

#### Archivo: `src/components/video/NeuroCopyGenerator.tsx`

**Cambios en imports (línea 12):**
```typescript
// Antes:
import { playTypingSound, resetTypingSoundCounter, cleanupTypingSound } from '@/lib/typingSound';

// Después:
import { startTypingAudio, stopTypingAudio, cleanupTypingSound } from '@/lib/typingSound';
```

**Cambios en función `typeMessage` (líneas 128-164):**

```typescript
const typeMessage = useCallback((messageId: string, fullContent: string, speed: number = 25) => {
  setTypingMessageId(messageId);
  let index = 0;
  
  // Limpiar interval anterior
  if (typewriterRef.current) {
    clearInterval(typewriterRef.current);
  }
  
  // INICIAR audio en bucle
  startTypingAudio();
  
  typewriterRef.current = setInterval(() => {
    if (index <= fullContent.length) {
      // Ya no llamamos playTypingSound() aquí - el audio está en loop
      setDisplayedContent(prev => ({
        ...prev,
        [messageId]: fullContent.slice(0, index)
      }));
      index++;
    } else {
      // Texto terminado - DETENER audio
      stopTypingAudio();
      
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
      setTypingMessageId(null);
      setDisplayedContent(prev => ({
        ...prev,
        [messageId]: fullContent
      }));
    }
  }, speed);
}, []);
```

**Cambios en useEffect de cleanup (líneas 166-177):**

```typescript
useEffect(() => {
  typeMessage('welcome', welcomeMessageContent, 30);
  
  return () => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    // Detener audio si está reproduciéndose
    stopTypingAudio();
    cleanupTypingSound();
  };
}, [typeMessage]);
```

---

### Resumen de Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/typingSound.ts` | Reescribir | Cambiar de Web Audio API a HTMLAudioElement con bucle |
| `src/components/video/NeuroCopyGenerator.tsx` | Modificar | Actualizar imports y lógica de start/stop audio |

---

### Ventajas de Este Enfoque

1. **Simplicidad**: `audio.loop = true` maneja el bucle automáticamente sin lógica adicional
2. **Rendimiento**: El audio se carga una sola vez y se reutiliza
3. **Control preciso**: `pause()` detiene inmediatamente, sin fade-out
4. **Compatible**: HTMLAudioElement funciona en todos los navegadores modernos
5. **Sin dependencias**: No necesita Web Audio API complejo

### Consideraciones Técnicas

- El token del URL de Supabase expira en **2030** (exp: 1927232629), así que no hay problema de expiración
- El audio se precarga automáticamente cuando se llama a `getAudio()` por primera vez
- Si el usuario cambia de página durante la escritura, el `useEffect` cleanup detiene el audio

