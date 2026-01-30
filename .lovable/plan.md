
## Plan: Rediseño del Generador Final con Layout de Dos Paneles

### Resumen de Cambios

Este plan implementa:

1. **Cambiar botón "Volver" a "Atrás"** que navega al paso de subtítulos (`subtitle-customization`)
2. **Nuevo layout de dos paneles**: 35% resumen de configuración con iconos (izquierda) + 65% editor de script (derecha)
3. **Video de fondo animado** igual que las otras páginas del flujo
4. **Resumen visual con iconos** para cada elemento de configuración seleccionado
5. **Indicador "SISTEMA NEURAL ACTIVO"** en la parte inferior

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/video/VideoGeneratorHeader.tsx` | Modificar | Cambiar texto "Volver" a "Atrás" y navegar a subtítulos |
| `src/pages/VideoGeneratorFinal.tsx` | Reescribir | Nuevo layout con video de fondo y paneles |

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
│  │  [← Atrás]                   │  ┌──────────────────────────────────────────┐││
│  │                              │  │  Guión a Usar                 [Guardar]  │││
│  │  ┌────────────────────────┐  │  │  ┌──────────────────────────────────────┐│││
│  │  │ 🎬 CloneGame           │  │  │  │                                      ││││
│  │  │    Generador IA        │  │  │  │  [Textarea editable con el script]  ││││
│  │  │    (icono flotante)    │  │  │  │                                      ││││
│  │  └────────────────────────┘  │  │  │  ...                                 ││││
│  │                              │  │  │                                      ││││
│  │  ─────────────────────────   │  │  └──────────────────────────────────────┘│││
│  │                              │  │                              1138/955    │││
│  │  📊 Resumen de Configuración │  └──────────────────────────────────────────┘││
│  │                              │                                              ││
│  │  ┌────────────────────────┐  │  ┌──────────────────────────────────────────┐││
│  │  │ 🔑 API Key             │  │  │ ⚡ Respuesta inmediata mejorada         │││
│  │  │    HG N8N PROYECTO     │  │  │    Tu solicitud se procesa al instante  │││
│  │  └────────────────────────┘  │  └──────────────────────────────────────────┘││
│  │                              │                                              ││
│  │  ┌────────────────────────┐  │  ┌──────────────────────────────────────────┐││
│  │  │ 👤 Avatar              │  │  │ ⏰ Monitoreo inteligente continuo       │││
│  │  │    Jurgen Klaric       │  │  │    Verificación automática cada 3 min   │││
│  │  └────────────────────────┘  │  └──────────────────────────────────────────┘││
│  │                              │                                              ││
│  │  ┌────────────────────────┐  │  ┌──────────────────────────────────────────┐││
│  │  │ 🎤 Voz                 │  │  │          GENERAR VIDEO                  │││
│  │  │    Jurgen Pro 2.1      │  │  │    (botón gradient rosa-magenta)        │││
│  │  └────────────────────────┘  │  └──────────────────────────────────────────┘││
│  │                              │                                              ││
│  │  ┌────────────────────────┐  │                                              ││
│  │  │ 🎨 Estilo              │  │                                              ││
│  │  │    Estilo Noticiero    │  │                                              ││
│  │  └────────────────────────┘  │                                              ││
│  │                              │                                              ││
│  │  ┌────────────────────────┐  │                                              ││
│  │  │ 📝 Subtítulos          │  │                                              ││
│  │  │    Montserrat, Animate │  │                                              ││
│  │  └────────────────────────┘  │                                              ││
│  │                              │                                              ││
│  │  ─────────────────────────   │                                              ││
│  │                              │                                              ││
│  │  ● Configuración Completa ● │                                              ││
│  │                              │                                              ││
│  └──────────────────────────────┴──────────────────────────────────────────────┘│
│                                                                                 │
│                    ● SISTEMA NEURAL ACTIVO ●                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Cambio 1: Botón "Atrás" que navega a Subtítulos

El `VideoGeneratorHeader.tsx` se modificará para:
- Cambiar texto de "Volver" a "Atrás"
- Navegar al paso de personalización de subtítulos en lugar de `/crear-video`

**Antes:**
```typescript
<Button onClick={() => navigate('/crear-video')}>
  <ArrowLeft /> Volver
</Button>
```

**Después:**
```typescript
// El header recibirá un callback onBack
<Button variant="outline" onClick={onBack} className="cyber-border hover:cyber-glow">
  <ArrowLeft /> Atrás
</Button>
```

En `VideoGeneratorFinal.tsx`, el `handleBack` se actualizará:
```typescript
const handleBack = () => {
  goToStep('subtitle-customization');
  navigate('/crear-video');
};
```

---

### Cambio 2: Video de Fondo Animado

Igual que StyleSelector y SubtitleCustomizer:

```typescript
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=...';

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

### Cambio 3: Nuevo Layout de Dos Paneles

**Estructura principal en VideoGeneratorFinal.tsx:**

