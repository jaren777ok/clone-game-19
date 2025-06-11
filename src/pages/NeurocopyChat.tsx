
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const NeurocopyChat = () => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [activeChat, setActiveChat] = useState<string>('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    // Agregar mensaje del usuario inmediatamente
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChat) {
        const updatedMessages = [...chat.messages, newMessage];
        return {
          ...chat,
          messages: updatedMessages,
          title: updatedMessages.length === 1 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : chat.title,
          updatedAt: new Date()
        };
      }
      return chat;
    }));

    try {
      // Enviar mensaje al webhook de n8n
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/NeuroCopy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          chatId: activeChat,
          timestamp: new Date().toISOString(),
          userId: 'user-1' // ID temporal del usuario
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Crear mensaje de respuesta de la IA
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.message || "Lo siento, no pude procesar tu mensaje en este momento.",
        role: 'assistant',
        timestamp: new Date()
      };

      // Agregar respuesta de la IA
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, aiResponse],
            updatedAt: new Date()
          };
        }
        return chat;
      }));

    } catch (error) {
      console.error('Error al enviar mensaje al webhook:', error);
      
      // Mostrar mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, hubo un problema al conectar con la IA. Por favor, intenta de nuevo.",
        role: 'assistant',
        timestamp: new Date()
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, errorMessage],
            updatedAt: new Date()
          };
        }
        return chat;
      }));

      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la IA. Verifica tu conexión e intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <SidebarProvider defaultOpen={sidebarOpen}>
        <ChatSidebar 
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={createNewChat}
        />
        <main className="flex-1 flex flex-col">
          <ChatArea 
            chat={currentChat}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default NeurocopyChat;
