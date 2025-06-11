import React, { useState } from 'react';
import { Plus, MessageSquare, User, Trash2, Edit3, Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chat } from "@/pages/NeurocopyChat";

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat
}) => {
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();

  const handleStartEdit = (chat: Chat) => {
    setEditingChat(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chats.length === 1) {
      // No permitir eliminar el último chat, mejor crear uno nuevo
      onNewChat();
      setTimeout(() => onDeleteChat(chatId), 100);
    } else {
      onDeleteChat(chatId);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center cyber-glow">
            <MessageSquare className="w-4 h-4 text-background" />
          </div>
          <span className="font-bold text-foreground">NeuroCopy GPT</span>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full cyber-border bg-card hover:cyber-glow-intense transition-all duration-300"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <div className="group relative">
                <SidebarMenuButton
                  onClick={() => onChatSelect(chat.id)}
                  isActive={activeChat === chat.id}
                  className="w-full justify-start text-left p-3 rounded-lg hover:bg-accent/10 transition-colors duration-200 pr-20"
                >
                  <MessageSquare className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingChat === chat.id ? (
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(chat.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="h-6 text-xs"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleSaveEdit(chat.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-foreground truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chat.messages.length} mensajes
                        </div>
                      </>
                    )}
                  </div>
                </SidebarMenuButton>
                
                {editingChat !== chat.id && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(chat);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-card/50 cyber-border">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">Usuario</div>
            <div className="text-xs text-muted-foreground">Copywriter Pro</div>
          </div>
        </div>
        
        <Button 
          onClick={handleBackToDashboard}
          variant="outline"
          className="w-full cyber-border hover:cyber-glow-intense"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Regresar al Dashboard
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
