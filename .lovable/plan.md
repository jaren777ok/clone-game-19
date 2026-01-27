

## Plan: Corrección de Textos de Botones y Navegación

### Resumen de Cambios

Se corregirán los textos de los botones en tres páginas y se modificará la navegación del generador para volver a los pasos anteriores en lugar del dashboard.

---

### 1. Cambiar "Cambiar avatar" a "Cambiar Guion"

**Archivo:** `src/components/video/StyleSelectorHeader.tsx`

| Línea | Antes | Después |
|-------|-------|---------|
| 20 | `Cambiar avatar` | `Cambiar Guion` |

**Razón:** En el selector de estilos, el usuario viene del paso de NeuroCopy (generación de guion), no del selector de avatar. El botón debe reflejar a dónde regresa.

---

### 2. Cambiar "Continuar con Neurocopy" a "Usar este Diseño"

**Archivo:** `src/components/video/SubtitleCustomizer.tsx`

| Línea | Antes | Después |
|-------|-------|---------|
| 788 | `Continuar con Neurocopy` | `Usar este Diseño` |

**Razón:** El texto actual es confuso ya que NeuroCopy es el paso anterior. "Usar este Diseño" refleja mejor la acción de confirmar la personalización de subtítulos.

---

### 3. Modificar botón "Volver al Dashboard" en el Generador

**Archivo:** `src/components/video/VideoGeneratorHeader.tsx`

#### Cambios:

**a) Texto del botón:**
| Línea | Antes | Después |
|-------|-------|---------|
| 21 | `Volver al Dashboard` | `Volver` |
| 22 | `Dashboard` | `Volver` |

**b) Navegación:**
- En lugar de navegar a `/dashboard`, navegar a `/crear-video` que es donde está el flujo de creación
- Esto permitirá al usuario regresar a los pasos anteriores y corregir selecciones

**c) Color del botón (eliminar naranja):**
- Cambiar de `variant="ghost"` a `variant="outline"` para que use el esquema de colores correcto sin el fondo naranja en hover

El código modificado será:
```tsx
<Button
  variant="outline"  // Cambiar de "ghost" a "outline"
  onClick={() => navigate('/crear-video')}  // Cambiar destino
  className="cyber-border hover:cyber-glow text-xs sm:text-sm px-2 sm:px-4"
  size={isMobile ? "sm" : "default"}
>
  <ArrowLeft className="w-4 h-4 sm:mr-2" />
  <span className="hidden sm:inline">Volver</span>
  <span className="sm:hidden">Volver</span>
</Button>
```

---

### Resumen de Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/video/StyleSelectorHeader.tsx` | Texto: "Cambiar avatar" → "Cambiar Guion" |
| `src/components/video/SubtitleCustomizer.tsx` | Texto: "Continuar con Neurocopy" → "Usar este Diseño" |
| `src/components/video/VideoGeneratorHeader.tsx` | Texto: "Volver al Dashboard" → "Volver", Navegación: `/dashboard` → `/crear-video`, Variante: `ghost` → `outline` |

---

### Comportamiento Esperado

1. **En selector de estilos:** El botón dice "Cambiar Guion" y regresa al paso de NeuroCopy
2. **En subtítulos:** El botón dice "Usar este Diseño" y avanza al generador
3. **En generador:** El botón dice "Volver", tiene color consistente con el tema (sin naranja), y regresa al flujo `/crear-video` donde el usuario puede revisar/cambiar pasos anteriores

