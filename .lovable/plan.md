

## Plan: Simplificar a un Solo Botón "Completar con IA"

### Objetivo
Reemplazar los dos botones individuales de "Completar con IA" (uno para título, otro para subtítulo) por un único botón que rellene ambos campos automáticamente.

---

### Nueva Respuesta de la Webhook

```json
[
  {
    "titulo": "Operación Relámpago: EE. UU. toma Venezuela",
    "subtitulo": "Petróleo, poder y destino en juego"
  }
]
```

---

### Nuevo Diseño Visual

```text
┌─────────────────────────────────────────┐
│         Personaliza las Tarjetas        │
├─────────────────────────────────────────┤
│ Fecha                                   │
│ [📅 27/01/2026                       ]  │
│                                         │
│ Título                           0/62   │
│ [Ingresa el título de la noticia    ]  │
│                                         │
│ Subtítulo                        0/45   │
│ [Ingresa el subtítulo de la noticia ]  │
│                                         │
│ [✨ Completar todo con IA          ]   │  ← UN SOLO BOTÓN
│                                         │
│   [Cancelar]        [Confirmar]         │
└─────────────────────────────────────────┘
```

El botón único se ubicará **después de ambos campos de texto** y **antes de los botones de acción**, creando una separación visual clara.

---

### Cambios en `src/components/video/CustomizeCardsModal.tsx`

#### 1. Simplificar Estados
Cambiar de dos estados de carga a uno solo:

```tsx
// ANTES (líneas 31-32)
const [loadingTitulo, setLoadingTitulo] = useState(false);
const [loadingSubtitulo, setLoadingSubtitulo] = useState(false);

// DESPUÉS
const [loadingAI, setLoadingAI] = useState(false);
```

#### 2. Modificar Función de Webhook
Actualizar `handleCompleteWithAI` para que rellene ambos campos:

```tsx
const handleCompleteWithAI = async () => {
  setLoadingAI(true);
  
  try {
    const response = await fetch('https://cris.cloude.es/webhook/generador-de-texto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guion: generatedScript
      })
    });
    
    const data = await response.json();
    
    // Nueva respuesta esperada: [{ "titulo": "...", "subtitulo": "..." }]
    if (data && data[0]) {
      if (data[0].titulo) {
        const tituloTexto = transformQuotes(data[0].titulo.slice(0, 62));
        setTitulo(tituloTexto);
      }
      if (data[0].subtitulo) {
        const subtituloTexto = transformQuotes(data[0].subtitulo.slice(0, 45));
        setSubtitulo(subtituloTexto);
      }
    }
  } catch (error) {
    console.error('Error al completar con IA:', error);
  } finally {
    setLoadingAI(false);
  }
};
```

#### 3. Eliminar Botones Individuales
Remover los botones "Completar con IA" que están debajo de cada campo (líneas 137-156 y 180-199).

#### 4. Agregar Botón Único
Insertar un solo botón después del campo Subtítulo y antes de los botones de acción:

```tsx
{/* Botón único de completar con IA */}
<Button
  type="button"
  variant="outline"
  onClick={handleCompleteWithAI}
  disabled={loadingAI || !generatedScript}
  className="w-full cyber-border hover:cyber-glow h-12 text-primary hover:text-primary/80 flex items-center justify-center gap-2"
>
  {loadingAI ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Generando título y subtítulo...
    </>
  ) : (
    <>
      <Sparkles className="h-4 w-4" />
      Completar todo con IA
    </>
  )}
</Button>
```

---

### Resumen de Cambios

| Sección | Acción |
|---------|--------|
| Estados | Reemplazar `loadingTitulo` y `loadingSubtitulo` por un solo `loadingAI` |
| Función webhook | Modificar para procesar la nueva respuesta con `titulo` y `subtitulo` |
| Campo Título | Eliminar botón "Completar con IA" individual |
| Campo Subtítulo | Eliminar botón "Completar con IA" individual |
| Nuevo botón | Agregar un solo botón "Completar todo con IA" entre los campos y los botones de acción |

---

### Beneficios
- Interfaz más limpia y menos recargada
- Una sola llamada a la webhook en lugar de dos
- Experiencia de usuario más rápida
- Menos código para mantener

