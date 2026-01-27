

## Plan: Corrección de Requisitos y Efecto de Sonido para NeuroCopy

### Cambios a Realizar

---

### 1. Corregir Requisitos de Estilos Educativos

**Archivo:** `src/components/video/StyleSelector.tsx`

Cambiar los requisitos de "Avatar Vertical" a "Avatar Horizontal" para ambos estilos educativos:

| Estilo | Antes | Después |
|--------|-------|---------|
| Estilo Educativo 1 | Avatar Vertical recomendado | Avatar Horizontal recomendado |
| Estilo Educativo 2 | Avatar Vertical recomendado | Avatar Horizontal recomendado |

**Líneas a modificar:**
- Línea 58: `items: ['Avatar Vertical recomendado']` → `items: ['Avatar Horizontal recomendado']`
- Línea 67: `items: ['Avatar Vertical recomendado']` → `items: ['Avatar Horizontal recomendado']`

---

### 2. Agregar Efecto de Sonido de Escritura IA

**Nuevo archivo:** `src/lib/typingSound.ts`

Crear un generador de sonido procedural usando la **Web Audio API** que simula el sonido de una máquina de escribir/teclado de computadora. Este enfoque tiene las ventajas:

- No requiere archivos de audio externos
- Se genera dinámicamente en el navegador
- Peso cero en el bundle
- Configurable (volumen, pitch, ritmo)

**Implementación técnica:**

```text
┌───────────────────────────────────────────────────┐
│           GENERADOR DE SONIDO PROCEDURAL          │
├───────────────────────────────────────────────────┤
│                                                   │
│  AudioContext                                     │
│       │                                           │
│       ▼                                           │
│  OscillatorNode ──► GainNode ──► Destination     │
│  (genera tono)      (volumen)    (speakers)       │
│                                                   │
│  Parámetros:                                      │
│  - Frecuencia base: ~800-1200 Hz (click)          │
│  - Duración: ~30-50ms por caracter                │
│  - Variación aleatoria para naturalidad           │
│  - Envelope rápido (attack/decay corto)           │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Archivo:** `src/components/video/NeuroCopyGenerator.tsx`

Modificar la función `typeMessage` para reproducir el sonido en cada iteración del typewriter:

```text
typewriterRef.current = setInterval(() => {
  if (index <= fullContent.length) {
    // Reproducir sonido de escritura
    playTypingSound();  // <-- NUEVO
    
    setDisplayedContent(prev => ({
      ...prev,
      [messageId]: fullContent.slice(0, index)
    }));
    index++;
  } else {
    // ... resto del código
  }
}, speed);
```

**Consideraciones de UX:**
- Sonido sutil (volumen bajo ~0.1-0.2)
- Variación en pitch para que no sea monótono
- No reproducir en cada caracter si el speed es muy rápido (cada 2-3 caracteres)
- Posibilidad de silenciar (respetando preferencias del usuario)

---

### Resumen de Archivos

| Archivo | Acción | Cambios |
|---------|--------|---------|
| `src/components/video/StyleSelector.tsx` | Modificar | Cambiar "Vertical" a "Horizontal" en requisitos de estilos educativos |
| `src/lib/typingSound.ts` | Crear | Generador de sonido procedural con Web Audio API |
| `src/components/video/NeuroCopyGenerator.tsx` | Modificar | Integrar el sonido de escritura en el efecto typewriter |

---

### Detalles Técnicos del Sonido

El sonido de escritura se generará con las siguientes características:

1. **Tipo de onda**: Square o Sawtooth (más "clicky")
2. **Frecuencia**: 800-1500 Hz con variación aleatoria
3. **Duración**: 20-40ms
4. **Envelope**: Attack instantáneo, decay muy corto
5. **Volumen**: 0.05-0.15 (muy sutil, no molesto)
6. **Throttling**: Solo reproducir cada 2-3 caracteres si el speed es < 20ms

Esto creará un efecto de "escritura de computadora" que acompaña visualmente al texto que aparece.

