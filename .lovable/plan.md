
## Plan: Rediseño de la Página de Videos Guardados

### Resumen del Cambio

Rediseñar completamente la página de "Videos Guardados" con:
1. **Fondo de video animado** (fondonormal.mp4 al 20% de opacidad como en StyleSelector)
2. **Tarjetas elegantes** con reproductor de video integrado
3. **Sección de guion expandible/colapsable** con opción de copiar
4. **Botón de publicar en redes** (mantenido)
5. **Eliminar** la sección de URL y botón de copiar enlace
6. **Diseño visual cyber/futurista** consistente con el resto de la app

---

### Diseño Visual de la Nueva Tarjeta

```text
+--------------------------------------------------+
|  [Video Generado - Título]              [🗑️]    |
|  📅 2 sept 2025, 21:15                           |
+--------------------------------------------------+
|                                                  |
|  +------------------------------------------+    |
|  |                                          |    |
|  |           VIDEO PLAYER                   |    |
|  |      (con controles nativos)             |    |
|  |   play/pause, seek, volumen, fullscreen  |    |
|  |                                          |    |
|  +------------------------------------------+    |
|                                                  |
|  📄 Guion                         [Expandir ▼]  |
|  ┌──────────────────────────────────────────┐   |
|  │ ¿Eres empresario y piensas que la IA...  │   |
|  │ (texto truncado cuando colapsado)        │   |
|  └──────────────────────────────────────────┘   |
|                                                  |
|  [========= Publicar en Redes =========]        |
|                                                  |
+--------------------------------------------------+
```

**Cuando el guion está expandido:**
```text
|  📄 Guion                         [Colapsar ▲]  |
|  ┌──────────────────────────────────────────┐   |
|  │ ¿Eres empresario y piensas que la        │   |
|  │ inteligencia artificial es solo una      │   |
|  │ promesa? El 85% de los empresarios en    │   |
|  │ Latinoamérica aún no han implementado    │   |
|  │ IA en sus negocios...                    │   |
|  │                                          │   |
|  │                              [📋 Copiar] │   |
|  └──────────────────────────────────────────┘   |
```

---

### Cambios a Implementar

#### 1. Modificar `SavedVideos.tsx` - Fondo de Video Animado

Reemplazar el fondo estático por el video animado como en StyleSelector:

```tsx
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=...';

// Dentro del componente:
<div className="min-h-screen bg-background relative overflow-hidden">
  {/* Animated Video Background */}
  <video
    src={BACKGROUND_VIDEO_URL}
    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
    autoPlay
    muted
    loop
    playsInline
  />
  
  {/* Dark Overlay for readability */}
  <div className="absolute inset-0 bg-background/50" />
  
  {/* Content */}
  <div className="relative z-10 ...">
```

---

#### 2. Rediseñar `VideoCard.tsx` Completamente

**Eliminar:**
- Sección de URL del video
- Botón de copiar enlace
- Botón de abrir en nueva pestaña

**Añadir:**
- Reproductor de video nativo con controles
- Sección de guion expandible/colapsable usando Collapsible de Radix
- Botón de copiar guion (solo visible cuando expandido)

**Estructura del nuevo componente:**

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy, Trash2, Calendar, FileText, Video, Share2, CheckCircle } from 'lucide-react';

const VideoCard = ({ id, title, script, videoUrl, createdAt, onDelete }: VideoCardProps) => {
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  
  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast({ title: "¡Guion copiado!", ... });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm cyber-border rounded-xl hover:cyber-glow transition-all duration-300 group overflow-hidden">
      {/* Header: título + fecha + delete */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-4">
            <div className="flex items-center mb-1">
              <Video className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {getDisplayTitle()}
              </h3>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(createdAt)}
            </div>
          </div>
          <Button variant="ghost" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t border-border/30 mx-5" />
      
      {/* Video Player */}
      <div className="p-5">
        <div className="rounded-lg overflow-hidden cyber-border bg-black/50">
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video"
            preload="metadata"
            poster="" // Thumbnail auto-generated
          />
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t border-border/30 mx-5" />
      
      {/* Script Section - Collapsible */}
      <div className="p-5">
        <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Guion</span>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isScriptExpanded ? (
                  <>
                    <span className="text-xs mr-1">Colapsar</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span className="text-xs mr-1">Expandir</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          {/* Preview cuando está colapsado */}
          {!isScriptExpanded && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {truncateScript(script, 100)}
            </p>
          )}
          
          {/* Contenido completo cuando está expandido */}
          <CollapsibleContent>
            <div className="bg-muted/30 rounded-lg p-4 cyber-border">
              <p className="text-foreground text-sm whitespace-pre-wrap mb-4">
                {script}
              </p>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyScript}
                  className="cyber-border hover:cyber-glow"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Guion
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Divider */}
      <div className="border-t border-border/30 mx-5" />
      
      {/* Publicar en Redes */}
      <div className="p-5">
        <Button
          onClick={() => setShowSocialModal(true)}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Publicar en Redes
        </Button>
      </div>
    </div>
  );
};
```

---

#### 3. Actualizar Tips Section en `SavedVideos.tsx`

Cambiar los consejos para reflejar las nuevas funcionalidades:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-sm">
  <div className="flex items-start">
    <span className="text-primary mr-2">•</span>
    Los títulos se generan automáticamente con IA basándose en tu guion
  </div>
  <div className="flex items-start">
    <span className="text-primary mr-2">•</span>
    Usa los filtros de fecha para encontrar videos por período de creación
  </div>
  <div className="flex items-start">
    <span className="text-primary mr-2">•</span>
    Expande el guion para ver el contenido completo y copiarlo
  </div>
  <div className="flex items-start">
    <span className="text-primary mr-2">•</span>
    Publica directamente en tus redes sociales favoritas
  </div>
</div>
```

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/SavedVideos.tsx` | Añadir fondo de video animado + overlay + actualizar tips |
| `src/components/video/VideoCard.tsx` | Rediseño completo con reproductor + guion colapsable |

---

### Detalles Técnicos

**1. Video Player HTML5 Nativo:**
- Usamos `<video controls>` para controles nativos del navegador
- Incluye: play/pause, seek, volumen, pantalla completa
- `preload="metadata"` para cargar solo los metadatos inicialmente
- `aspect-video` de Tailwind para mantener proporción 16:9

**2. Collapsible de Radix UI:**
- Importado de `@/components/ui/collapsible`
- Animación suave de acordeón
- Estado controlado con `isScriptExpanded`

**3. Estilos Cyber/Futuristas:**
- `bg-card/80 backdrop-blur-sm` para tarjetas semi-transparentes
- `cyber-border` y `hover:cyber-glow` para efectos
- Gradientes de primary a accent para botones principales
- Video de fondo al 20% de opacidad

---

### Resultado Visual Esperado

La página tendrá:
1. Fondo animado sutil con el video de rayos/futurista
2. Tarjetas elegantes semi-transparentes con backdrop blur
3. Reproductor de video funcional con todos los controles
4. Sección de guion que se expande/colapsa suavemente
5. Botón de publicar con gradiente rosa-magenta
6. Efectos hover tipo "cyber glow"
7. Diseño consistente con el resto de la aplicación
