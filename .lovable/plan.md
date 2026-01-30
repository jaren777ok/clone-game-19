

## Plan: Solución Definitiva del Botón "Atrás" - Navegación Directa sin Depender de BD

### Diagnóstico del Problema

He identificado la causa raíz del problema después de revisar el código y la base de datos:

1. **La tabla `user_video_configs` está vacía** - Esto significa que los datos de configuración no se están guardando correctamente o se borran antes de poder usarlos.

2. **El flujo de navegación tiene una dependencia circular problemática**:
   - El botón "Atrás" en `VideoGeneratorFinal.tsx` intenta guardar el estado en la BD y luego navega a `/crear-video`
   - La página `/crear-video` (VideoCreationFlow) crea una **nueva instancia** del hook `useVideoCreationFlow`
   - Esta nueva instancia lee la BD para determinar el paso inicial
   - Si la BD está vacía o el guardado no se completó, `determineInitialStep()` cae al default: `api-key`

3. **El problema específico**: La función `saveVideoConfigImmediate` requiere que `selectedApiKey` tenga un `id` válido para guardar el `api_key_id`. Si por alguna razón el estado efectivo no tiene estos datos completos, el upsert falla silenciosamente o guarda datos incompletos.

### Solución: Navegación Directa con Estado

En lugar de depender de la base de datos para pasar el estado entre páginas (que es frágil), usaremos **navegación con estado de React Router** (el mismo patrón que ya funciona para ir al generador).

**Cambios a implementar:**

#### 1. Cambiar el texto del botón de "Atrás" a "Cambiar Subtítulos"
Esto es más claro para el usuario sobre qué hace el botón.

#### 2. Modificar `handleBack` para navegar con estado
En lugar de guardar en BD y esperar que la otra página lo lea, pasamos el estado directamente:

```typescript
const handleBack = () => {
  // Navegar directamente pasando el estado via location (mismo patrón que handleProceedToGenerator)
  const backState: FlowState = {
    ...effectiveFlowState,
    step: 'subtitle-customization'
  };
  
  navigate('/crear-video', { 
    state: backState,
    replace: false 
  });
};
```

#### 3. Modificar `VideoCreationFlow.tsx` para aceptar estado de navegación
La página necesita detectar si viene con estado de navegación y usarlo en lugar de recalcular:

```typescript
const VideoCreationFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Detectar estado de navegación
  const navigationState = location.state as FlowState | undefined;
  
  // Si viene con estado de navegación válido, usarlo directamente
  useEffect(() => {
    if (navigationState && navigationState.step === 'subtitle-customization') {
      console.log('✅ Usando estado de navegación directa:', navigationState.step);
      // Forzar el paso a subtitle-customization
      goToStep('subtitle-customization');
    }
  }, [navigationState]);
  
  // ... resto del código
};
```

#### 4. Actualizar `VideoGeneratorHeader.tsx` para mostrar "Cambiar Subtítulos"

```typescript
const VideoGeneratorHeader = ({ onBack }: VideoGeneratorHeaderProps) => {
  return (
    <Button variant="outline" onClick={onBack} className="cyber-border hover:cyber-glow">
      <ArrowLeft className="w-4 h-4 sm:mr-2" />
      <span>Cambiar Subtítulos</span>
    </Button>
  );
};
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/video/VideoGeneratorHeader.tsx` | Cambiar texto "Atrás" → "Cambiar Subtítulos" |
| `src/pages/VideoGeneratorFinal.tsx` | Simplificar `handleBack` para usar navegación con estado |
| `src/pages/VideoCreationFlow.tsx` | Aceptar estado de navegación y aplicarlo |

---

### Detalle Técnico de los Cambios

**VideoGeneratorFinal.tsx - handleBack simplificado:**

```typescript
const handleBack = () => {
  // Navegar directamente con el estado del flujo actual
  // Esto evita depender de la base de datos para la navegación
  const backState: FlowState = {
    ...effectiveFlowState,
    step: 'subtitle-customization'
  };
  
  console.log('⬅️ Navegando a subtítulos con estado directo:', {
    step: backState.step,
    hasApiKey: !!backState.selectedApiKey,
    hasStyle: !!backState.selectedStyle,
    hasAvatar: !!backState.selectedAvatar,
    hasVoice: !!backState.selectedVoice
  });
  
  navigate('/crear-video', { 
    state: backState,
    replace: false 
  });
};
```

**VideoCreationFlow.tsx - Aceptar estado de navegación:**

```typescript
const VideoCreationFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Detectar si viene con estado de navegación (desde el generador)
  const navigationState = location.state as FlowState | undefined;
  const [overrideState, setOverrideState] = useState<FlowState | null>(null);
  
  // Si viene con estado de navegación, aplicarlo
  useEffect(() => {
    if (navigationState && navigationState.selectedApiKey && navigationState.selectedStyle) {
      console.log('✅ Usando estado de navegación directa:', navigationState.step);
      setOverrideState(navigationState);
    }
  }, []);
  
  // Usar overrideState si existe, sino usar el flowState normal
  const activeFlowState = overrideState || flowState;
  
  // Renderizar según el paso activo...
};
```

---

### Resultado Esperado

1. El botón mostrará "Cambiar Subtítulos" en lugar de "Atrás"
2. Al presionarlo, navegará directamente a la página de subtítulos con toda la configuración intacta
3. No depende de la base de datos para la navegación (más robusto)
4. El patrón es consistente con cómo ya funciona la navegación hacia el generador

### Ventajas de esta Solución

- **Inmediato**: No hay latencia de esperar a la BD
- **Confiable**: El estado se pasa directamente en memoria
- **Consistente**: Usa el mismo patrón que ya funciona para ir al generador
- **Simple**: Menos código y menos puntos de fallo

