

## Plan: Mejoras Visuales y Corrección del Efecto Typewriter

### Resumen de Cambios

Este plan implementa tres mejoras:

1. **Tarjetas de video 30% más grandes** en el carrusel de avatares
2. **Fondo de video con efectos** igual que la página de estilos de edición
3. **Botón "Cambiar Guion"** en la página de estilos (corregido)
4. **Corrección del efecto typewriter** - eliminar el flash del texto completo antes de escribir

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/video/AvatarCarousel.tsx` | Modificar | Aumentar tamaño de tarjetas 30% |
| `src/components/video/AvatarSelector.tsx` | Modificar | Actualizar URL del video de fondo |
| `src/components/video/NeuroCopyGenerator.tsx` | Modificar | Corregir el flash del typewriter |

---

### Cambio 1: Tarjetas de Video 30% Más Grandes

**Archivo:** `src/components/video/AvatarCarousel.tsx`

**Tamaños actuales → Nuevos tamaños (30% más grandes):**

```typescript
// ANTES (línea 138):
className="pl-4 basis-[260px] md:basis-[320px] lg:basis-[380px]"

// DESPUÉS (+30%):
className="pl-4 basis-[338px] md:basis-[416px] lg:basis-[494px]"
```

```typescript
// ANTES (línea 171):
<div className="relative bg-background rounded-xl overflow-hidden aspect-video w-[220px] md:w-[280px] lg:w-[340px]">

// DESPUÉS (+30%):
<div className="relative bg-background rounded-xl overflow-hidden aspect-video w-[286px] md:w-[364px] lg:w-[442px]">
```

**Cálculo:**
- 260px × 1.3 = 338px
- 320px × 1.3 = 416px
- 380px × 1.3 = 494px
- 220px × 1.3 = 286px
- 280px × 1.3 = 364px
- 340px × 1.3 = 442px

---

### Cambio 2: Video de Fondo con Efectos

**Archivo:** `src/components/video/AvatarSelector.tsx`

Actualizar la constante del video de fondo con la nueva URL proporcionada:

```typescript
// ANTES (línea 12):
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3NDg1MzI3MTAsImV4cCI6MTc4MDA2ODcxMH0.Rj3APPFjHJzePYFCRIu5b96E8wLf4pqYLHrk9E2ri6Q';

// DESPUÉS:
const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk3MTQwMTEsImV4cCI6MTkyNzM5NDAxMX0.STRpu_JjaJ_A-PxWt0FuSfcESIf0wW5XkhZ2m-qWWDs';
```

El archivo ya tiene los overlays de gradiente correctos (líneas 159-162), igual que StyleSelector.

---

### Cambio 3: Verificar Botón "Cambiar Guion" en StyleSelector

**Archivo:** `src/components/video/StyleSelectorHeader.tsx`

El botón ya dice "Cambiar Guion" (línea 20). No requiere cambios.

---

### Cambio 4: Corrección del Efecto Typewriter (Flash de Texto)

**Archivo:** `src/components/video/NeuroCopyGenerator.tsx`

**Problema identificado:**
Cuando llega la respuesta del webhook, el código hace:
1. `setMessages([...prev, aiMessage])` - Agrega mensaje con contenido completo
2. `typeMessage(aiMessageId, script)` - Inicia typewriter

Por un breve momento (~0.3s), el componente `MessageBubble` muestra `message.content` completo porque `displayedContent[messageId]` aún no existe.

**Solución:**
Inicializar `displayedContent` con cadena vacía ANTES de agregar el mensaje al estado:

```typescript
// ANTES (líneas 260-265):
setMessages(prev => [...prev, aiMessage]);
setLastGeneratedScript(script);

// Start typewriter effect for AI response (faster speed for long texts)
const typeSpeed = script.length > 500 ? 10 : 15;
typeMessage(aiMessageId, script, typeSpeed);

// DESPUÉS:
// Inicializar displayedContent como vacío ANTES de agregar el mensaje
// Esto previene que se muestre el texto completo por un instante
setDisplayedContent(prev => ({
  ...prev,
  [aiMessageId]: ''
}));

setMessages(prev => [...prev, aiMessage]);
setLastGeneratedScript(script);

// Start typewriter effect for AI response (faster speed for long texts)
const typeSpeed = script.length > 500 ? 10 : 15;
typeMessage(aiMessageId, script, typeSpeed);
```

Además, aplicar la misma lógica para mensajes de error (líneas 276-284):

```typescript
// ANTES:
setMessages(prev => [...prev, errorMessage]);
typeMessage(errorMessageId, errorMessage.content, 20);

// DESPUÉS:
setDisplayedContent(prev => ({
  ...prev,
  [errorMessageId]: ''
}));
setMessages(prev => [...prev, errorMessage]);
typeMessage(errorMessageId, errorMessage.content, 20);
```

---

### Resultado Esperado

1. **Tarjetas de avatar 30% más grandes** - Mejor visibilidad en el carrusel
2. **Video de fondo actualizado** - Usa el token más reciente que expira en 2031
3. **Efectos visuales** - Mantiene los mismos gradientes y overlays que StyleSelector
4. **Sin flash de texto** - El mensaje de IA se muestra gradualmente desde el principio sin mostrar el texto completo primero
5. **Audio sincronizado** - El sonido de escritura sigue funcionando correctamente

---

### Notas Técnicas

- Los tamaños de las tarjetas se redondean a números enteros para evitar sub-pixels
- El video de fondo ya tiene `opacity-20` configurado correctamente
- El fix del typewriter es una inicialización del estado antes del render
- No hay cambios en la lógica del audio de escritura

