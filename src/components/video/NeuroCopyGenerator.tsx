
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Sparkles, Send, Bot, Zap, Link, Rocket, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onBack: () => void;
  onUseScript: (script: string) => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Feature component for the left panel
const Feature = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-3 text-muted-foreground">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <span className="text-sm">{text}</span>
  </div>
);

// Message bubble component with typewriter support
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
          {isTyping && <span className="animate-pulse text-primary">|</span>}
        </p>
      </div>
    </div>
  );
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-card/50 border border-border/30">
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const NeuroCopyGenerator: React.FC<Props> = ({ onBack, onUseScript }) => {
  const welcomeMessageContent = 'Hola, soy Neurocopy GPT. Dime qué guión necesitas o pega un enlace para empezar.';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: welcomeMessageContent,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedScript, setLastGeneratedScript] = useState<string | null>(null);
  const [aiApiKeys, setAiApiKeys] = useState({ openai_api_key: '', gemini_api_key: '' });
  
  // Typewriter effect states
  const [typingMessageId, setTypingMessageId] = useState<string | null>('welcome');
  const [displayedContent, setDisplayedContent] = useState<{ [key: string]: string }>({});
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { sessionId } = useSession();

  // Typewriter effect function
  const typeMessage = useCallback((messageId: string, fullContent: string, speed: number = 25) => {
    setTypingMessageId(messageId);
    let index = 0;
    
    // Clear any existing interval
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    
    typewriterRef.current = setInterval(() => {
      if (index <= fullContent.length) {
        setDisplayedContent(prev => ({
          ...prev,
          [messageId]: fullContent.slice(0, index)
        }));
        index++;
      } else {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current);
          typewriterRef.current = null;
        }
        setTypingMessageId(null);
        // Set final content
        setDisplayedContent(prev => ({
          ...prev,
          [messageId]: fullContent
        }));
      }
    }, speed);
  }, []);

  // Welcome message typewriter effect
  useEffect(() => {
    typeMessage('welcome', welcomeMessageContent, 30);
    
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, [typeMessage]);

  // Load user's AI API keys
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, displayedContent]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    // Immediately show user message (no typewriter for user messages)
    setDisplayedContent(prev => ({
      ...prev,
      [userMessage.id]: userMessage.content
    }));
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsGenerating(true);
    
    try {
      console.log('Enviando mensaje a NeuroCopy GPT con SessionID:', sessionId);
      
      const response = await fetch('https://cris.cloude.es/webhook/guion_base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructions: currentInput,
          Userid: user?.id,
          sessionid: sessionId,
          openai_api_key: aiApiKeys.openai_api_key,
          gemini_api_key: aiApiKeys.gemini_api_key
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta de NeuroCopy GPT:', data);
      
      const script = data?.[0]?.guion_IA || 'No se pudo generar el guión. Por favor, intenta de nuevo.';
      
      const aiMessageId = crypto.randomUUID();
      const aiMessage: Message = {
        id: aiMessageId,
        content: script,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLastGeneratedScript(script);
      
      // Start typewriter effect for AI response (faster speed for long texts)
      const typeSpeed = script.length > 500 ? 10 : 15;
      typeMessage(aiMessageId, script, typeSpeed);
      
      toast({
        title: "¡Guión generado!",
        description: "Tu guión ha sido creado exitosamente.",
      });
      
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessageId = crypto.randomUUID();
      const errorMessage: Message = {
        id: errorMessageId,
        content: 'Lo siento, hubo un error al generar el guión. Por favor, intenta de nuevo.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      typeMessage(errorMessageId, errorMessage.content, 20);
      
      toast({
        title: "Error al generar guión",
        description: "No se pudo generar el guión. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panel Izquierdo - Branding (30%) */}
      <div className="w-[30%] min-w-[280px] max-w-[400px] border-r border-border/30 p-8 flex flex-col relative bg-card/20">
        {/* Botón Volver */}
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="absolute top-4 left-4 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> 
          Volver
        </Button>
        
        {/* Logo y Título */}
        <div className="flex flex-col items-center mt-20">
          {/* Icono con animación flotante */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mb-6 animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          {/* Título en una sola línea */}
          <h1 className="text-2xl font-bold text-center whitespace-nowrap">
            NeuroCopy <span className="text-gradient-safe">GPT</span>
          </h1>
          <p className="text-muted-foreground text-center mt-3 text-sm">
            Inteligencia artificial híbrida para copywriting avanzado
          </p>
          <p className="text-xs text-muted-foreground/70 text-center mt-4 px-4">
            💡 Describe tu idea, usa videos de la competencia y ¡hazlo aún más viral!
          </p>
        </div>
        
        {/* Separador con gradiente */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />
        
        {/* Features */}
        <div className="space-y-4 flex-1">
          <Feature icon={Zap} text="Generación de guiones creativos" />
          <Feature icon={Link} text="Análisis de contenido web" />
          <Feature icon={Rocket} text="Optimización para viralidad" />
          <Feature icon={MessageCircle} text="Agente conversacional inteligente" />
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      </div>
      
      {/* Panel Derecho - Chat (70%) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header del Chat */}
        <div className="border-b border-border/30 p-4 flex items-center justify-between bg-card/10">
          <h2 className="text-lg font-semibold">Conversación con IA</h2>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        {/* Área de Mensajes */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 pb-4">
            {messages.map(message => (
              <MessageBubble 
                key={message.id} 
                message={message}
                displayedContent={displayedContent[message.id]}
                isTyping={typingMessageId === message.id}
              />
            ))}
            
            {isGenerating && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Botón Usar Guión (visible cuando hay script y no está escribiendo) */}
        {lastGeneratedScript && !typingMessageId && (
          <div className="border-t border-border/30 p-4 bg-card/10">
            <Button
              onClick={() => onUseScript(lastGeneratedScript)}
              className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 cyber-glow text-lg font-semibold transition-transform duration-200 hover:scale-[1.02]"
            >
              <Check className="w-6 h-6 mr-3" />
              Usar este Guión
            </Button>
          </div>
        )}
        
        {/* Input Bar */}
        <div className="border-t border-border/30 p-4 bg-card/20">
          <div className="flex items-center gap-3">
            <input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta, idea o pega un enlace aquí..."
              className="flex-1 h-12 px-4 rounded-xl bg-background cyber-border focus:cyber-glow outline-none transition-all duration-200 text-sm"
              disabled={isGenerating}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isGenerating}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-[30%] w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default NeuroCopyGenerator;
