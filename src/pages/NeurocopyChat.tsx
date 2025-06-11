import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChats } from "@/hooks/useChats";
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

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
  const { user, loading: authLoading } = useAuth();
  const { chats, loading: chatsLoading, setChats, saveChat, updateChat, deleteChat, saveMessage } = useChats();
  const [activeChat, setActiveChat] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirigir a auth si no hay usuario
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Seleccionar el primer chat cuando se cargan
  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id);
      console.log('Chat activo establecido:', chats[0].id);
    }
  }, [chats, activeChat]);

  // Validar que el chat activo existe
  const validateActiveChat = () => {
    if (!activeChat) {
      console.error('No hay chat activo');
      return false;
    }
    
    const chatExists = chats.find(chat => chat.id === activeChat);
    if (!chatExists) {
      console.error('El chat activo no existe en la lista de chats:', activeChat);
      return false;
    }
    
    console.log('Chat activo validado correctamente:', activeChat);
    return true;
  };

  const createNewChat = async () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creando nuevo chat:', newChat.id);
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    
    // Guardar en Supabase
    await saveChat(newChat);
  };

  const handleDeleteChat = async (chatId: string) => {
    console.log('Eliminando chat:', chatId);
    
    // Eliminar de Supabase primero
    await deleteChat(chatId);
    
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
        console.log('Creando nuevo chat después de eliminar el último:', newChat.id);
        setActiveChat(newChat.id);
        // Guardar el nuevo chat en Supabase
        saveChat(newChat);
        return [newChat];
      }
      
      // Si se elimina el chat activo, seleccionar el primero disponible
      if (chatId === activeChat) {
        console.log('Chat activo eliminado, seleccionando nuevo chat activo:', filteredChats[0].id);
        setActiveChat(filteredChats[0].id);
      }
      
      return filteredChats;
    });

    toast({
      title: "Chat eliminado",
      description: "El chat ha sido eliminado correctamente.",
    });
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    if (newTitle.trim() === '') return;
    
    console.log('Renombrando chat:', chatId, 'nuevo título:', newTitle);
    const updatedAt = new Date();
    
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          title: newTitle.trim(),
          updatedAt
        };
      }
      return chat;
    }));

    // Actualizar en Supabase
    await updateChat(chatId, { title: newTitle.trim(), updatedAt });

    toast({
      title: "Chat renombrado",
      description: "El nombre del chat ha sido actualizado.",
    });
  };

  const sendMessage = async (content: string) => {
    // Validar que hay un chat activo antes de proceder
    if (!validateActiveChat()) {
      toast({
        title: "Error",
        description: "No hay un chat activo. Por favor, crea un nuevo chat.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('=== INICIANDO ENVÍO DE MENSAJE ===');
    console.log('Chat activo:', activeChat);
    console.log('Usuario ID:', user?.id);
    console.log('Contenido del mensaje:', content);
    
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
        const updatedChat = {
          ...chat,
          messages: updatedMessages,
          title: updatedMessages.length === 1 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : chat.title,
          updatedAt: new Date()
        };
        
        console.log('Chat actualizado con mensaje de usuario:', updatedChat.id);
        
        // Guardar mensaje y actualizar chat en Supabase
        saveMessage(activeChat, newMessage);
        if (updatedMessages.length === 1) {
          updateChat(activeChat, { title: updatedChat.title, updatedAt: updatedChat.updatedAt });
        }
        
        return updatedChat;
      }
      return chat;
    }));

    try {
      const webhookPayload = {
        message: content,
        chatId: activeChat,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        messageId: newMessage.id
      };

      console.log('Payload enviado al webhook:', JSON.stringify(webhookPayload, null, 2));
      
      const response = await fetch('https://primary-production-f0d1.up.railway.app/webhook-test/NeuroCopy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta completa del webhook:', JSON.stringify(data, null, 2));

      // Validar que la respuesta contenga el chatId correcto
      let receivedChatId = null;
      if (Array.isArray(data) && data.length > 0 && data[0].chatId) {
        receivedChatId = data[0].chatId;
      } else if (data.chatId) {
        receivedChatId = data.chatId;
      }

      if (receivedChatId && receivedChatId !== activeChat) {
        console.warn('⚠️  ChatId recibido no coincide con el enviado!');
        console.warn('Enviado:', activeChat);
        console.warn('Recibido:', receivedChatId);
      } else if (receivedChatId) {
        console.log('✅ ChatId validado correctamente:', receivedChatId);
      } else {
        console.warn('⚠️  No se recibió chatId en la respuesta del webhook');
      }

      let aiResponseContent = '';
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        aiResponseContent = data[0].output;
        console.log('Contenido extraído de data[0].output:', aiResponseContent);
      } else if (data.response) {
        aiResponseContent = data.response;
        console.log('Contenido extraído de data.response:', aiResponseContent);
      } else if (data.message) {
        aiResponseContent = data.message;
        console.log('Contenido extraído de data.message:', aiResponseContent);
      } else if (typeof data === 'string') {
        aiResponseContent = data;
        console.log('Contenido extraído como string directo:', aiResponseContent);
      } else {
        console.log('Formato de respuesta no reconocido:', data);
        aiResponseContent = "Lo siento, recibí una respuesta pero no pude procesarla correctamente.";
      }

      if (!aiResponseContent || aiResponseContent.trim() === '') {
        console.log('Contenido de respuesta vacío o inválido');
        aiResponseContent = "Lo siento, la IA no generó una respuesta válida.";
      }
      
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      console.log('Mensaje de IA creado:', aiResponse);

      // Verificar nuevamente que el chat activo sigue siendo válido
      if (!validateActiveChat()) {
        console.error('Chat activo no válido al recibir respuesta de IA');
        return;
      }

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChat) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, aiResponse],
            updatedAt: new Date()
          };
          console.log('Chat actualizado con respuesta de IA:', updatedChat.id);
          
          // Guardar mensaje de IA en Supabase
          saveMessage(activeChat, aiResponse);
          
          return updatedChat;
        }
        return chat;
      }));

      console.log('✅ Mensaje procesado exitosamente');

    } catch (error) {
      console.error('❌ Error al enviar mensaje al webhook:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Lo siento, hubo un problema al conectar con la IA. Por favor, intenta de nuevo.",
        role: 'assistant',
        timestamp: new Date()
      };

      // Verificar que el chat activo sigue siendo válido antes de agregar mensaje de error
      if (validateActiveChat()) {
        setChats(prev => prev.map(chat => {
          if (chat.id === activeChat) {
            const updatedChat = {
              ...chat,
              messages: [...chat.messages, errorMessage],
              updatedAt: new Date()
            };
            
            // Guardar mensaje de error en Supabase
            saveMessage(activeChat, errorMessage);
            
            return updatedChat;
          }
          return chat;
        }));
      }

      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la IA. Verifica tu conexión e intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      console.log('=== FINALIZANDO ENVÍO DE MENSAJE ===');
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (authLoading || chatsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (se redirige en useEffect)
  if (!user) {
    return null;
  }

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <SidebarProvider defaultOpen={true}>
        <ChatSidebar 
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={createNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
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
