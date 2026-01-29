

## Plan: Mejoras en el Selector de Avatares

### Resumen de Cambios

Este plan implementa mejoras de usabilidad y rendimiento en el selector de avatares:

1. **Videos en formato horizontal (16:9)** estilo YouTube
2. **Botón de audio** para activar/desactivar sonido del video
3. **Eliminar overlay "Click para elegir"** del carrusel
4. **Panel izquierdo solo con imagen** (no video) para ahorrar recursos
5. **Asegurar fondo animado visible** con opacidad 20%

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/video/AvatarCarousel.tsx` | Modificar | Videos horizontales, botón audio, sin overlay "click para elegir" |
| `src/components/video/AvatarLeftPanel.tsx` | Modificar | Solo imagen (no video) en preview |
| `src/components/video/AvatarSelector.tsx` | Verificar | Confirmar que el video de fondo tiene opacidad correcta |

---

### Cambios Detallados

#### 1. AvatarCarousel.tsx - Videos Horizontales con Audio

**Cambio de aspecto de video:**
```typescript
// ANTES (vertical/cuadrado):
<div className="relative bg-background rounded-xl overflow-hidden aspect-square w-[160px] md:w-[200px] lg:w-[240px]">

// DESPUÉS (horizontal 16:9):
<div className="relative bg-background rounded-xl overflow-hidden aspect-video w-[220px] md:w-[280px] lg:w-[340px]">
```

**Agregar control de audio:**
- Nuevo estado `isMuted` para controlar el audio del video activo
- Botón pequeño de speaker en la esquina del video activo
- El usuario puede hacer click para activar/desactivar audio

**Eliminar overlay "Click para elegir":**
- Remover completamente el div con el texto "Click para elegir"
- Mantener solo el video/imagen sin overlay

**Código del botón de audio:**
```typescript
// Botón de audio en esquina inferior derecha del video activo
{isActive && avatar.preview_video_url && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      toggleMute();
    }}
    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/60 
               hover:bg-black/80 flex items-center justify-center 
               transition-all duration-300 backdrop-blur-sm z-20"
  >
    {isMuted ? (
      <VolumeX className="w-5 h-5 text-white" />
    ) : (
      <Volume2 className="w-5 h-5 text-white" />
    )}
  </button>
)}
```

#### 2. AvatarLeftPanel.tsx - Solo Imagen

**Simplificar preview a solo imagen:**
```typescript
// ANTES (video o imagen):
{activeAvatar.preview_video_url ? (
  <video ... />
) : (
  <img ... />
)}

// DESPUÉS (siempre imagen):
<img
  src={activeAvatar.preview_image_url}
  alt={activeAvatar.avatar_name}
  className="w-full h-full object-cover"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
  }}
/>
```

**Beneficios:**
- Ahorra memoria al no duplicar reproducción de video
- El video solo se reproduce en el carrusel central
- Panel izquierdo es solo referencia visual estática

#### 3. AvatarSelector.tsx - Verificar Fondo

El fondo ya está configurado correctamente con:
- Video de fondo: `fondonormal.mp4`
- Opacidad: `opacity-20`
- Overlay de gradiente para legibilidad

Si no se ve el fondo, puede ser un problema de carga del video. Agregar fallback de color de fondo:
```typescript
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover opacity-20"
  style={{ backgroundColor: 'hsl(var(--background))' }}
>
```

---

### Estructura Visual Final

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  [Video Background: fondonormal.mp4 - opacity 20%]                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────┐  ┌────────────────────────────────────────────┐ │
│  │  PANEL IZQUIERDO   │  │         CARRUSEL HORIZONTAL                │ │
│  │                    │  │                                            │ │
│  │  ← Cambiar Estilo  │  │    ┌─────────────────────────────────┐     │ │
│  │                    │  │    │    Video Horizontal 16:9        │     │ │
│  │  [IMAGEN estática] │  │[◄] │         (con audio)         🔊  │ [►] │ │
│  │                    │  │    │                                 │     │ │
│  │  Nombre Avatar     │  │    └─────────────────────────────────┘     │ │
│  │                    │  │                                            │ │
│  │  [Elegir Avatar]   │  │        ● ● ● [●] ● ● ●  (paginación)       │ │
│  │                    │  │                                            │ │
│  └────────────────────┘  └────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Detalles Técnicos

#### Estado de Audio en AvatarCarousel
```typescript
const [isMuted, setIsMuted] = useState(true);

const toggleMute = () => {
  setIsMuted(prev => !prev);
};

// En el video activo:
<video
  ref={(el) => { videoRefs.current[avatar.avatar_id] = el; }}
  src={avatar.preview_video_url}
  className="w-full h-full object-cover pointer-events-none"
  loop
  muted={isMuted}  // Controlado por estado
  playsInline
/>
```

#### Actualizar useEffect para manejar audio
```typescript
useEffect(() => {
  const activeAvatar = avatars[activeIndex];
  if (!activeAvatar) return;

  // Pause all videos and reset mute
  Object.values(videoRefs.current).forEach(video => {
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.muted = true;  // Reset mute al cambiar
    }
  });

  // Reset mute state when changing avatar
  setIsMuted(true);

  // Play the active video
  const activeVideo = videoRefs.current[activeAvatar.avatar_id];
  if (activeVideo) {
    activeVideo.play().catch(console.error);
  }
}, [activeIndex, avatars]);
```

---

### Resultado Esperado

1. Los avatares se muestran en formato horizontal (16:9) como YouTube
2. Hay un botón de speaker para activar/desactivar audio
3. No hay overlay "Click para elegir" - el botón está en el panel izquierdo
4. El panel izquierdo muestra solo imagen estática (ahorra memoria)
5. El fondo animado es visible con opacidad correcta
6. La experiencia es más fluida y menos redundante

