

## Plan: Persistencia Robusta de Configuración de Video en Supabase

### Diagnóstico del Problema

Después de revisar el código, he identificado **tres problemas principales**:

1. **La tabla `user_video_configs` está vacía** - La configuración no se está guardando correctamente durante el flujo. El usuario completa todos los pasos, pero nada se persiste en Supabase.

2. **El hook `useVideoCreationFlow` tiene un guardado con debounce (100ms) pero solo se activa cuando `isInitialized` es `true`**:
   - El efecto que guarda depende de `[flowState, isInitialized, user]`
   - Pero cuando el usuario navega usando `overrideState` (desde el generador con `location.state`), este estado nunca se sincroniza con la BD porque:
     - `VideoCreationFlow.tsx` usa `overrideState` como prioridad, pero no sincroniza ese estado de vuelta al hook
     - Las funciones `selectSubtitleCustomization`, `selectVoice`, etc. que usan `goToStep` actualizan `flowState` pero no guardan explícitamente en BD

3. **El problema del botón "Usar este diseño" / "Cambiar voz"**:
   - Cuando vienes del generador con `location.state`, el `overrideState` tiene toda la configuración
   - Pero los callbacks como `selectSubtitleCustomization` y `handleBack` usan el `flowState` del hook (que está vacío o desactualizado), NO el `overrideState`
   - Resultado: al intentar avanzar o retroceder, el sistema usa un estado incompleto y falla

---

### Solución Propuesta

#### Parte 1: Sincronizar `overrideState` con el Hook

Cuando `VideoCreationFlow` detecta un `navigationState` válido, debe:
1. Aplicarlo como `overrideState` (ya lo hace)
2. **Guardarlo inmediatamente en Supabase** para que persista
3. **Sincronizar las funciones del hook** para usar el estado correcto

#### Parte 2: Hacer que los callbacks usen el estado correcto

Actualmente los callbacks (`selectSubtitleCustomization`, `handleBack`) usan el `flowState` del hook. Necesitamos:
1. Pasar el estado activo correcto a cada componente hijo
2. Crear wrappers para los callbacks que usen el estado correcto

#### Parte 3: Guardado explícito en cada paso crítico

En el hook `useVideoCreationFlow`, añadir guardado inmediato en:
- `selectAvatar()`
- `selectVoice()`
- `selectStyle()`
- `selectSubtitleCustomization()`

Actualmente solo `selectApiKey()` y `selectGeneratedScript()` hacen guardado inmediato.

---

### Cambios Específicos

#### Archivo 1: `src/pages/VideoCreationFlow.tsx`

**Cambio A**: Sincronizar `overrideState` con Supabase al detectarlo

```typescript
// Si viene con estado de navegación válido, aplicarlo Y guardarlo
useEffect(() => {
  const syncNavigationState = async () => {
    if (navigationState && navigationState.selectedApiKey && navigationState.selectedStyle && 
        navigationState.selectedAvatar && navigationState.step) {
      console.log('✅ Usando estado de navegación directa:', {
        step: navigationState.step,
        // ...
      });
      setOverrideState(navigationState);
      
      // NUEVO: Guardar el estado en Supabase para persistencia
      if (user) {
        try {
          await saveVideoConfigImmediate(user, navigationState);
          console.log('💾 Estado de navegación sincronizado con Supabase');
        } catch (error) {
          console.error('Error sincronizando estado:', error);
        }
      }
    }
  };
  
  syncNavigationState();
}, []); // Solo al montar
```

**Cambio B**: Crear wrappers para callbacks que usen el estado correcto

```typescript
// Wrapper para selectSubtitleCustomization que mantiene el estado completo
const handleSelectSubtitleCustomization = async (subtitleCustomization: SubtitleCustomization) => {
  const baseState = overrideState || flowState;
  const newState: FlowState = {
    ...baseState,
    subtitleCustomization,
    step: 'generator'
  };
  
  // Guardar inmediatamente en Supabase
  if (user) {
    await saveVideoConfigImmediate(user, newState);
  }
  
  // Navegar al generador con el estado completo
  navigate('/crear-video-generator', { 
    state: newState,
    replace: false 
  });
};

// Wrapper para handleBack que respeta el overrideState
const handleBackFromSubtitles = () => {
  const baseState = overrideState || flowState;
  
  if (baseState.selectedStyle?.id === 'style-7' && baseState.selectedSecondAvatar) {
    // Multi-Avatar: regresar a multi-avatar
    setOverrideState({ ...baseState, step: 'multi-avatar' });
  } else {
    // Otros estilos: regresar a voice
    setOverrideState({ ...baseState, step: 'voice' });
  }
};
```

