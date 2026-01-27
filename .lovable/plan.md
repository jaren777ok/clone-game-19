

## Plan: Agregar "Completar con IA" a los campos Título y Subtítulo

### Objetivo
Agregar un botón "Completar con IA" debajo de cada campo (Título y Subtítulo) en el modal `CustomizeCardsModal`. Al hacer clic, se enviará el guión generado a una webhook que responderá con el texto sugerido.

---

### Webhook de n8n
- **URL**: `https://cris.cloude.es/webhook/generador-de-texto`
- **Método**: POST
- **Body**: 
```json
{
  "guion": "todo el script del usuario",
  "campo": "titulo" | "subtitulo"
}
```
- **Respuesta esperada**:
```json
[
  {
    "exito": "texto generado por la IA"
  }
]
```

---

### Flujo de Datos Actual

```text
+---------------------+     +----------------+     +----------------------+
| VideoCreationFlow   | --> | StyleSelector  | --> | CustomizeCardsModal  |
| (tiene flowState    |     | (no recibe     |     | (no recibe script)   |
|  .generatedScript)  |     |  script)       |     |                      |
+---------------------+     +----------------+     +----------------------+
```

### Flujo de Datos Propuesto

```text
+---------------------+     +------------------+     +----------------------+
| VideoCreationFlow   | --> | StyleSelector    | --> | CustomizeCardsModal  |
| flowState           |     | generatedScript  |     | generatedScript      |
| .generatedScript    |     | (nueva prop)     |     | (nueva prop)         |
+---------------------+     +------------------+     +----------------------+
```

---

### PARTE 1: Modificar `VideoCreationFlow.tsx`

Pasar el `generatedScript` a `StyleSelector`:

```tsx
// Línea ~165-168
<StyleSelector
  onSelectStyle={selectStyle}
  onBack={handleBack}
  generatedScript={flowState.generatedScript || ''}  // NUEVO
/>
```

---

### PARTE 2: Modificar `StyleSelector.tsx`

1. Actualizar la interfaz Props para recibir el script:
```tsx
interface Props {
  onSelectStyle: (...) => void;
  onBack: () => void;
  generatedScript: string;  // NUEVO
}
```

2. Pasar el script al `CustomizeCardsModal`:
```tsx
<CustomizeCardsModal
  isOpen={showCustomizeModal}
  onClose={handleCustomizeCancel}
  onConfirm={handleCustomizeConfirm}
  generatedScript={generatedScript}  // NUEVO
/>
```

---

### PARTE 3: Modificar `CustomizeCardsModal.tsx`

Esta es la parte principal del cambio.

#### 3.1 Actualizar Props
```tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: CardCustomization) => void;
  generatedScript: string;  // NUEVO
}
```

#### 3.2 Agregar estados de carga
```tsx
const [loadingTitulo, setLoadingTitulo] = useState(false);
const [loadingSubtitulo, setLoadingSubtitulo] = useState(false);
```

#### 3.3 Crear función para llamar a la webhook
```tsx
const handleCompleteWithAI = async (campo: 'titulo' | 'subtitulo') => {
  const setLoading = campo === 'titulo' ? setLoadingTitulo : setLoadingSubtitulo;
  const setValue = campo === 'titulo' ? setTitulo : setSubtitulo;
  const maxLength = campo === 'titulo' ? 62 : 45;
  
  setLoading(true);
  
  try {
    const response = await fetch('https://cris.cloude.es/webhook/generador-de-texto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guion: generatedScript,
        campo: campo
      })
    });
    
    const data = await response.json();
    
    // Respuesta esperada: [{ "exito": "texto" }]
    if (data && data[0] && data[0].exito) {
      const texto = transformQuotes(data[0].exito.slice(0, maxLength));
      setValue(texto);
    }
  } catch (error) {
    console.error('Error al completar con IA:', error);
  } finally {
    setLoading(false);
  }
};
```

#### 3.4 Agregar botón debajo de cada campo

Para el campo **Título** (después del Input, línea ~102):
```tsx
<Button
  type="button"
  variant="ghost"
  size="sm"
  onClick={() => handleCompleteWithAI('titulo')}
  disabled={loadingTitulo || !generatedScript}
  className="w-full mt-2 text-primary hover:text-primary/80 flex items-center justify-center gap-2"
>
  {loadingTitulo ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Generando...
    </>
  ) : (
    <>
      <Sparkles className="h-4 w-4" />
      Completar con IA
    </>
  )}
</Button>
```

Para el campo **Subtítulo** (después del Input, línea ~125):
```tsx
<Button
  type="button"
  variant="ghost"
  size="sm"
  onClick={() => handleCompleteWithAI('subtitulo')}
  disabled={loadingSubtitulo || !generatedScript}
  className="w-full mt-2 text-primary hover:text-primary/80 flex items-center justify-center gap-2"
>
  {loadingSubtitulo ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Generando...
    </>
  ) : (
    <>
      <Sparkles className="h-4 w-4" />
      Completar con IA
    </>
  )}
</Button>
```

#### 3.5 Agregar imports necesarios
```tsx
import { CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
```

---

### Resumen de Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/VideoCreationFlow.tsx` | Pasar `generatedScript` a StyleSelector |
| `src/components/video/StyleSelector.tsx` | Recibir y pasar `generatedScript` a CustomizeCardsModal |
| `src/components/video/CustomizeCardsModal.tsx` | Agregar botones "Completar con IA", función de webhook, estados de carga |

---

### Diseño Visual

```text
┌─────────────────────────────────────────┐
│         Personaliza las Tarjetas        │
├─────────────────────────────────────────┤
│ Fecha                                   │
│ [📅 27/01/2026                       ]  │
│                                         │
│ Título                           0/62   │
│ [Ingresa el título de la noticia    ]  │
│ [✨ Completar con IA               ]   │  ← NUEVO
│                                         │
│ Subtítulo                        0/45   │
│ [Ingresa el subtítulo de la noticia ]  │
│ [✨ Completar con IA               ]   │  ← NUEVO
│                                         │
│   [Cancelar]        [Confirmar]         │
└─────────────────────────────────────────┘
```

---

### Resultado Esperado

1. Usuario abre el modal de "Personaliza las Tarjetas"
2. Ve botón "✨ Completar con IA" debajo de cada campo
3. Al hacer clic en el botón de Título:
   - Se envía POST a la webhook con `{guion: "...", campo: "titulo"}`
   - Botón muestra spinner "Generando..."
   - Al recibir respuesta, se llena el campo Título automáticamente
4. Lo mismo para Subtítulo
5. Usuario puede editar el texto generado si lo desea
6. Hace clic en "Confirmar" para continuar

