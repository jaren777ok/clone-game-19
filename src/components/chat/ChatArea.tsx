
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Target, Lightbulb, Menu, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Chat, Message } from "@/pages/NeurocopyChat";
import { ImageUploader } from "./ImageUploader";
import { MessageImages } from "./MessageImages";

interface ChatAreaProps {
  chat?: Chat;
  onSendMessage: (message: string, images?: string[]) => void;
  isLoading?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chat, onSendMessage, isLoading = false }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages, isLoading]);

  const handleSend = () => {
    if ((inputMessage.trim() || selectedImages.length > 0) && !isLoading) {
      onSendMessage(inputMessage, selectedImages);
      setInputMessage('');
      setSelectedImages([]);
    }
  };

  const handleQuickAction = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImagesChange = (images: string[]) => {
    setSelectedImages(images);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  const quickActions = [
    { icon: Zap, text: "Escribir email de ventas", prompt: "Ayúdame a escribir un email de ventas persuasivo para mi producto" },
    { icon: Target, text: "Crear anuncio publicitario", prompt: "Necesito crear un anuncio publicitario que convierte para redes sociales" },
    { icon: Lightbulb, text: "Generar ideas de contenido", prompt: "Dame ideas creativas de contenido para mi marca" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center">
          <SidebarTrigger className="mr-3 cyber-border hover:cyber-glow-intense transition-all duration-300">
            <Menu className="w-4 h-4" />
          </SidebarTrigger>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center cyber-glow mr-3">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              NeuroCopy GPT
            </h1>
            <p className="text-sm text-muted-foreground">
              Inteligencia artificial híbrida para copywriting avanzado
            </p>
          </div>
        </div>
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
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isLoading}
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
                  {message.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {/* Mostrar imágenes si las hay */}
                  {message.images && message.images.length > 0 && (
                    <MessageImages images={message.images} />
                  )}
                  
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card cyber-border p-4 rounded-2xl max-w-[70%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">NeuroCopy está pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Image Uploader */}
          <ImageUploader 
            onImagesChange={handleImagesChange}
            disabled={isLoading}
          />
          
          {/* Text Input */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu mensaje aquí..."}
                className="min-h-[44px] max-h-[120px] resize-none cyber-border focus:cyber-glow-intense transition-all duration-300"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={(!inputMessage.trim() && selectedImages.length === 0) || isLoading}
              className="cyber-glow hover:cyber-glow-intense transition-all duration-300 h-[44px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
