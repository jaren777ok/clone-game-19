

## Plan: Rediseño de NeuroCopyGenerator con Layout de Dos Paneles estilo ChatGPT

### Objetivo
Transformar el componente `NeuroCopyGenerator` de un formulario simple a una interfaz de chat tipo ChatGPT con dos paneles: branding (30%) y área de conversación (70%).

---

### Diseño Visual Propuesto

```text
┌──────────────────────────────────┬────────────────────────────────────────────────────────┐
│         PANEL IZQUIERDO          │                  PANEL DERECHO                          │
│            (30%)                 │                    (70%)                                │
├──────────────────────────────────┼────────────────────────────────────────────────────────┤
│                                  │  ┌─ Header ──────────────────────────────────────────┐ │
│      [✨ Logo con glow]          │  │  Conversación con IA                    [🤖]     │ │
│                                  │  └───────────────────────────────────────────────────┘ │
│      NeuroCopy GPT               │                                                         │
│                                  │  ┌─ Área de Mensajes ────────────────────────────────┐ │
│  Inteligencia artificial         │  │                                                    │ │
│  híbrida para copywriting        │  │  [Avatar] Hola, soy Neurocopy GPT.                │ │
│  avanzado                        │  │          Dime qué guión necesitas o pega          │ │
│                                  │  │          un enlace para empezar.                  │ │
│  Describe la copywriting...      │  │                                                    │ │
│  ¡hazlo aún más viral!           │  │              ┌────────────────────────────┐       │ │
│                                  │  │              │ ¡Quiero un guión para...   │       │ │
│  ───────────────────             │  │              └────────────────────────────┘       │ │
│                                  │  │                                                    │ │
│  🎬 Generación de contenido web  │  │  [Avatar] *TÍTULO: NEURO-ECHOES                   │ │
│  🔗 Análisis de contenido web    │  │          PERSONAJES: DETECTIVE KAI...             │ │
│  🚀 Optimización para viralidad  │  │          SINOPSIS: En un futuro...                │ │
│  💬 Agente conversacional        │  │                                                    │ │
│                                  │  └────────────────────────────────────────────────────┘ │
│                                  │                                                         │
│                                  │  ┌─ Input Bar ───────────────────────────────────────┐ │
│                                  │  │ [Escribe tu pregunta, idea o pega enlac...] [▶]  │ │
│                                  │  └───────────────────────────────────────────────────┘ │
│                                  │                                                         │
│                                  │  ┌─ Botón Final ─────────────────────────────────────┐ │
│                                  │  │        [✓ Usar este Guión]                        │ │
│                                  │  └───────────────────────────────────────────────────┘ │
└──────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### Arquitectura de la Conversación

La interfaz mantendrá un historial de mensajes local (sin guardar en Supabase como el chat de NeurocopyChat), pero seguirá el mismo patrón de comunicación con la webhook.

```text
Usuario envía mensaje
         ↓
┌─────────────────────────────┐
│ POST a webhook con:         │
│ - message                   │
│ - sessionid                 │
│ - userId                    │
│ - openai_api_key (NUEVO)    │
│ - gemini_api_key (NUEVO)    │
└─────────────────────────────┘
         ↓
Webhook responde con guión
         ↓
Se muestra en el chat
         ↓
