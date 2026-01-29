

## Plan: Rediseño del Administrador de Claves API y Mejoras de UX

### Resumen de Cambios

Este plan implementa:

1. **Rediseño completo del Administrador de Claves API** con video de fondo y tarjetas premium
2. **Simplificación de navegación en SavedVideos** - solo botón "Volver al Dashboard"
3. **Eliminar botón "Videos Guardados" de VideoGeneratorHeader**
4. **Corregir problema de refresh automático** cuando el usuario cambia de pestaña del navegador

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/video/HeyGenApiKeyManager.tsx` | Reescribir | Video de fondo, nuevo layout premium |
| `src/components/video/ApiKeyList.tsx` | Reescribir | Tarjetas elevadas con sombra etérea |
| `src/components/video/ApiKeyCard.tsx` | Reescribir | Diseño premium con iconos de proyecto |
| `src/components/video/ApiKeyForm.tsx` | Reescribir | Modal/tarjeta con borde degradado |
| `src/pages/SavedVideos.tsx` | Modificar | Solo botón "Volver al Dashboard" |
| `src/components/video/VideoGeneratorHeader.tsx` | Modificar | Eliminar botón "Videos Guardados" |

---

### Cambio 1: HeyGenApiKeyManager - Video de Fondo y Layout Premium

**Estructura visual (basada en imágenes de referencia):**

```text
┌───────────────────────────────────────────────────────────────────────┐
│  [Video Background: fondonormal.mp4 - opacity 20%]                    │
│  [Dark overlay for readability]                                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ← Volver al Dashboard                                                │
│                                                                       │
│              "Gestión de Claves API"                                  │
│     (Título grande con degradado rosa-magenta)                        │
│                                                                       │
│  "Administra tus claves API de HeyGen o agrega nuevas para           │
│   potenciar tu creación."                                             │
│                                                                       │
│                                                                       │
│  Tus Conexiones API Activas:                                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  [⚡] HG NBN PROYECTO                    [Continuar con esta]  🗑  │  │
│  │       Creada el 23/8/2025                   (botón degradado)      │
│  └─────────────────────────────────────────────────────────────────┘  │
│      ^ Tarjeta con borde glow rosa-magenta y sombra etérea            │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  [💎] Proyecto Beta                      [Continuar con esta]  🗑  │  │
│  │       Creada el 23/8/2025                                          │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  [+]  Agregar nueva clave API                                   │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│      ^ Tarjeta con borde punteado - hover ilumina todo                │
│                                                                       │
│                    ● SISTEMA NEURAL ACTIVO ●                          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Código clave para el fondo:**
```typescript
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk3MTYyNzQsImV4cCI6MTkyNzM5NjI3NH0.WY9BkeYyf8U0doTqKMBmXo0X_2pecKTwDy3tMN7VKHY';

// Video de fondo
<video
  src={BACKGROUND_VIDEO_URL}
  className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
  autoPlay
  muted
  loop
  playsInline
/>
<div className="absolute inset-0 bg-background/50" />
```

---

### Cambio 2: ApiKeyCard - Tarjetas con Sombra Etérea

**Estilos de la tarjeta:**
```typescript
// Tarjeta con borde glow y sombra rosa-magenta
<div className="
  relative rounded-xl 
  bg-card/80 backdrop-blur-sm 
  border border-primary/30
  shadow-[0_0_30px_rgba(255,20,147,0.15)]
  hover:shadow-[0_0_40px_rgba(255,20,147,0.25)]
  hover:border-primary/50
  transition-all duration-300
">
```

**Iconos de proyecto variados:**
```typescript
// Rotación de iconos para cada clave
const projectIcons = [Shield, Zap, Star, Cpu, Key];
const IconComponent = projectIcons[index % projectIcons.length];
```

---

### Cambio 3: Tarjeta "Agregar Nueva Clave API"

**Estilo de borde punteado y efecto hover:**
```typescript
<button
  onClick={onShowAddForm}
  className="
    w-full p-6 rounded-xl
    border-2 border-dashed border-muted-foreground/30
    hover:border-primary/50
    hover:shadow-[0_0_30px_rgba(255,20,147,0.2)]
    hover:bg-primary/5
    transition-all duration-300
    flex items-center justify-center gap-4
  "
>
  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
    <Plus className="w-6 h-6 text-background" />
  </div>
  <span className="text-lg font-semibold text-foreground">
    Agregar nueva clave API
  </span>
</button>
```