**Cambio C**: Pasar los handlers correctos a SubtitleCustomizer

```typescript
case 'subtitle-customization':
  return (
    <SubtitleCustomizer
      onSelectCustomization={handleSelectSubtitleCustomization}
      onBack={handleBackFromSubtitles}
    />
  );
```

---

#### Archivo 2: `src/hooks/useVideoCreationFlow.ts`

**Cambio A**: Añadir guardado inmediato en `selectAvatar`, `selectVoice`, `selectStyle`, `selectSubtitleCustomization`

```typescript
const selectAvatar = useCallback(async (avatar: Avatar) => {
  console.log('👤 Seleccionando Avatar:', avatar.avatar_name);
  const newFlowState = {
    ...flowState,
    selectedAvatar: avatar,
    step: 'voice' as const
  };
  
  setFlowState(newFlowState);
  
  // Guardado inmediato
  if (user) {
    try {
      await saveVideoConfigImmediate(user, newFlowState);
    } catch (error) {
      console.error('Error guardando avatar:', error);
    }
  }
}, [flowState, user]);

// Igual para selectVoice, selectStyle, selectSubtitleCustomization
```

---

### Flujo de Datos Corregido

```text
Usuario en Generador Final
         |
         | Click "Cambiar Subtítulos"
         v
navigate('/crear-video', { state: flowState con step='subtitle-customization' })
         |
         v
VideoCreationFlow detecta navigationState
         |
         +---> setOverrideState(navigationState)
         |
         +---> saveVideoConfigImmediate(user, navigationState)  <-- NUEVO
         |
         v
SubtitleCustomizer renderiza con overrideState
         |
         | Usuario hace cambios y click "Usar este diseño"
         v
handleSelectSubtitleCustomization(newSubtitles)  <-- NUEVO wrapper
         |
         +---> Combina overrideState con nuevos subtítulos
         |
         +---> saveVideoConfigImmediate(user, newState)
         |
         +---> navigate('/crear-video-generator', { state: newState })
         |
         v
VideoGeneratorFinal tiene configuración completa
```

---

### Archivos a Modificar

| Archivo | Tipo de Cambio |
|---------|----------------|
| `src/pages/VideoCreationFlow.tsx` | Sincronizar overrideState con BD + crear wrappers para callbacks |
| `src/hooks/useVideoCreationFlow.ts` | Añadir guardado inmediato en selectAvatar, selectVoice, selectStyle, selectSubtitleCustomization |

---

### Resultado Esperado

1. **Persistencia completa**: Cada paso del flujo (guión, estilo, avatar, voz, subtítulos) se guarda en Supabase inmediatamente al seleccionarse

2. **Navegación hacia atrás funcional**: El botón "Cambiar Subtítulos" funcionará correctamente, y desde subtítulos podrás:
   - Avanzar con "Usar este diseño" hacia el generador
   - Retroceder con "Cambiar voz" hacia la selección de voz

3. **Recuperación de sesión**: Si el usuario cierra la pestaña y vuelve, el flujo puede recuperarse desde el último paso guardado

4. **Limpieza automática**: Cuando el video se genera exitosamente, la configuración se borra de Supabase para un nuevo ciclo

---

### Nota Técnica

El problema fundamental era que existían **dos fuentes de verdad desincronizadas**:
- `flowState` (del hook `useVideoCreationFlow`)
- `overrideState` (estado local de `VideoCreationFlow`)

La solución unifica estas fuentes asegurando que:
1. `overrideState` siempre se sincroniza con Supabase al detectarse
2. Los callbacks usan explícitamente el estado correcto (overrideState cuando existe)
3. Cada selección crítica hace guardado inmediato en BD

