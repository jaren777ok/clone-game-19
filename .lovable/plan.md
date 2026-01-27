
## Plan: Previews de Enlaces en Chat de NeuroCopy GPT

### Objetivo
Cuando el usuario pega un enlace de TikTok, Instagram o cualquier página web en el chat, mostrar una tarjeta de preview visual junto con el texto del mensaje. La tarjeta debe ser clickeable y abrir el enlace en una nueva pestaña.

---

### Diseño Visual Propuesto

```text
┌─────────────────────────────────────────────────────────────────┐
│ Mensaje del Usuario con Enlaces                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "dame un guión de este video"                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎵 TikTok                                         ↗️    │   │
│  │ tiktok.com/@2pierofx0                                   │   │
│  │ /video/7583194841744477460                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📸 Instagram                                      ↗️    │   │
│  │ instagram.com/reel/DTYup44DGc2                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🌐 Web                                            ↗️    │   │
│  │ cnnespanol.cnn.com                                      │   │
│  │ /mundo/analisis-trump-siembra-division...               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Arquitectura de la Solución

```text
Mensaje del usuario
        ↓
┌─────────────────────────┐
│ extractLinksFromText()  │ ← Función que detecta URLs con regex
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ identifyLinkType()      │ ← Identifica si es TikTok, Instagram o Web
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ LinkPreviewCard         │ ← Componente visual para cada enlace
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ MessageBubble           │ ← Renderiza texto + previews
└─────────────────────────┘
```

---

### Cambios en Archivos

#### 1. Crear nuevo componente `LinkPreviewCard.tsx`

**Ubicación:** `src/components/video/LinkPreviewCard.tsx`

**Funcionalidad:**
- Recibe una URL como prop
- Detecta el tipo de enlace (TikTok, Instagram, Web genérico)
- Muestra un icono apropiado según el tipo
- Extrae información legible de la URL (usuario, ID del video, dominio)
- Es clickeable y abre la URL en nueva pestaña

**Estructura del componente:**

```tsx
interface LinkPreviewCardProps {
  url: string;
}

// Tipos de enlaces soportados
type LinkType = 'tiktok' | 'instagram' | 'youtube' | 'web';

// Función para detectar tipo de enlace
const identifyLinkType = (url: string): LinkType => {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'web';
};

// Función para extraer información de la URL
const extractLinkInfo = (url: string, type: LinkType) => {
  // Extraer dominio, usuario, path, etc.
};
```

**Diseño visual del componente:**
- Fondo con gradiente sutil y borde cyber
- Icono a la izquierda según plataforma (TikTok: nota musical, Instagram: cámara, Web: globo)
- Información de la URL truncada elegantemente
- Icono de "abrir en nueva pestaña" a la derecha
- Hover con efecto cyber-glow
- Colores de marca para cada plataforma

---

#### 2. Crear utilidad `linkUtils.ts`

**Ubicación:** `src/lib/linkUtils.ts`

**Funciones:**

```tsx
// Regex para detectar URLs en texto
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// Extraer todas las URLs de un texto
export const extractLinksFromText = (text: string): string[] => {
  const matches = text.match(URL_REGEX);
  return matches || [];
};

// Remover URLs del texto para mostrar solo el mensaje
export const removeLinksFromText = (text: string): string => {
  return text.replace(URL_REGEX, '').trim();
};

// Identificar tipo de plataforma
export const identifyPlatform = (url: string): 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'web' => {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  return 'web';
};

// Formatear URL para display
export const formatUrlForDisplay = (url: string) => {
  try {
    const urlObj = new URL(url);
    return {
      domain: urlObj.hostname.replace('www.', ''),
      path: urlObj.pathname.length > 30 
        ? urlObj.pathname.substring(0, 30) + '...' 
        : urlObj.pathname
    };
  } catch {
    return { domain: url, path: '' };
  }
};
```

---

#### 3. Modificar `MessageBubble` en `NeuroCopyGenerator.tsx`

**Cambios:**

1. Importar el nuevo componente y utilidades
2. Antes de renderizar el contenido, extraer enlaces
3. Separar texto de enlaces
4. Renderizar texto primero, luego las tarjetas de preview

```tsx
const MessageBubble = ({ message, displayedContent, isTyping }) => {
  const isUser = message.role === 'user';
  const content = displayedContent !== undefined ? displayedContent : message.content;
  
  // Solo procesar enlaces en mensajes de usuario
  const links = isUser ? extractLinksFromText(content) : [];
  const textWithoutLinks = isUser ? removeLinksFromText(content) : content;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar de IA */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent ...">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="max-w-[70%] space-y-3">
        {/* Texto del mensaje (sin enlaces) */}
        {textWithoutLinks && (
          <div className={`p-4 rounded-2xl ${isUser ? 'bg-primary/10 cyber-border' : 'bg-card/50'}`}>
            <p className="text-sm whitespace-pre-wrap">{textWithoutLinks}</p>
          </div>
        )}
        
        {/* Tarjetas de preview para cada enlace */}
        {links.map((link, index) => (
          <LinkPreviewCard key={index} url={link} />
        ))}
      </div>
    </div>
  );
};
```

---

### Diseño Visual de LinkPreviewCard

**Colores por plataforma:**
- TikTok: Borde con gradiente negro/rosa (#000000 a #ff0050)
- Instagram: Borde con gradiente púrpura/naranja (#833AB4 a #F77737)
- YouTube: Borde rojo (#FF0000)
- Web genérica: Borde del tema (cyber-border)

**Iconos por plataforma (usando Lucide):**
- TikTok: `Music` o crear icono SVG personalizado
- Instagram: `Camera` o `Instagram` (si existe)
- YouTube: `Youtube` (Lucide lo tiene)
- Web: `Globe`

**Estructura visual:**

```text
┌──────────────────────────────────────────────────────┐
│ [🎵]  TikTok                              [↗️]       │
│       tiktok.com/@usuario                            │
│       /video/1234567890...                           │
└──────────────────────────────────────────────────────┘
```

---

### Resumen de Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/linkUtils.ts` | CREAR | Funciones de detección y formateo de URLs |
| `src/components/video/LinkPreviewCard.tsx` | CREAR | Componente de tarjeta de preview |
| `src/components/video/NeuroCopyGenerator.tsx` | MODIFICAR | Integrar detección de enlaces y previews en MessageBubble |

---

### Comportamiento Esperado

1. **Usuario escribe:** "dame un guión de este video https://www.tiktok.com/@2pierofx0/video/7583..."

2. **Se muestra:**
   - Burbuja con texto: "dame un guión de este video"
   - Debajo: Tarjeta de TikTok con icono, dominio truncado y botón para abrir

3. **Al hacer clic en la tarjeta:** Abre el enlace en nueva pestaña

4. **Múltiples enlaces:** Se muestran múltiples tarjetas apiladas verticalmente

---

### Notas Técnicas

- Los previews se muestran **solo en mensajes del usuario** (no en respuestas de IA)
- La funcionalidad es **puramente estética/frontend** - no requiere llamadas a APIs
- Se mantiene toda la funcionalidad existente de envío a webhook
- El efecto typewriter **no aplica** a las tarjetas de preview (aparecen inmediatamente)
