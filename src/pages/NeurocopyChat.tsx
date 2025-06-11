
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";

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

  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

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

    // Simular respuesta de la IA después de un breve delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Soy NeuroCopy GPT, tu asistente especializado en copywriting. ¿En qué puedo ayudarte con tu contenido?",
        role: 'assistant',
        timestamp: new Date()
      };

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
    }, 1000);
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
          />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default NeurocopyChat;