---

### Cambio 4: ApiKeyForm - Formulario con Borde Degradado

**Contenedor del formulario:**
```typescript
// Contenedor con borde glow degradado
<div className="
  relative rounded-2xl 
  bg-card/90 backdrop-blur-md
  p-[1px] 
  bg-gradient-to-br from-primary/50 via-accent/30 to-primary/50
  shadow-[0_0_40px_rgba(255,20,147,0.2)]
">
  <div className="bg-card rounded-2xl p-6 sm:p-8">
    {/* Form content */}
  </div>
</div>
```

**Campos de entrada con focus glow:**
```typescript
<Input
  className="
    bg-background/50 border-muted-foreground/20
    focus:border-primary/50 focus:ring-primary/20
    focus:shadow-[0_0_15px_rgba(255,20,147,0.15)]
  "
/>
```

---

### Cambio 5: SavedVideos - Simplificar Navegación

**Eliminar ambos botones actuales y dejar solo uno:**

```typescript
// ANTES (líneas 174-191):
<div className="flex items-center justify-between mb-8">
  <Button onClick={() => navigate('/crear-video')}>
    Volver al Generador
  </Button>
  <Button onClick={() => navigate('/dashboard')}>
    Dashboard
  </Button>
</div>

// DESPUÉS:
<div className="flex items-center mb-8">
  <Button
    variant="outline"
    onClick={() => navigate('/dashboard')}
    className="cyber-border hover:cyber-glow"
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Volver al Dashboard
  </Button>
</div>
```

---

### Cambio 6: VideoGeneratorHeader - Eliminar Botón "Videos Guardados"

**Mantener solo el botón "Volver":**

```typescript
// ANTES (líneas 24-33):
<Button onClick={() => navigate('/videos-guardados')}>
  <Bookmark /> Videos Guardados
</Button>

// DESPUÉS:
// Eliminar completamente este botón
```

El header quedará solo con el botón "Volver" que regresa a `/crear-video`.

---

### Cambio 7: Corregir Problema de Refresh en SavedVideos

**Problema identificado:**
El `useEffect` en SavedVideos hace `fetchVideos()` cada vez que `user` cambia. Cuando el usuario cambia de pestaña y regresa, el navegador puede re-ejecutar efectos.

**Solución:**
1. Usar un flag para evitar re-fetch innecesario
2. Solo hacer fetch inicial, no en cada cambio de foco

```typescript
// ANTES:
useEffect(() => {
  fetchVideos();
}, [user]);

// DESPUÉS:
const [hasFetched, setHasFetched] = useState(false);

useEffect(() => {
  if (user && !hasFetched) {
    fetchVideos();
    setHasFetched(true);
  }
}, [user, hasFetched]);

// También agregar cleanup para evitar state updates en componente desmontado
const fetchVideos = async () => {
  if (!user || hasFetched) return;
  // ... resto del código
};
```

**Alternativa adicional:**
Usar `{ staleTime: Infinity }` si se migra a React Query, o simplemente mantener los datos en estado local sin refetch automático.

---

### Indicador "SISTEMA NEURAL ACTIVO"

Agregar el indicador al pie de la página del administrador de claves API:

```typescript
<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
  <div className="flex items-center gap-2 text-primary animate-pulse">
    <div className="w-2 h-2 rounded-full bg-primary" />
    <span className="text-sm font-medium tracking-wider">
      SISTEMA NEURAL ACTIVO
    </span>
    <div className="w-2 h-2 rounded-full bg-primary" />
  </div>
</div>
```

---

### Resultado Esperado

1. **Administrador de Claves API premium** con video de fondo animado y tarjetas con sombra etérea rosa-magenta
2. **Formulario elegante** con borde degradado brillante
3. **Botón "Agregar nueva clave"** con borde punteado y efecto hover que ilumina
4. **SavedVideos** con solo un botón "Volver al Dashboard" coherente
5. **Sin botón "Videos Guardados"** en el generador final
6. **Sin refresh automático** al cambiar de pestaña del navegador
7. **Indicador "SISTEMA NEURAL ACTIVO"** en el pie de página

