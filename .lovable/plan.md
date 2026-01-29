
## Plan: Rediseño del Personalizador de Subtítulos

### Resumen de Cambios

Este plan implementa:

1. **Cambiar botón "Atrás" a "Cambiar voz"** con estilo outline sin color anaranjado
2. **Nuevo layout de dos paneles**: 35% opciones (izquierda) + 65% vista previa con video (derecha)
3. **Video de ejemplo en bucle** mostrando subtítulos en tiempo real
4. **Chips de configuración actual** debajo del video
5. **Botón "Usar este Diseño"** con gradiente rosa-magenta debajo del video
6. **Video de fondo animado** igual que las otras páginas

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/video/SubtitleCustomizer.tsx` | Reescribir | Nuevo layout 2 paneles con video de fondo |

---

### Estructura Visual del Nuevo Diseño

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [Video Background: fondonormal.mp4 - opacity 20%]                              │
│  [Gradient overlays for readability]                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────┬──────────────────────────────────────────────┐│
│  │  PANEL IZQUIERDO (35%)       │  PANEL DERECHO (65%)                        ││
│  │                              │                                              ││
│  │  [← Cambiar voz]             │  ┌──────────────────────────────────────────┐││
│  │                              │  │                                          │││
│  │  ┌────────────────────────┐  │  │   VIDEO DE EJEMPLO                       │││
│  │  │ ✨ Personalizar        │  │  │   (subtítulos dinámicos en tiempo real)  │││
│  │  │    Subtítulos          │  │  │                                          │││
│  │  │ (icono flotante)       │  │  │   "La Mente Humana"                      │││
│  │  └────────────────────────┘  │  │   (con efectos aplicados)                │││
│  │                              │  │                                          │││
│  │  ─────────────────────────   │  │   Borde con glow rosa-magenta            │││
│  │                              │  └──────────────────────────────────────────┘││
│  │  Tipo de Fuente:             │                                              ││
│  │  [Montserrat ✓] [Roboto]     │  Configuración actual:                       ││
│  │  [Roboto Condensed] ...      │  [Montserrat] [color] [animate] [capitalize] ││
│  │                              │                                              ││
│  │  Efectos de Subtítulos:      │  ┌──────────────────────────────────────────┐││
│  │  [Normal ✓] [Fade] [Bounce]  │  │      Usar este Diseño                    │││
│  │  [Slide] [Highlight] ...     │  │   (botón gradient rosa-magenta)          │││
│  │                              │  └──────────────────────────────────────────┘││
│  │  Efectos de Colocación:      │                                              ││
│  │  [Animate ✓] [Align] [Static]│                                              ││
│  │                              │                                              ││
│  │  Transformación de Texto:    │                                              ││
│  │  [MAYÚSCULAS] [Capitalizado] │                                              ││
│  │  [minúsculas]                │                                              ││
│  │                              │                                              ││
│  │  Colores: (scroll si es      │                                              ││
│  │  necesario)                  │                                              ││
│  │  [Color de Fondo]            │                                              ││
│  │  [Color de Letra]            │                                              ││
│  └──────────────────────────────┴──────────────────────────────────────────────┘│
│                                                                                 │
│                    ● SISTEMA NEURAL ACTIVO ●                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Cambio 1: Botón "Cambiar voz" con Estilo Correcto

El botón actual usa `variant="ghost"` y dice "Atrás". Se cambiará a:

```typescript
// ANTES (líneas 507-514):
<Button
  variant="ghost"
  onClick={onBack}
  className="text-muted-foreground hover:text-foreground"
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Atrás
</Button>

// DESPUÉS:
<Button
  variant="outline"
  onClick={onBack}
  className="cyber-border hover:cyber-glow hover:bg-primary/10"
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Cambiar voz
</Button>
```

---

### Cambio 2: Video de Fondo Animado

Agregar el mismo video de fondo que usa StyleSelector y AvatarSelector:

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

### Cambio 3: Video de Ejemplo para Vista Previa

Usar el video proporcionado para mostrar los subtítulos en tiempo real:

```typescript
const PREVIEW_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/video%20de%20prueba%20subtitulos.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy92aWRlbyBkZSBwcnVlYmEgc3VidGl0dWxvcy5tcDQiLCJpYXQiOjE3Njk3MjA1NjEsImV4cCI6MTkyNzQwMDU2MX0.bsgwHIxC3SNEOg4ney65wtOMvTn7zbXL56ofK-VTsM0';

// Contenedor del video con borde glow
<div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_40px_rgba(255,20,147,0.2)]">
  <video
    src={PREVIEW_VIDEO_URL}
    className="w-full aspect-video object-cover"
    autoPlay
    muted
    loop
    playsInline
  />
  {/* Overlay para subtítulos */}
  <div className="absolute inset-0 flex items-end justify-center pb-8">
    <div className="text-center">
      {renderWordByWord()}
    </div>
  </div>
