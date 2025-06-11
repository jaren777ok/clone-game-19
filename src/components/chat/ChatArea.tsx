
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Target, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chat, Message } from "@/pages/NeurocopyChat";

interface ChatAreaProps {
  chat?: Chat;
  onSendMessage: (message: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chat, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: Zap, text: "Escribir email de ventas", prompt: "Ayúdame a escribir un email de ventas persuasivo para mi producto" },
    { icon: Target, text: "Crear anuncio publicitario", prompt: "Necesito crear un anuncio publicitario que convierte para redes sociales" },
    { icon: Lightbulb, text: "Generar ideas de contenido", prompt: "Dame ideas creativas de contenido para mi marca" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <h1 className="text-xl font-bold text-foreground flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center cyber-glow mr-3">
            <Zap className="w-4 h-4 text-background" />
          </div>
          NeuroCopy GPT
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inteligencia artificial híbrida para copywriting avanzado
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!chat?.messages || chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl flex items-center justify-center cyber-glow mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¿En qué puedo ayudarte?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Soy tu asistente especializado en copywriting. Puedo ayudarte con emails, anuncios, contenido y mucho más.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 cyber-border hover:cyber-glow-intense transition-all duration-300 group"
                  onClick={() => onSendMessage(action.prompt)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <action.icon className="w-6 h-6 text-primary group-hover:animate-cyber-pulse" />
                    <span className="text-sm font-medium">{action.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground cyber-glow'
                      : 'bg-card cyber-border'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 cyber-border focus:cyber-glow-intense transition-all duration-300"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="cyber-glow hover:cyber-glow-intense transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