Botón "Usar este Guión" activo
```

---

### Cambios en Archivos

#### 1. `src/components/video/NeuroCopyGenerator.tsx` (REESCRIBIR)

**Nuevos imports:**
```tsx
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Send, Bot, Zap, Link, Rocket, MessageCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
```

**Nuevos estados:**
```tsx
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const [messages, setMessages] = useState<Message[]>([
  {
    id: 'welcome',
    content: 'Hola, soy Neurocopy GPT. Dime qué guión necesitas o pega un enlace para empezar.',
    role: 'assistant',
    timestamp: new Date()
  }
]);
const [inputMessage, setInputMessage] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
const [lastGeneratedScript, setLastGeneratedScript] = useState<string | null>(null);
const [aiApiKeys, setAiApiKeys] = useState({ openai_api_key: '', gemini_api_key: '' });
```

**Cargar API Keys del usuario:**
```tsx
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
```

**Función de envío de mensaje:**
```tsx
const sendMessage = async () => {
  if (!inputMessage.trim() || isGenerating) return;
  
  // Agregar mensaje del usuario
  const userMessage: Message = {
    id: crypto.randomUUID(),
    content: inputMessage,
    role: 'user',
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsGenerating(true);
  
  try {
    const response = await fetch('https://cris.cloude.es/webhook/guion_base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructions: inputMessage,
        Userid: user?.id,
        sessionid: sessionId,
        openai_api_key: aiApiKeys.openai_api_key,
        gemini_api_key: aiApiKeys.gemini_api_key
      })
    });
    
    const data = await response.json();
    const script = data?.[0]?.guion_IA || 'No se pudo generar el guión.';
    
    const aiMessage: Message = {
      id: crypto.randomUUID(),
      content: script,
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setLastGeneratedScript(script);
    
  } catch (error) {
    // Manejo de error
  } finally {
    setIsGenerating(false);
  }
};
```

**Estructura JSX del componente:**

```tsx
return (
  <div className="min-h-screen bg-background flex">
    {/* Panel Izquierdo - Branding (30%) */}
    <div className="w-[30%] border-r border-border/30 p-8 flex flex-col relative">
      {/* Botón Volver */}
      <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
      </Button>
      
      {/* Logo y Título */}
      <div className="flex flex-col items-center mt-16">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold">
          NeuroCopy <span className="text-gradient-safe">GPT</span>
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          Inteligencia artificial híbrida para copywriting avanzado
        </p>
        <p className="text-xs text-muted-foreground/70 text-center mt-3">
          Describe la copywriting, usa videos de la competencia y ¡hazlo aún más viral!
        </p>
      </div>
      
      {/* Separador */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />
      
      {/* Features */}
      <div className="space-y-4">
        <Feature icon={Zap} text="Generación de contenido web" />
        <Feature icon={Link} text="Análisis de contenido web" />
        <Feature icon={Rocket} text="Optimización para viralidad" />
        <Feature icon={MessageCircle} text="Agente conversacional inteligente" />
      </div>
    </div>
    
    {/* Panel Derecho - Chat (70%) */}
    <div className="flex-1 flex flex-col">
      {/* Header del Chat */}
      <div className="border-b border-border/30 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversación con IA</h2>
        <Bot className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isGenerating && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Bar */}
      <div className="border-t border-border/30 p-4">
        <div className="flex items-center gap-3">
          <input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu pregunta, idea o pega un enlace aquí..."
            className="flex-1 h-12 px-4 rounded-lg bg-card cyber-border focus:cyber-glow"
            disabled={isGenerating}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isGenerating}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Botón Usar Guión (visible cuando hay script) */}
      {lastGeneratedScript && (
        <div className="border-t border-border/30 p-4">
          <Button
            onClick={() => onUseScript(lastGeneratedScript)}
            className="w-full h-14 bg-gradient-to-r from-primary to-accent cyber-glow text-lg"
          >
            <Check className="w-6 h-6 mr-3" />
            Usar este Guión
          </Button>
        </div>
      )}
    </div>
  </div>
);
```

---

### Componentes Internos Auxiliares

**Feature (para el panel izquierdo):**
```tsx
const Feature = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-3 text-muted-foreground">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <span className="text-sm">{text}</span>
  </div>
);
```

**MessageBubble (para los mensajes):**
```tsx
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
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
          : 'bg-card/50'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};
```

**TypingIndicator (animación "escribiendo..."):**
```tsx
const TypingIndicator = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="flex items-center gap-1 text-primary">
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);
```

---

### Resumen de Cambios

| Archivo | Acción |
|---------|--------|
| `src/components/video/NeuroCopyGenerator.tsx` | Reescribir completamente con layout de 2 paneles |
| `src/lib/neurocopyUtils.ts` | Mantener sin cambios (seguimos usando la misma webhook) |

---

### Datos Enviados a la Webhook

El payload actualizado incluirá:

```json
{
  "instructions": "mensaje del usuario",
  "Userid": "uuid-del-usuario",
  "sessionid": "app_session_uuid_timestamp",
  "openai_api_key": "sk-...",
  "gemini_api_key": "AIza..."
}
```

---

### Funcionalidades Mantenidas

1. **Session ID**: Se mantiene el `useSession()` hook para tracking de conversación
2. **User ID**: Se sigue enviando para identificación
3. **Webhook**: Misma URL `https://cris.cloude.es/webhook/guion_base`
4. **Botón "Usar este Guión"**: Aparece cuando hay un script generado
5. **Navegación**: El botón "Volver a estilos" sigue funcionando

---

### Beneficios del Nuevo Diseño

1. Interfaz más profesional y moderna estilo ChatGPT
2. Historial de conversación visible durante la sesión
3. Branding prominente que refuerza la identidad del producto
4. Separación visual clara entre información y acción
5. Experiencia de usuario más intuitiva para conversación con IA

