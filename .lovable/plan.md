

## Plan: Correcciones de UI en NeuroCopyGenerator y Sistema de Colores de Botones

### Objetivo
Resolver tres problemas de diseño:
1. Título "NeuroCopy GPT" en una sola línea
2. Área de chat con scroll fijo (sin expandir la página)
3. Eliminar el color naranja sólido de los botones y usar degradado rosa-magenta

---

### Problema 1: Título "NeuroCopy GPT" en una sola línea

**Causa del problema:**
El span con clase `text-gradient-safe` tiene `display: block` en el CSS, lo que fuerza al texto "GPT" a ir a una nueva línea.

**Solución:**
Modificar el título para que use `inline` en lugar de `block` para el gradiente, o quitar la clase `text-gradient-safe` y aplicar el gradiente directamente con estilos inline.

**Archivo:** `src/components/video/NeuroCopyGenerator.tsx`

```tsx
// ANTES (línea 294-296)
<h1 className="text-2xl font-bold text-center whitespace-nowrap">
  NeuroCopy <span className="text-gradient-safe">GPT</span>
</h1>

// DESPUÉS - Aplicar gradiente inline sin romper la línea
<h1 className="text-2xl font-bold text-center whitespace-nowrap">
  NeuroCopy{' '}
  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
    GPT
  </span>
</h1>
```

---

### Problema 2: Área de Chat con Scroll Fijo

**Causa del problema:**
El `ScrollArea` usa `flex-1` pero no tiene una altura máxima definida, lo que permite que la página crezca indefinidamente.

**Solución:**
Crear una estructura de layout fijo con altura de viewport y overflow controlado. El panel derecho debe usar `h-screen` y `overflow-hidden` para contener el scroll interno.

**Archivo:** `src/components/video/NeuroCopyGenerator.tsx`

Cambios en la estructura del panel derecho:

```tsx
// Contenedor principal del chat con altura fija
<div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
  {/* Header del Chat - altura fija */}
  <div className="flex-shrink-0 border-b border-border/30 p-4 ...">
    ...
  </div>
  
  {/* Área de Mensajes - flex-1 con overflow */}
  <ScrollArea className="flex-1 min-h-0">
    <div className="p-6 space-y-6 pb-4">
      ...
    </div>
  </ScrollArea>
  
  {/* Botón Usar Guión - altura fija */}
  {lastGeneratedScript && !typingMessageId && (
    <div className="flex-shrink-0 border-t ...">
      ...
    </div>
  )}
  
  {/* Input Bar - altura fija */}
  <div className="flex-shrink-0 border-t ...">
    ...
  </div>
</div>
```

**Clave técnica:**
- `h-screen` en el contenedor padre para fijar la altura
- `overflow-hidden` para prevenir scroll externo
- `flex-shrink-0` en header e input para que no se compriman
- `min-h-0` en el ScrollArea para que el flex funcione correctamente

---

### Problema 3: Eliminar Color Naranja de Botones

**Causa del problema:**
- Variable `--accent: 15 100% 60%` define un naranja
- La variante `outline` del botón usa `hover:bg-accent` que aplica este naranja
- El botón `default` usa `bg-primary` (rosa/magenta) que está correcto

**Solución:**
Cambiar el estilo de los botones para:
1. Usar degradado rosa-magenta en lugar de colores sólidos
2. Eliminar el hover naranja de la variante `outline`
3. Crear una nueva clase de utilidad para botones con degradado

**Archivo:** `src/components/ui/button.tsx`

Modificar la variante `outline`:

```tsx
// ANTES
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",

// DESPUÉS - Quitar el hover naranja
outline: "border border-input bg-background hover:bg-primary/10 hover:text-primary",
```

**Archivo:** `src/index.css`

Agregar una nueva clase de utilidad para botones con degradado:

```css
.btn-gradient {
  background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)));
  color: white;
  border: none;
}

.btn-gradient:hover {
  opacity: 0.9;
}
```

**Archivos a modificar para botones específicos:**

1. **`CustomizeCardsModal.tsx`** - Botón "Confirmar":
   - Cambiar de `className="flex-1 cyber-glow h-12"` 
   - A `className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12"`

2. **`VideoStyleCard.tsx`** - Botón "Elegir Estilo":
   - Cuando `isSelected`, ya usa variant="default" (rosa)
   - Cuando no seleccionado, usa `variant="outline"` que ahora no tendrá hover naranja

3. **`NeuroCopyGenerator.tsx`** - Botón "Usar este Guión":
   - Ya usa `bg-gradient-to-r from-primary to-accent` ✓ (correcto)

---

### Resumen de Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/video/NeuroCopyGenerator.tsx` | 1. Título en una línea (inline gradient) 2. Layout fijo para scroll |
| `src/components/ui/button.tsx` | Cambiar hover de `outline` de naranja a rosa transparente |
| `src/components/video/CustomizeCardsModal.tsx` | Botón "Confirmar" con degradado |

---

### Resultado Visual Esperado

**Panel Izquierdo:**
- "NeuroCopy GPT" todo en una sola línea con "GPT" en degradado

**Panel Derecho (Chat):**
- Altura fija que ocupa todo el viewport
- Barra de scroll vertical cuando hay mucho contenido
- Header e input siempre visibles

**Botones en toda la app:**
- Sin color naranja sólido en hover
- Botones principales con degradado rosa-magenta (como la imagen del rayo)
- Botones outline con hover rosa transparente

