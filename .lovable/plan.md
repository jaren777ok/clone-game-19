

## Plan: Rediseño Avanzado del Selector de Avatares con Carrusel Horizontal

### Resumen de Cambios

Este plan implementa un rediseño completo del selector de avatares con las siguientes mejoras:

1. **Correcciones inmediatas:**
   - Cambiar paginación de 12 a 24 avatares
   - Cambiar texto del botón de "Cambiar clave API" a "Cambiar Estilo"
   - El botón ahora regresa a la página de estilos (no a API key)

2. **Rediseño visual con carrusel horizontal:**
   - Video de fondo animado (mismo de StyleSelector)
   - Carrusel horizontal estilo "galería envolvente"
   - Avatar central grande con aura/glow degradado
   - Avatares adyacentes más pequeños con opacidad reducida
   - Navegación con flechas elegantes
   - Barra de progreso/paginación dinámica

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/types/videoFlow.ts` | Modificar | Agregar `preview_video_url` al tipo Avatar |
| `supabase/functions/heygen-avatars/index.ts` | Modificar | Incluir `preview_video_url` en la respuesta |
| `src/components/video/AvatarSelector.tsx` | Reescribir | Nuevo diseño con carrusel horizontal y video de fondo |
| `src/components/video/AvatarCarousel.tsx` | Crear | Nuevo componente de carrusel basado en StyleCarousel |
| `src/components/video/AvatarLeftPanel.tsx` | Crear | Panel izquierdo con info del avatar activo |
| `src/components/video/LoadMoreButton.tsx` | Modificar | Actualizar texto para mostrar "24 avatares" |

---

### Cambios Detallados

#### 1. Actualizar Tipo Avatar (`src/types/videoFlow.ts`)

```typescript
export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
  preview_video_url?: string;  // NUEVO - URL del video de preview
}
```

#### 2. Actualizar Edge Function (`supabase/functions/heygen-avatars/index.ts`)

Incluir `preview_video_url` en el mapeo de avatares:

```typescript
allAvatars = heygenData.data?.avatars?.map((avatar: any) => ({
  avatar_id: avatar.avatar_id,
  avatar_name: avatar.avatar_name,
  preview_image_url: avatar.preview_image_url,
  preview_video_url: avatar.preview_video_url  // NUEVO
})) || []
```

#### 3. Rediseño de AvatarSelector (`src/components/video/AvatarSelector.tsx`)

**Estructura visual:**

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [Video Background: fondonormal.mp4 at 20% opacity]                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │   PANEL IZQUIERDO   │  │           CARRUSEL HORIZONTAL           │ │
│  │     (30% width)     │  │              (70% width)                │ │
│  │                     │  │                                         │ │
│  │  ← Cambiar Estilo   │  │    [◄]  [Prev]  [ACTIVO]  [Next]  [►]   │ │
│  │                     │  │                                         │ │
│  │  "Selecciona tu     │  │          Avatar grande central          │ │
│  │   Avatar de IA"     │  │          con aura rosa-magenta          │ │
│  │                     │  │                                         │ │
│  │  ─────────────────  │  │    Avatares laterales más pequeños      │ │
│  │                     │  │    con opacidad reducida (40%)          │ │
│  │  [Imagen Avatar]    │  │                                         │ │
│  │  Nombre: "Jurgen"   │  │                                         │ │
│  │                     │  │                                         │ │
│  │  [Elegir Avatar]    │  │    ● ● ● ● ● ● ● ●  (paginación)        │ │
│  │                     │  │                                         │ │
│  └─────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                       │
│  [Cargar más avatares - 24 a la vez]                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Cambios clave:**
- Video de fondo: `fondonormal.mp4` al 20% de opacidad
- Layout de dos paneles (30% / 70%)
- Carrusel con Embla (mismo de StyleCarousel)
- Avatar activo con escala 100%, aura gradient
- Avatares adyacentes con escala 75%, opacidad 40%, blur sutil
- Navegación con flechas estilo cyber
- Indicadores de progreso en forma de puntos

#### 4. Nuevo Componente: AvatarCarousel (`src/components/video/AvatarCarousel.tsx`)

Basado en StyleCarousel pero adaptado para avatares:

- Grid de 3 columnas: [Flecha] [Carrusel] [Flecha]
- Cada item muestra imagen del avatar
- Video de preview se reproduce al estar activo (si disponible)
- Nombre del avatar encima del item
- Transiciones suaves con scale/opacity/blur

#### 5. Nuevo Componente: AvatarLeftPanel (`src/components/video/AvatarLeftPanel.tsx`)

Panel informativo con:
- Botón "Cambiar Estilo" (regresa a StyleSelector)
- Título "Selecciona tu Avatar de IA"
- Subtítulo con contador de avatares
- Vista previa grande del avatar activo
- Nombre del avatar prominente
- Botón "Elegir Avatar" con gradient rosa-magenta

#### 6. Actualizar LoadMoreButton

Cambiar texto de "12 avatares" a "24 avatares"

---

### Cambios en Paginación

En `AvatarSelector.tsx`:
```typescript
const AVATARS_PER_PAGE = 24;  // Antes: 12
```

En `LoadMoreButton.tsx`:
```typescript
<p className="text-xs text-muted-foreground">
  Haz clic para cargar los siguientes 24 avatares
</p>
```

---

### Flujo de Navegación Corregido

**Botón "Cambiar Estilo":**
- El `onBack` en AvatarSelector ahora lleva a `goToStep('style')` en lugar de `goToStep('api-key')`
- Esto ya está correctamente configurado en `VideoCreationFlow.tsx` (línea 67), solo falta cambiar el texto del botón

---

### Detalles Técnicos

#### Constante del Video de Fondo
```typescript
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=...';
```

#### Estilos CSS del Avatar Activo
```typescript
// Avatar activo
className="scale-100 opacity-100 z-10"
// Border con aura
className="p-[3px] bg-gradient-to-br from-primary via-accent to-primary shadow-2xl shadow-primary/30"

// Avatares adyacentes
className="scale-75 opacity-40 z-0 blur-[1px]"
```

#### Responsive Design
- Desktop: Layout de 2 columnas (30% / 70%)
- Mobile: Layout de 1 columna, carrusel apilado debajo del panel
- Tamaño de avatares adaptativos

---

### Funcionalidad Mantenida

Se mantiene toda la funcionalidad actual:
- Carga lazy de avatares por páginas
- Selección previa recordada (PreviousSelectionBanner)
- Indicador "Usando: [nombre API key]"
- Botón "Cargar más" con estados de loading
- Estados de selección con checkmark
- Fallback a placeholder en caso de error de imagen

---

### Resultado Esperado

1. El botón superior izquierdo dice "Cambiar Estilo" y regresa a la página de estilos
2. Se cargan 24 avatares inicialmente (antes 12)
3. El diseño muestra un carrusel horizontal envolvente
4. El avatar central es prominente con aura/glow
5. Los avatares laterales están reducidos y con opacidad
6. Video de fondo crea atmósfera futurista
7. Navegación fluida con flechas y puntos indicadores

