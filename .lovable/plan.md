
## Plan: Rediseño de "Elige el Estilo de Edición" con Layout de Dos Paneles y Carrusel

### Objetivo
Transformar la página de selección de estilos de una grilla de 3 columnas a un layout de dos paneles con:
- Panel izquierdo (30%): Información del paso e información dinámica del estilo activo
- Panel derecho (70%): Carrusel horizontal con videos verticales y navegación

---

### Arquitectura Visual

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [← Cambiar avatar]                    Header Global              [Usuario] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────────────────────────┐ │
│  │   [🎬 ICONO]     │  │                                                 │ │
│  │                  │  │    [Video]     [VIDEO ACTIVO]     [Video]       │ │
│  │  Elige el       │  │     pequeño       GRANDE          pequeño       │ │
│  │  Estilo de      │  │      (50%)         (100%)          (50%)        │ │
│  │  Edición        │  │                                                  │ │
│  │                  │  │         ←────────────────────→                  │ │
│  │  ────────────   │  │                                                  │ │
│  │                  │  │              ● ● ● ● ● ● ●                     │ │
│  │  [Estilo        │  │                                                  │ │
│  │   Noticiero]    │  └─────────────────────────────────────────────────┘ │
│  │                  │                                                      │
│  │  Requisitos:     │                                                      │
│  │  ✓ Fondo Verde   │                                                      │
│  │  ✓ Avatar Horiz. │                                                      │
│  │  [Descargar]     │                                                      │
│  │                  │                                                      │
│  │  [Elegir Riendo] │                                                      │
│  │  [Elegir Estilo] │                                                      │
│  └──────────────────┘                                                      │
│                                                                             │
│  ═══════════════════ VIDEO DE FONDO ANIMADO ═══════════════════════════   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/video/StyleSelector.tsx` | MODIFICAR | Restructurar para layout de dos paneles |
| `src/components/video/StyleLeftPanel.tsx` | CREAR | Panel izquierdo con info estática y dinámica |
| `src/components/video/StyleCarousel.tsx` | CREAR | Carrusel de videos con Embla |
| `src/components/video/StyleGrid.tsx` | ELIMINAR | Ya no será necesario (reemplazado por carrusel) |
| `src/components/video/StyleSelectorHeader.tsx` | MODIFICAR | Simplificar, solo botón de navegación |
| `src/types/videoFlow.ts` | MODIFICAR | Agregar descripciones a VideoStyle |

---

### PARTE 1: Actualizar tipo VideoStyle

Agregar campos adicionales para la información dinámica:

```typescript
export interface VideoStyle {
  id: string;
  name: string;
  video_url: string;
  description?: string;  // NUEVO: descripción corta del estilo
  requirements: {        // NUEVO: requisitos estructurados
    items: string[];
    downloadUrl?: string;
    downloadLabel?: string;
  };
}
```

---

### PARTE 2: Crear StyleLeftPanel.tsx

Nuevo componente para el panel izquierdo con:

**Sección Estática:**
- Icono de claqueta/cámara con degradado rosa-magenta y animación flotante
- Título: "Elige el Estilo de Edición" con gradiente
- Subtítulo: "Selecciona el estilo que mejor se adapte..."

**Sección Dinámica (cambia con el slide activo):**
- Nombre del estilo actual con efecto de resplandor
- Lista de requisitos con iconos (check verde o advertencia)
- Enlace de descarga si aplica
- Botón "Elegir [Nombre del Estilo]" con degradado

```tsx
interface StyleLeftPanelProps {
  activeStyle: VideoStyle | null;
  onSelectStyle: (style: VideoStyle) => void;
  onBack: () => void;
}
```

**Animaciones:**
- Transición suave al cambiar de estilo (fade-in del nombre y requisitos)
- El botón cambia de texto dinámicamente: "Elegir Estilo Noticia", "Elegir Estilo Noticiero", etc.

---

### PARTE 3: Crear StyleCarousel.tsx

Nuevo componente usando Embla Carousel:

**Características del carrusel:**
- Video central: 100% tamaño, borde brillante con degradado rosa-magenta
- Videos laterales: 60% tamaño, oscurecidos (opacity-50), parcialmente visibles
- Reproducción automática del video central
- Pausa automática al salir del centro

**Props:**
```tsx
interface StyleCarouselProps {
  styles: VideoStyle[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onPlayVideo: (styleId: string) => void;
  playingVideo: string | null;
}
```

**Navegación:**
- Flechas grandes estilizadas a los lados (degradado rosa-magenta)
- Indicadores de página (dots) en la parte inferior
- Soporte para teclado (izquierda/derecha)

**Comportamiento del video:**
- El video central se reproduce automáticamente en loop cuando está visible
- Al navegar, el video anterior se pausa y el nuevo se reproduce
- Play/pause manual con click en el video

---

### PARTE 4: Modificar StyleSelector.tsx

**Nuevo layout principal:**

```tsx
<div className="min-h-screen relative overflow-hidden">
  {/* Video de fondo animado */}
  <video 
    src="https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=..."
    className="absolute inset-0 w-full h-full object-cover opacity-30"
    autoPlay 
    muted 
    loop 
    playsInline
  />
  
