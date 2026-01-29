

## Plan: Validación Automática de API Key y Detección de Plan HeyGen

### Resumen de Cambios

Este plan implementa dos mejoras importantes:

1. **Nueva validación de clave API**: Usar el endpoint `/v2/user/remaining_quota` de HeyGen para validar la clave (más ligero que cargar avatares)
2. **Detección automática de plan Pro/Free**: Eliminar el modal manual de selección y detectar automáticamente si tiene `plan_credit` en la respuesta

---

### Archivos a Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/functions/heygen-quota/index.ts` | Crear | Nueva edge function para verificar quota y plan |
| `src/components/video/ApiKeyForm.tsx` | Modificar | Usar nueva edge function para validación |
| `src/components/video/StyleSelector.tsx` | Modificar | Auto-detectar plan y eliminar modal manual |
| `src/hooks/useVideoCreationFlow.ts` | Modificar | Agregar función para obtener quota de la API key |
| `src/types/videoFlow.ts` | Modificar | Agregar interface para quota response |

---

### Cambio 1: Nueva Edge Function `heygen-quota`

**Archivo:** `supabase/functions/heygen-quota/index.ts`

Esta función:
- Llama al endpoint `https://api.heygen.com/v2/user/remaining_quota`
- Retorna si la clave es válida y si tiene `plan_credit` (plan de pago)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuotaResponse {
  isValid: boolean;
  isPaidPlan: boolean;
  remainingQuota: number;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isPaidPlan: false, 
          remainingQuota: 0,
          error: 'API key is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Llamar al endpoint de quota de HeyGen
    const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isPaidPlan: false, 
          remainingQuota: 0,
          error: 'Invalid API key or HeyGen service error' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    // La respuesta puede venir como array o como objeto directo
    const quotaData = Array.isArray(data) ? data[0] : data
    
    if (quotaData.error) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          isPaidPlan: false, 
          remainingQuota: 0,
          error: quotaData.error 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Detectar si tiene plan de pago verificando si existe "plan_credit" en details
    const details = quotaData.data?.details || {}
    const hasPlanCredit = 'plan_credit' in details && details.plan_credit > 0
    const remainingQuota = quotaData.data?.remaining_quota || 0

    console.log('HeyGen quota check:', {
      remainingQuota,
      hasPlanCredit,
      details: Object.keys(details)
    })

    return new Response(
      JSON.stringify({ 
        isValid: true, 
        isPaidPlan: hasPlanCredit,
        remainingQuota,
        details 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        isPaidPlan: false, 
        remainingQuota: 0,
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### Cambio 2: Actualizar ApiKeyForm.tsx

**Usar la nueva edge function para validar:**

```typescript
// ANTES (líneas 34-50):
const response = await supabase.functions.invoke('heygen-avatars', {
  body: { 
    apiKey: formData.apiKey,
    offset: 0,
    limit: 1
  }
});

if (response.error) {
  toast({ title: "Clave API inválida", ... });
  return;
}

// DESPUÉS:
const response = await supabase.functions.invoke('heygen-quota', {
  body: { apiKey: formData.apiKey }
});

if (response.error || !response.data?.isValid) {
  toast({
    title: "Clave API inválida",
    description: response.data?.error || 
      "La clave API proporcionada no es válida o no tiene acceso a HeyGen.",
    variant: "destructive"
  });
  return;
}
```

**Beneficios:**
- Validación más rápida (no carga lista de avatares)
- Obtiene información útil sobre la quota disponible

---

### Cambio 3: Automatizar Detección de Plan en StyleSelector

**Archivo:** `src/components/video/StyleSelector.tsx`

**Agregar prop para obtener la API key seleccionada:**

```typescript
interface Props {
  onSelectStyle: (...) => void;
  onBack: () => void;
  generatedScript: string;
  aiApiKeys: { openai_api_key: string; gemini_api_key: string };
  selectedApiKey: HeyGenApiKey | null;  // NUEVO
}
```

**Agregar función para detectar plan automáticamente:**

```typescript
const [isDetectingPlan, setIsDetectingPlan] = useState(false);

const detectPlanAndProceed = async (style: VideoStyle) => {
  if (!selectedApiKey) {
    toast.error("No hay clave API seleccionada");
    return;
  }

  setIsDetectingPlan(true);
  
  try {
    // Decodificar la API key
    const apiKey = atob(selectedApiKey.api_key_encrypted);
    
    // Verificar plan con la nueva edge function
    const response = await supabase.functions.invoke('heygen-quota', {
      body: { apiKey }
    });

    if (response.error || !response.data?.isValid) {
      throw new Error("Error verificando plan de API");
    }

    const isPaidVersion = response.data.isPaidPlan;
    
    // Crear apiVersionCustomization automáticamente
    const apiVersionCustomization: ApiVersionCustomization = {
      isPaidVersion,
      width: isPaidVersion ? 1920 : 1280,
      height: isPaidVersion ? 1080 : 720
    };

    console.log('✅ Plan detectado automáticamente:', {
      isPaidVersion,
      resolution: isPaidVersion ? '1920x1080' : '1280x720'
    });

    // Proceder con el estilo seleccionado
    onSelectStyle(
      style, 
      pendingCardCustomization || undefined, 
      pendingPresenterCustomization || undefined,
      apiVersionCustomization
    );

  } catch (error) {
    console.error('Error detectando plan:', error);
    toast.error("Error verificando tu plan de HeyGen. Por favor intenta de nuevo.");
  } finally {
    setIsDetectingPlan(false);
    setPendingStyle(null);
    setPendingCardCustomization(null);
    setPendingPresenterCustomization(null);
  }
};
```

**Modificar handleSelectStyle para usar auto-detección:**

```typescript
const handleSelectStyle = (style: VideoStyle) => {
  setPlayingVideo(null);

  // Estilos manuales van directo sin verificación de plan
  if (style.id === 'style-5' || style.id === 'style-6') {
    onSelectStyle(style);
    return;
  }
  
  // Estilos con personalización de tarjeta
  if (['style-1'].includes(style.id)) {
    setShowCustomizeModal(true);
    setPendingStyle(style);
    return;
  }
  
  // Estilos con nombre de presentador
  if (['style-2'].includes(style.id)) {
    setShowPresenterModal(true);
    setPendingStyle(style);
    return;
  }

  // Para todos los demás estilos, detectar plan automáticamente
  setPendingStyle(style);
  detectPlanAndProceed(style);
};

// Actualizar handlers de modales:
const handleCustomizeConfirm = (customization: CardCustomization) => {
  setPendingCardCustomization(customization);
  setShowCustomizeModal(false);
  // Auto-detectar plan después de personalizar
  if (pendingStyle) {
    detectPlanAndProceed(pendingStyle);
  }
};

const handlePresenterConfirm = (customization: PresenterCustomization) => {
  setPendingPresenterCustomization(customization);
  setShowPresenterModal(false);
  // Auto-detectar plan después de personalizar
  if (pendingStyle) {
    detectPlanAndProceed(pendingStyle);
  }
};
```

**Eliminar uso de ApiVersionModal:**

```typescript
// Remover estado showApiVersionModal
// Remover import de ApiVersionModal
// Remover handleApiVersionConfirm y handleApiVersionCancel
// Remover el componente <ApiVersionModal /> del JSX
```

**Agregar indicador de carga mientras detecta plan:**

```typescript
{isDetectingPlan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card/90 shadow-[0_0_40px_rgba(255,20,147,0.2)]">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-lg font-medium text-foreground">
        Detectando tu plan de HeyGen...
      </p>
      <p className="text-sm text-muted-foreground">
        Esto solo toma un momento
      </p>
    </div>
  </div>
)}
```

---

### Cambio 4: Actualizar ManualUploadModal

Para estilos manuales (style-5, style-6), también necesitamos auto-detectar el plan en lugar de mostrar el modal.

**Archivo:** `src/hooks/useManualUploadFlow.ts`

Agregar función de auto-detección similar que se llame en lugar de mostrar el paso `api-version`.

---

### Cambio 5: Actualizar VideoCreationFlow Props

**Archivo:** `src/pages/VideoCreationFlow.tsx`

Pasar `selectedApiKey` al StyleSelector:

```typescript
<StyleSelector
  onSelectStyle={selectStyle}
  onBack={() => goToStep('neurocopy')}
  generatedScript={flowState.generatedScript || ''}
  aiApiKeys={aiApiKeys}
  selectedApiKey={flowState.selectedApiKey}  // NUEVO
/>
```

---

### Diagrama de Flujo Actualizado

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO ANTERIOR                               │
└─────────────────────────────────────────────────────────────────┘
Usuario ingresa API Key
        ↓
[Edge: heygen-avatars] ← Carga avatares (lento)
        ↓
   ¿Es válida?
        ↓
  Se guarda en BD
        ↓
  ... varios pasos ...
        ↓
  Selecciona Estilo
        ↓
[Modal Manual: "¿Tienes plan de pago?"] ← Usuario puede equivocarse
        ↓
  Continúa flujo

┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO NUEVO                                  │
└─────────────────────────────────────────────────────────────────┘
Usuario ingresa API Key
        ↓
[Edge: heygen-quota] ← Solo verifica quota (rápido)
        ↓
   ¿Es válida?
        ↓
  Se guarda en BD
        ↓
  ... varios pasos ...
        ↓
  Selecciona Estilo
        ↓
[Edge: heygen-quota] ← Auto-detecta plan_credit
        ↓
   ¿Tiene plan_credit?
      Sí → 1920x1080 (HD)
      No → 1280x720 (SD)
        ↓
  Continúa flujo automáticamente
```

---

### Beneficios

1. **Validación más rápida**: El endpoint `/remaining_quota` es más ligero que cargar avatares
2. **Sin errores de usuario**: La detección es automática, elimina la posibilidad de seleccionar el plan incorrecto
3. **Mejor UX**: Un paso menos en el flujo, experiencia más fluida
4. **Datos útiles**: Se puede mostrar la quota disponible al usuario si se desea

---

### Resultado Esperado

1. Al guardar una nueva clave API, se valida con `/remaining_quota` (más rápido)
2. Al seleccionar un estilo, se detecta automáticamente si tiene `plan_credit`
3. Se elimina el modal de "¿Tienes la versión paga?" 
4. La resolución del video se configura automáticamente:
   - **Con plan_credit** → 1920x1080
   - **Sin plan_credit** → 1280x720
5. El flujo es más simple y sin posibilidad de error del usuario

