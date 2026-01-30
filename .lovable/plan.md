
Objetivo
- Corregir definitivamente el botón “Atrás” del Generador Final para que vuelva al paso anterior real (“subtitle-customization”) sin reiniciar el flujo ni mandar al inicio (Gestión de Claves API).
- Mantener la configuración (API key, estilo, avatar, voz, etc.) intacta al regresar.

Diagnóstico (qué está pasando y por qué)
- El Generador Final (`/crear-video-generator`) usa `useVideoCreationFlow()` pero esa instancia del hook NO es compartida con la que usa `VideoCreationFlow` en `/crear-video`. Cada página crea su propia instancia del estado.
- Cuando presionas “Atrás”, hacemos:
  - `goToStep('subtitle-customization')` (solo afecta la instancia local del hook en el Generador Final)
  - `navigate('/crear-video')` (monta de nuevo `VideoCreationFlow`, que crea OTRA instancia del hook y recalcula el paso inicial leyendo BD)
- Si en la BD (tabla `user_video_configs`) falta el registro, o el `api_key_id`/datos necesarios no están completos en ese momento, `determineInitialStep()` cae al default y te manda a `api-key`.
- El “update current_step” que se hizo ayuda solo si la fila ya existe y ya tiene el resto de columnas (api_key_id, avatar_data, voice_data, style_data, etc.). Si la fila no existe o quedó incompleta, el update no arregla nada.

Solución propuesta (robusta)
A) En el botón “Atrás” del Generador Final, en vez de hacer solo `update(current_step)`, vamos a hacer un “guardado completo” (upsert) del FlowState actual con el paso forzado a `subtitle-customization`.
- Esto garantiza que:
  - La fila exista (si estaba borrada, se recrea)
  - `api_key_id` y el resto de datos queden persistidos
  - `current_step` quede exactamente en `subtitle-customization`
- Para esto reutilizamos la función ya existente y probada: `saveVideoConfigImmediate(user, flowState)` (que internamente hace `upsert` en `user_video_configs`).

B) Después de guardar, navegar a `/crear-video`.
- Al montar `VideoCreationFlow`, `useVideoCreationFlow` cargará desde BD y `determineInitialStep()` respetará el `subtitle-customization` (ya hay una regla explícita para respetarlo si existe `selectedVoice`).
- Resultado: vuelves al paso de subtítulos sin reinicio.

C) Hardening adicional (para evitar casos raros)
1) En `determineInitialStep()` ampliar la condición de “respetar subtitle-customization” para no depender estrictamente de `selectedVoice` si ya tenemos suficiente configuración.
   - Por ejemplo: si `savedState.step === 'subtitle-customization'` y existe `selectedStyle + selectedAvatar + selectedApiKey`, mantenerlo; y si falta algo crítico, degradar al paso correcto.
   - Esto evita que por un dato nulo accidental te mande a “api-key” cuando realmente puede devolverte al paso más cercano coherente (p.ej. voice o avatar).

2) Logging puntual y limpio:
   - Agregar logs “one-liner” en `handleBack` para confirmar:
     - que el upsert se ejecutó
     - que el paso guardado fue subtitle-customization
   - Agregar log en `loadVideoConfig` (ya hay muchos) pero enfocarnos en confirmar `api_key_id` y `current_step`.

Cambios concretos (archivos y qué se tocará)
1) `src/pages/VideoGeneratorFinal.tsx`
- Reemplazar el bloque actual de `handleBack`:
  - En vez de `supabase.from('user_video_configs').update({ current_step: ... })`
  - Hacer:
    - Construir `backState = { ...effectiveFlowState, step: 'subtitle-customization' }`
    - `await saveVideoConfigImmediate(user, backState)`
    - Luego `navigate('/crear-video')`
- Mantener `goToStep('subtitle-customization')` opcional (no hace daño) pero ya no será el mecanismo principal.

2) `src/utils/videoFlowUtils.ts`
- Ajustar la regla “respetar subtitle-customization” para que sea más tolerante (si aplica).
  - Hoy: `if (savedState.step === 'subtitle-customization' && savedState.selectedVoice) return ...`
  - Propuesta: respetar si el paso guardado es subtitle-customization y hay suficiente configuración para entrar a ese paso o para volver a un paso inmediatamente anterior (voice/avatar) sin caer a api-key por defecto.

Plan de pruebas (end-to-end)
1) Caso principal:
- Completar flujo hasta Generador Final
- Presionar “Atrás”
- Verificar que abre directamente `SubtitleCustomizer` (no Gestión de Claves API)
- Verificar que la configuración está intacta (estilo, voz, avatar, etc.)

2) Edge cases:
- Presionar “Atrás” rápido varias veces
- Ir al generador, refrescar (si el sistema limpia en refresh) y luego intentar volver a /crear-video; verificar el comportamiento esperado (si se limpia por diseño, debe reiniciar, pero con “Atrás” no debe limpiar).

3) Multi-avatar (style-7):
- Completar hasta generator con segundo avatar
- “Atrás” debe llevar a subtítulos (y si vuelves otra vez atrás desde subtítulos, debe seguir la lógica actual hacia multi-avatar).

Riesgos y mitigación
- Riesgo: `saveVideoConfigImmediate` guarda “mucho” (manual_customization con base64) y puede ser pesado.
  - Mitigación: En el back, si `effectiveFlowState.manualCustomization` existe y es enorme, podemos:
    - o mantenerlo (más robusto para no perder nada),
    - o guardar solo “config esencial” si tú prefieres performance. (Por defecto: mantener, para evitar pérdida de datos.)
- Riesgo: que haya lógica de limpieza al cambiar de pantalla.
  - Mitigación: Confirmar que solo se limpia en `beforeunload`/video generado. Navegación SPA no dispara beforeunload.

Resultado esperado
- El botón “Atrás” en el Generador Final siempre vuelve a “Personalización de Subtítulos” (penúltimo paso) sin reiniciar flujo y sin mandarte a “Gestión de Claves API”.
- La configuración permanece completa y consistente porque se persiste con upsert antes de navegar.
