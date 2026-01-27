
## Plan: Mejoras de UX en NeuroCopyGenerator y API Keys en CustomizeCardsModal

### Objetivo
Implementar mejoras visuales y de experiencia de usuario en el componente NeuroCopy GPT y agregar la funcionalidad de enviar claves API a la webhook del modal de personalización de tarjetas.

---

### PARTE 1: Mejoras en NeuroCopyGenerator.tsx

#### 1.1 Animación Flotante del Icono

Agregar un keyframe de animación suave de flotación en `tailwind.config.ts`:

```typescript
// Nuevo keyframe
'float': {
  '0%, 100%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' }
}

// Nueva animation
'float': 'float 3s ease-in-out infinite'
```

Aplicar la clase `animate-float` al contenedor del icono en el panel izquierdo.

---

#### 1.2 Título "NeuroCopy GPT" en una sola línea

Cambiar de:
```tsx
<h1 className="text-3xl font-bold text-center">
  NeuroCopy <span className="text-gradient-safe">GPT</span>
</h1>
```

A:
```tsx
<h1 className="text-2xl font-bold text-center whitespace-nowrap">
  NeuroCopy <span className="text-gradient-safe">GPT</span>
</h1>
```

Reducir ligeramente el tamaño y agregar `whitespace-nowrap` para evitar el salto de línea.

---

#### 1.3 Efecto Typewriter para Mensajes

**Nuevo estado y lógica:**

```typescript
const [typingMessageId, setTypingMessageId] = useState<string | null>('welcome');
const [displayedContent, setDisplayedContent] = useState<{ [key: string]: string }>({});
```

**Función de efecto typewriter:**

```typescript
const typeMessage = (messageId: string, fullContent: string, speed: number = 20) => {
  setTypingMessageId(messageId);
  let index = 0;
  
  const interval = setInterval(() => {
    if (index <= fullContent.length) {
      setDisplayedContent(prev => ({
        ...prev,
        [messageId]: fullContent.slice(0, index)
      }));
      index++;
    } else {
      clearInterval(interval);
      setTypingMessageId(null);
    }
  }, speed);
  
  return () => clearInterval(interval);
};
```

**Mensaje de bienvenida con typewriter:**

Al montar el componente, iniciar el efecto typewriter para el mensaje de bienvenida:

```typescript
useEffect(() => {
  const welcomeMessage = 'Hola, soy Neurocopy GPT. Dime qué guión necesitas o pega un enlace para empezar.';
  typeMessage('welcome', welcomeMessage, 30);
}, []);
```

**Respuestas de la IA con typewriter:**

Cuando se recibe una respuesta de la webhook, en lugar de agregar el mensaje completo directamente, iniciar el typewriter:

```typescript
// Después de recibir la respuesta:
const aiMessageId = crypto.randomUUID();
const aiMessage: Message = {
  id: aiMessageId,
  content: script, // Contenido completo guardado
  role: 'assistant',
  timestamp: new Date()
};

setMessages(prev => [...prev, aiMessage]);
typeMessage(aiMessageId, script, 15); // Velocidad más rápida para textos largos
setLastGeneratedScript(script);
```

**Actualizar MessageBubble para usar contenido progresivo:**

```tsx
const MessageBubble = ({ 
  message, 
  displayedContent, 
  isTyping 
}: { 
  message: Message; 
  displayedContent?: string;
  isTyping?: boolean;
}) => {
  const isUser = message.role === 'user';
  const content = displayedContent !== undefined ? displayedContent : message.content;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-3 flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[70%] p-4 rounded-2xl ${
        isUser
          ? 'bg-primary/10 cyber-border'
          : 'bg-card/50 border border-border/30'
      }`}>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {content}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>
      </div>
    </div>
  );
};
```

---

### PARTE 2: API Keys en CustomizeCardsModal

#### 2.1 Pasar API Keys al Modal

**Modificar flujo de datos:**

```text
VideoCreationFlow.tsx
        ↓ (aiApiKeys)
StyleSelector.tsx
        ↓ (aiApiKeys)
CustomizeCardsModal.tsx
        ↓ (enviar en webhook)
```

**VideoCreationFlow.tsx:**

Cargar las API keys del usuario y pasarlas a StyleSelector:

```typescript
// Agregar estado para AI API keys
const [aiApiKeys, setAiApiKeys] = useState({ openai_api_key: '', gemini_api_key: '' });

// useEffect para cargar las keys
useEffect(() => {
  const loadAiApiKeys = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('user_ai_api_keys')
      .select('openai_api_key, gemini_api_key')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setAiApiKeys({
        openai_api_key: data.openai_api_key || '',
        gemini_api_key: data.gemini_api_key || ''
      });
    }
  };
  
  loadAiApiKeys();
}, [user?.id]);

// Pasar a StyleSelector
<StyleSelector
  onSelectStyle={selectStyle}
  onBack={handleBack}
  generatedScript={flowState.generatedScript || ''}
  aiApiKeys={aiApiKeys}  // NUEVO
/>
```

**StyleSelector.tsx:**

Recibir y pasar las API keys:

```typescript
interface Props {
  onSelectStyle: (...) => void;
  onBack: () => void;
  generatedScript: string;
  aiApiKeys: { openai_api_key: string; gemini_api_key: string };  // NUEVO
}

// En el JSX
<CustomizeCardsModal
  isOpen={showCustomizeModal}
  onClose={handleCustomizeCancel}
  onConfirm={handleCustomizeConfirm}
  generatedScript={generatedScript}
  aiApiKeys={aiApiKeys}  // NUEVO
/>
```

**CustomizeCardsModal.tsx:**

Recibir las API keys y enviarlas en la webhook:

```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: CardCustomization) => void;
  generatedScript: string;
  aiApiKeys: { openai_api_key: string; gemini_api_key: string };  // NUEVO
}

const handleCompleteWithAI = async () => {
  setLoadingAI(true);
  
  try {
    const response = await fetch('https://cris.cloude.es/webhook/generador-de-texto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guion: generatedScript,
        openai_api_key: aiApiKeys.openai_api_key,   // NUEVO
        gemini_api_key: aiApiKeys.gemini_api_key    // NUEVO
      })
    });
    
    // ... resto del código
  }
};
```

---

### Resumen de Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `tailwind.config.ts` | Agregar keyframe y animation `float` |
| `src/components/video/NeuroCopyGenerator.tsx` | Animación flotante, título en una línea, efecto typewriter |
| `src/pages/VideoCreationFlow.tsx` | Cargar y pasar AI API keys a StyleSelector |
| `src/components/video/StyleSelector.tsx` | Recibir y pasar AI API keys a CustomizeCardsModal |
| `src/components/video/CustomizeCardsModal.tsx` | Recibir AI API keys y enviarlas en la webhook |

---

### Resultado Visual Esperado

**Panel Izquierdo de NeuroCopyGenerator:**
- Icono con glow flotando suavemente arriba y abajo
- "NeuroCopy GPT" en una sola línea

**Chat:**
- Mensaje de bienvenida aparece letra por letra con cursor parpadeante
- Respuestas de la IA aparecen progresivamente letra por letra
- Fluidez visual mejorada

**Modal de Personalización:**
- Botón "Completar con IA" envía las claves API junto con el guión