```typescript
<div className="min-h-screen bg-background relative overflow-hidden">
  {/* Video de fondo */}
  <video ... />
  <div className="absolute inset-0 bg-background/50" />
  
  {/* Gradient overlays decorativos */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 ..." />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 ..." />
  
  {/* Contenido Principal */}
  <div className="relative z-10 min-h-screen flex">
    
    {/* Panel Izquierdo (35%) - Resumen Configuración */}
    <div className="w-[35%] min-w-[380px] max-w-[480px] border-r border-border/30 p-6 overflow-y-auto bg-card/20 backdrop-blur-sm">
      {/* Botón Atrás */}
      {/* Header con icono */}
      {/* Separador */}
      {/* Resumen de Configuración con Iconos */}
      {/* Indicador Configuración Completa */}
    </div>
    
    {/* Panel Derecho (65%) - Editor de Script */}
    <div className="flex-1 flex flex-col justify-center p-8">
      {/* Script Form (modificado para layout) */}
    </div>
  </div>
  
  {/* Indicador SISTEMA NEURAL ACTIVO */}
</div>
```

---

### Cambio 4: Panel Izquierdo - Resumen con Iconos

Cada elemento de configuración tendrá su propia tarjeta con icono:

```typescript
{/* Resumen de Configuración */}
<div className="space-y-4">
  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
    <Settings className="w-4 h-4" />
    Resumen de Configuración
  </h3>
  
  {/* API Key */}
  <div className="bg-card/40 rounded-lg p-4 border border-border/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
        <Key className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">API Key</p>
        <p className="font-medium truncate">{effectiveFlowState.selectedApiKey?.api_key_name}</p>
      </div>
    </div>
  </div>
  
  {/* Avatar */}
  <div className="bg-card/40 rounded-lg p-4 border border-border/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
        <User className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Avatar</p>
        <p className="font-medium truncate">{effectiveFlowState.selectedAvatar?.avatar_name}</p>
      </div>
    </div>
  </div>
  
  {/* Voz */}
  <div className="bg-card/40 rounded-lg p-4 border border-border/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
        <Mic className="w-5 h-5 text-green-400" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Voz</p>
        <p className="font-medium truncate">{effectiveFlowState.selectedVoice?.voice_name}</p>
      </div>
    </div>
  </div>
  
  {/* Estilo */}
  <div className="bg-card/40 rounded-lg p-4 border border-border/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
        <Palette className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Estilo</p>
        <p className="font-medium truncate">{effectiveFlowState.selectedStyle?.name}</p>
      </div>
    </div>
  </div>
  
  {/* Subtítulos */}
  <div className="bg-card/40 rounded-lg p-4 border border-border/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
        <Type className="w-5 h-5 text-orange-400" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Subtítulos</p>
        <p className="font-medium truncate">
          {effectiveFlowState.subtitleCustomization?.fontFamily || 'Por defecto'}
        </p>
      </div>
    </div>
  </div>
</div>

{/* Indicador de configuración completa */}
<div className="mt-6 text-center">
  <div className="flex items-center justify-center gap-2 text-green-400">
    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
    <span className="text-sm font-medium">Configuración Completa</span>
    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
  </div>
</div>
```

---

### Cambio 5: Panel Derecho - Editor de Script

El `ScriptForm` se integrará en el panel derecho, manteniendo toda su funcionalidad actual pero adaptado al nuevo layout:

```typescript
{/* Panel Derecho (65%) */}
<div className="flex-1 flex flex-col p-8 overflow-y-auto">
  <div className="max-w-3xl mx-auto w-full">
    {/* Recovery Notification si existe */}
    {state.showRecoveryOption && (
      <RecoveryNotification ... />
    )}
    
    {/* Header del Editor */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        CloneGame - Generador de Videos IA
      </h1>
      <p className="text-muted-foreground">
        Tu guión ha sido generado con NeuroCopy GPT. Puedes editarlo si deseas.
      </p>
    </div>
    
    {/* Script Form */}
    <ScriptForm ... />
  </div>
</div>
```

---

### Cambio 6: Indicador SISTEMA NEURAL ACTIVO

Al final de la página:

```typescript
{/* Fixed Neural System Indicator */}
<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
  <div className="flex items-center gap-2 text-primary animate-pulse">
    <div className="w-2 h-2 rounded-full bg-primary" />
    <span className="text-sm font-medium tracking-wider">SISTEMA NEURAL ACTIVO</span>
    <div className="w-2 h-2 rounded-full bg-primary" />
  </div>
</div>
```

---

### Funcionalidad Preservada

Toda la lógica existente se mantiene intacta:

1. **Inicialización del script** - `isScriptInitialized` y carga desde BD
2. **Manejo de generación** - `useVideoGenerator` hook sin cambios
3. **Estados de procesamiento** - `VideoProcessingState` y `VideoResult` sin cambios
4. **Guardado de script** - Función `handleSaveScript` en ScriptForm
5. **Modal de carga manual** - Para estilos manuales (style-5, style-6)
6. **Limpieza en beforeunload** - Para evitar datos huérfanos

---

### Resultado Esperado

1. **Botón "Atrás"** que navega al paso de subtítulos (último paso antes del generador)
2. **Video de fondo animado** coherente con el resto del flujo
3. **Panel izquierdo** con resumen visual de la configuración usando iconos coloridos
4. **Panel derecho** con el editor de script completo
5. **Indicador "SISTEMA NEURAL ACTIVO"** en la parte inferior
6. **Indicador de configuración completa** con puntos verdes animados
7. **Diseño premium** coherente con StyleSelector, AvatarSelector y SubtitleCustomizer
8. **Toda la funcionalidad existente** preservada sin cambios