</div>
```

El video se reproduce en bucle sin controles de pausa/sonido.

---

### Cambio 4: Nuevo Layout de Dos Paneles

**Estructura principal:**

```typescript
<div className="min-h-screen bg-background relative overflow-hidden">
  {/* Video de fondo */}
  <video ... />
  <div className="absolute inset-0 bg-background/50" />
  
  {/* Gradient overlays decorativos */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
  
  {/* Contenido Principal */}
  <div className="relative z-10 min-h-screen flex">
    
    {/* Panel Izquierdo (35%) - Opciones */}
    <div className="w-[35%] min-w-[380px] max-w-[480px] border-r border-border/30 p-6 overflow-y-auto bg-card/20 backdrop-blur-sm">
      {/* Botón Cambiar voz */}
      <Button variant="outline" onClick={onBack} className="cyber-border hover:cyber-glow hover:bg-primary/10 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Cambiar voz
      </Button>
      
      {/* Header con icono flotante */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center cyber-glow mb-4 animate-float">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-center">
          Personalizar <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Subtítulos</span>
        </h1>
      </div>
      
      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />
      
      {/* Secciones de opciones (scroll interno) */}
      <div className="space-y-5">
        {/* Tipo de Fuente */}
        {/* Efectos de Subtítulos */}
        {/* Efectos de Colocación */}
        {/* Transformación de Texto */}
        {/* Colores */}
      </div>
    </div>
    
    {/* Panel Derecho (65%) - Vista Previa */}
    <div className="flex-1 flex flex-col justify-center items-center p-8">
      {/* Video de ejemplo con subtítulos */}
      <div className="w-full max-w-3xl">
        <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_40px_rgba(255,20,147,0.2)]">
          <video src={PREVIEW_VIDEO_URL} autoPlay muted loop playsInline className="w-full aspect-video" />
          <div className="absolute inset-0 flex items-end justify-center pb-8">
            {renderWordByWord()}
          </div>
        </div>
        
        {/* Chips de configuración */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Configuración actual:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{customization.fontFamily}</Badge>
            <Badge variant="secondary">{customization.subtitleEffect}</Badge>
            <Badge variant="secondary">{customization.placementEffect}</Badge>
            <Badge variant="secondary">{customization.textTransform}</Badge>
          </div>
        </div>
        
        {/* Botón Usar este Diseño */}
        <Button
          onClick={handleContinue}
          className="w-full mt-8 h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg font-semibold cyber-glow"
        >
          Usar este Diseño
        </Button>
      </div>
    </div>
  </div>
  
  {/* Indicador SISTEMA NEURAL ACTIVO */}
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
    <div className="flex items-center gap-2 text-primary animate-pulse">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-sm font-medium tracking-wider">SISTEMA NEURAL ACTIVO</span>
      <div className="w-2 h-2 rounded-full bg-primary" />
    </div>
  </div>
</div>
```

---

### Cambio 5: Opciones Compactas en Panel Izquierdo

Las tarjetas de opciones se harán más compactas para caber en el panel izquierdo con scroll:

```typescript
{/* Ejemplo de sección de fuentes compacta */}
<div className="space-y-3">
  <div className="flex items-center gap-2">
    <Type className="w-4 h-4 text-primary" />
    <h3 className="text-sm font-semibold">Tipo de Fuente</h3>
  </div>
  <div className="grid grid-cols-2 gap-2">
    {FONTS.map((font) => (
      <button
        key={font.name}
        onClick={() => setCustomization(...)}
        className={`p-2 rounded-lg border text-left text-xs transition-all ${
          customization.fontFamily === font.name
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border/50 hover:border-primary/50 bg-card/30'
        }`}
      >
        <div className={`${font.class} font-medium`}>
          {font.preview}
        </div>
      </button>
    ))}
  </div>
</div>
```

---

### Cambio 6: Colores Más Compactos

Las paletas de colores se organizarán de forma más compacta:

```typescript
{/* Colores en grid más pequeño */}
<div className="grid grid-cols-10 gap-1.5">
  {COLOR_PALETTE.map((color) => (
    <button
      key={color}
      onClick={() => ...}
      className={`w-6 h-6 rounded border transition-all ${
        selectedColor === color
          ? 'border-primary scale-110 ring-2 ring-primary/50'
          : 'border-border/30 hover:border-primary/50'
      }`}
      style={{ backgroundColor: color }}
    />
  ))}
</div>
```

---

### Funcionalidad Preservada

La lógica existente se mantiene intacta:

1. **Animaciones de subtítulos** - `renderWordByWord()` sin cambios
2. **Efectos CSS** - Todas las `@keyframes` se mantienen
3. **Estados de personalización** - `customization` state sin cambios
4. **Auto-selección de efectos** - Lógica de `useEffect` para highlight/karaoke
5. **Cálculo de fontWeight y fixedSize** - `getFontWeight()` y `getFixedSize()` sin cambios
6. **Sanitización de backgroundColor** - `sanitizeBackgroundColor()` sin cambios
7. **handleContinue** - Función de envío sin cambios

---

### Resultado Esperado

1. **Botón "Cambiar voz"** con estilo outline rosa (sin naranja)
2. **Layout de dos paneles** coherente con otras páginas del flujo
3. **Video de fondo animado** con efectos de gradiente
4. **Video de ejemplo** mostrando subtítulos en tiempo real sobre contenido real
5. **Borde brillante rosa-magenta** alrededor del video de preview
6. **Chips de configuración** mostrando selecciones actuales
7. **Indicador "SISTEMA NEURAL ACTIVO"** en la parte inferior
8. **Scroll suave** en panel izquierdo si hay muchas opciones
9. **Toda la funcionalidad existente** preservada sin cambios

