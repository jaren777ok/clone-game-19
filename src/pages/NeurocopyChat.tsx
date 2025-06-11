
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
      id: crypto.randomUUID(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [activeChat, setActiveChat] = useState<string>(chats[0]?.id || '');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const filteredChats = prev.filter(chat => chat.id !== chatId);
      
      // Si no quedan chats, crear uno nuevo
      if (filteredChats.length === 0) {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          title: 'Nueva conversación',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setActiveChat(newChat.id);
        return [newChat];
      }
      
      // Si se elimina el chat activo, seleccionar el primero disponible
      if (chatId === activeChat) {
        setActiveChat(filteredChats[0].id);
      }
      
      return filteredChats;
    });

    toast({
      title: "Chat eliminado",
      description: "El chat ha sido eliminado correctamente.",
    });
  };

  const renameChat = (chatId: string, newTitle: string) => {
    if (newTitle.trim() === '') return;
    
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          title: newTitle.trim(),
          updatedAt: new Date()
        };
      }
      return chat;
    }));

    toast({
      title: "Chat renombrado",
      description: "El nombre del chat ha sido actualizado.",
    });
  };

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
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
      console.log('Enviando mensaje al webhook:', content);
      
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
      console.log('Respuesta completa del webhook:', data);

      // Extraer el contenido de la respuesta - probando diferentes formatos
      let aiResponseContent = '';
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        // Formato: [{"output": "contenido..."}]
        aiResponseContent = data[0].output;
        console.log('Contenido extraído de data[0].output:', aiResponseContent);
      } else if (data.response) {
        // Formato: {"response": "contenido..."}
        aiResponseContent = data.response;
        console.log('Contenido extraído de data.response:', aiResponseContent);
      } else if (data.message) {
        // Formato: {"message": "contenido..."}
        aiResponseContent = data.message;
        console.log('Contenido extraído de data.message:', aiResponseContent);
      } else if (typeof data === 'string') {
        // Formato: string directo
        aiResponseContent = data;
        console.log('Contenido extraído como string directo:', aiResponseContent);
      } else {
        console.log('Formato de respuesta no reconocido:', data);
        aiResponseContent = "Lo siento, recibí una respuesta pero no pude procesarla correctamente.";
      }

      // Validar que tenemos contenido válido
      if (!aiResponseContent || aiResponseContent.trim() === '') {
        console.log('Contenido de respuesta vacío o inválido');
        aiResponseContent = "Lo siento, la IA no generó una respuesta válida.";
      }
      
      // Crear mensaje de respuesta de la IA
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      console.log('Mensaje de IA creado:', aiResponse);

      // Agregar respuesta de la IA
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChat) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, aiResponse],
            updatedAt: new Date()
          };
          console.log('Chat actualizado con respuesta de IA:', updatedChat);
          return updatedChat;
        }
        return chat;
      }));

    } catch (error) {
      console.error('Error al enviar mensaje al webhook:', error);
      
      // Mostrar mensaje de error
      const errorMessage: Message = {
        id: crypto.randomUUID(),
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
      console.log('Finalizando sendMessage, estableciendo isLoading a false');
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
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
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