  {/* Overlay oscuro para legibilidad */}
  <div className="absolute inset-0 bg-background/80" />
  
  {/* Contenido principal */}
  <div className="relative z-10 min-h-screen flex">
    {/* Panel Izquierdo (30%) */}
    <StyleLeftPanel 
      activeStyle={videoStyles[activeIndex]}
      onSelectStyle={handleSelectStyle}
      onBack={onBack}
    />
    
    {/* Panel Derecho (70%) */}
    <div className="flex-1 flex flex-col justify-center px-8">
      <StyleCarousel
        styles={videoStyles}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        playingVideo={playingVideo}
        onPlayVideo={handlePlayVideo}
      />
    </div>
  </div>
</div>
```

**Nuevo estado para el índice activo:**
```typescript
const [activeIndex, setActiveIndex] = useState(0);

// El estilo activo es el que está en el centro del carrusel
const activeStyle = videoStyles[activeIndex];
```

---

### PARTE 5: Estructura del Carrusel con Embla

Configuración de Embla para mostrar múltiples slides:

```tsx
const [emblaRef, emblaApi] = useEmblaCarousel({
  align: 'center',
  loop: true,
  containScroll: 'trimSnaps',
  slidesToScroll: 1,
});

// Detectar slide activo
useEffect(() => {
  if (!emblaApi) return;
  
  const onSelect = () => {
    const index = emblaApi.selectedScrollSnap();
    onActiveIndexChange(index);
  };
  
  emblaApi.on('select', onSelect);
  return () => { emblaApi.off('select', onSelect); };
}, [emblaApi]);
```

**Estilos para los slides:**
```tsx
// Slide central (activo)
<div className={`
  transition-all duration-500 ease-out
  ${isActive 
    ? 'scale-100 opacity-100 z-10' 
    : 'scale-75 opacity-50 z-0 blur-[1px]'
  }
`}>
  <div className={`
    ${isActive 
      ? 'border-4 border-transparent bg-gradient-to-r from-primary to-accent p-[2px] rounded-2xl shadow-2xl shadow-primary/30' 
      : 'border border-border/30 rounded-2xl'
    }
  `}>
    <video ... />
  </div>
</div>
```

---

### PARTE 6: Datos de Estilos con Requisitos

Actualizar el array de estilos con información completa:

```typescript
const videoStyles: VideoStyle[] = [
  {
    id: 'style-1',
    name: 'Estilo Noticia',
    description: 'Estilo de noticias con presentador y titulares',
    video_url: '...',
    requirements: {
      items: [
        'Se requiere Fondo Verde',
        'Se requiere Avatar Horizontal'
      ],
      downloadUrl: 'https://drive.google.com/...',
      downloadLabel: 'Descargar Fondo'
    }
  },
  // ... resto de estilos
];
```

---

### PARTE 7: Indicadores de Página (Dots)

Componente para los puntos de navegación:

```tsx
const CarouselDots = ({ total, active, onSelect }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        className={`
          w-2.5 h-2.5 rounded-full transition-all duration-300
          ${i === active 
            ? 'w-8 bg-gradient-to-r from-primary to-accent' 
            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
          }
        `}
      />
    ))}
  </div>
);
```

---

### Detalles Técnicos Adicionales

**Video de Fondo:**
```tsx
<video
  src="https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=..."
  className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
  autoPlay
  muted
  loop
  playsInline
/>
```

**Responsive:**
- En móvil, el layout cambia a una columna
- Panel izquierdo se convierte en un header compacto
- Carrusel ocupa todo el ancho con un solo video visible

**Transiciones:**
- Fade suave al cambiar información del panel izquierdo (300ms)
- Scale y opacity para videos en el carrusel (500ms)
- Borde glow animado en video activo

---

### Resumen Visual

El nuevo diseño tendrá:
1. **Fondo animado** con video de partículas/red neuronal
2. **Panel izquierdo fijo** que muestra información del estilo activo dinámicamente
3. **Carrusel central** con video grande en el centro y videos más pequeños a los lados
4. **Navegación fluida** con flechas y dots
5. **Reproducción automática** del video activo
6. **Botón contextual** que cambia según el estilo visible

---

### Archivos Finales

| Archivo | Acción |
|---------|--------|
| `src/components/video/StyleSelector.tsx` | MODIFICAR - Layout principal con video de fondo |
| `src/components/video/StyleLeftPanel.tsx` | CREAR - Panel izquierdo con info dinámica |
| `src/components/video/StyleCarousel.tsx` | CREAR - Carrusel con Embla |
| `src/components/video/StyleGrid.tsx` | MANTENER (backup) - No eliminar por ahora |
| `src/components/video/StyleSelectorHeader.tsx` | MODIFICAR - Simplificar |
| `src/types/videoFlow.ts` | MODIFICAR - Agregar campos a VideoStyle |
